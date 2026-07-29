// Cloudflare Worker 진입점
// "/api/chat" 요청은 직접 처리하고, 그 외 요청은 정적 자산(ASSETS)으로 위임합니다.
import { buildSystemPrompt } from "./systemPrompt";

interface Env {
  OPENAI_API_KEY: string;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

type ChatTurn = { role: "user" | "assistant"; content: string };

interface ChatRequestBody {
  topicId: string;
  history: ChatTurn[];
  userMessage: string;
}

// 외부 입력값은 반드시 검증합니다 (보안 원칙) / Always validate external input.
function isValidChatRequest(body: unknown): body is ChatRequestBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;

  if (typeof b.topicId !== "string" || b.topicId.length === 0 || b.topicId.length > 100) {
    return false;
  }
  if (typeof b.userMessage !== "string" || b.userMessage.length === 0 || b.userMessage.length > 1000) {
    return false;
  }
  if (!Array.isArray(b.history) || b.history.length > 40) {
    return false;
  }
  for (const turn of b.history) {
    if (typeof turn !== "object" || turn === null) return false;
    const t = turn as Record<string, unknown>;
    if (t.role !== "user" && t.role !== "assistant") return false;
    if (typeof t.content !== "string" || t.content.length > 2000) return false;
  }
  return true;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleChat(request: Request, env: Env): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "잘못된 요청 형식입니다." }, 400);
  }

  if (!isValidChatRequest(payload)) {
    return jsonResponse({ error: "잘못된 요청 형식입니다." }, 400);
  }

  const { topicId, history, userMessage } = payload;

  const systemPrompt = buildSystemPrompt(topicId);
  if (!systemPrompt) {
    return jsonResponse({ error: "존재하지 않는 주제입니다." }, 400);
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // 프로토타입 기본 모델. 대화 품질이 부족하면 gpt-4o로 교체
        max_tokens: 300,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!openaiRes.ok) {
      if (openaiRes.status === 429) {
        return jsonResponse({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }, 429);
      }
      if (openaiRes.status === 401) {
        console.error("[chat] Authentication error - OPENAI_API_KEY를 확인하세요.");
        return jsonResponse({ error: "서버 설정 오류입니다." }, 500);
      }
      const errorBody = await openaiRes.text();
      console.error("[chat] OpenAI API error:", openaiRes.status, errorBody);
      return jsonResponse({ error: "일시적인 오류가 발생했습니다." }, 500);
    }

    const data = (await openaiRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = data.choices?.[0]?.message?.content ?? "";

    return jsonResponse({ reply });
  } catch (error) {
    console.error("[chat] Unexpected error:", error);
    return jsonResponse({ error: "일시적인 오류가 발생했습니다." }, 500);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
