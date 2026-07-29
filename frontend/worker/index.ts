// Cloudflare Worker 진입점
// "/api/chat" 요청은 직접 처리하고, 그 외 요청은 정적 자산(ASSETS)으로 위임합니다.
import { buildSystemPrompt } from "./systemPrompt";
import { isValidLevelId, DEFAULT_LEVEL_ID } from "../shared/levels";
import { resolveModel } from "../shared/models";

// wrangler.toml에서 실제 쓰는 메서드만 최소로 선언 (별도 타입 패키지 미사용 컨벤션 유지)
interface D1PreparedStatement {
  run(): Promise<unknown>;
  all<T = unknown>(): Promise<{ results: T[] }>;
}
interface D1Database {
  prepare(query: string): {
    bind(...values: unknown[]): D1PreparedStatement;
  };
}

interface Env {
  OPENAI_API_KEY: string;
  ADMIN_PASSWORD: string;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  engchat_feedback: D1Database;
}

type ChatTurn = { role: "user" | "assistant"; content: string };

interface ChatRequestBody {
  topicId: string;
  history: ChatTurn[];
  userMessage: string;
  levelId?: string;
  modelKey?: string;
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
  if (b.levelId !== undefined && (typeof b.levelId !== "string" || b.levelId.length > 20)) {
    return false;
  }
  if (b.modelKey !== undefined && b.modelKey !== "basic" && b.modelKey !== "advanced") {
    return false;
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

  const { topicId, history, userMessage, levelId, modelKey } = payload;

  const resolvedLevelId = isValidLevelId(levelId) ? levelId : DEFAULT_LEVEL_ID;
  const systemPrompt = buildSystemPrompt(topicId, resolvedLevelId);
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
        model: resolveModel(modelKey), // 화이트리스트 강제: "gpt-4o-mini" 또는 "gpt-4o"만 나올 수 있음
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

interface FeedbackRequestBody {
  message: string;
}

function isValidFeedbackRequest(body: unknown): body is FeedbackRequestBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  if (typeof b.message !== "string") return false;
  const trimmed = b.message.trim();
  return trimmed.length > 0 && trimmed.length <= 2000;
}

async function handleFeedback(request: Request, env: Env): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "잘못된 요청 형식입니다." }, 400);
  }

  if (!isValidFeedbackRequest(payload)) {
    return jsonResponse({ error: "잘못된 요청 형식입니다." }, 400);
  }

  try {
    // 파라미터 바인딩(?) 사용 - SQL Injection 방지 (문자열 결합 금지)
    await env.engchat_feedback
      .prepare("INSERT INTO feedback (message) VALUES (?)")
      .bind(payload.message.trim())
      .run();
    return jsonResponse({ ok: true }, 201);
  } catch (error) {
    // 피드백 원문은 로그에 남기지 않고 에러 객체만 남깁니다 (불필요한 개인 텍스트 노출 방지).
    console.error("[feedback] DB error:", error);
    return jsonResponse({ error: "일시적인 오류가 발생했습니다." }, 500);
  }
}

// /admin 보호용 HTTP Basic Auth. 아이디는 검사하지 않고 비밀번호만 ADMIN_PASSWORD와 비교합니다.
function isAdminAuthorized(request: Request, env: Env): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) return false;

  let decoded: string;
  try {
    decoded = atob(authHeader.slice("Basic ".length));
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");
  const password = separatorIndex === -1 ? decoded : decoded.slice(separatorIndex + 1);
  return password.length > 0 && password === env.ADMIN_PASSWORD;
}

function requireBasicAuth(): Response {
  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function handleAdmin(request: Request, env: Env): Promise<Response> {
  if (!isAdminAuthorized(request, env)) {
    return requireBasicAuth();
  }

  const { results } = await env.engchat_feedback
    .prepare("SELECT id, message, created_at FROM feedback ORDER BY id DESC LIMIT 200")
    .bind()
    .all<{ id: number; message: string; created_at: string }>();

  const rows = results
    .map(
      (row) => `<tr>
        <td>${row.id}</td>
        <td>${escapeHtml(row.created_at)}</td>
        <td style="white-space: pre-wrap;">${escapeHtml(row.message)}</td>
      </tr>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>피드백 목록</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; vertical-align: top; }
    th { background: #f4f4f4; }
  </style>
</head>
<body>
  <h1>피드백 목록 (${results.length}건)</h1>
  <table>
    <thead><tr><th>ID</th><th>보낸 시각</th><th>내용</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env);
    }
    if (url.pathname === "/api/feedback" && request.method === "POST") {
      return handleFeedback(request, env);
    }
    if (url.pathname === "/admin" && request.method === "GET") {
      return handleAdmin(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
