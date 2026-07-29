// /api/chat 호출 함수 / Chat API client
// Cloudflare Pages Function이 프론트엔드와 같은 도메인에서 서빙되므로 상대경로로 호출합니다.
export type ChatTurn = { role: "user" | "assistant"; content: string };

interface ChatSuccessResponse {
  reply: string;
}

interface ChatErrorResponse {
  error: string;
}

export async function sendChatMessage(
  topicId: string,
  history: ChatTurn[],
  userMessage: string
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topicId, history, userMessage }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ChatErrorResponse | null;
    throw new Error(errorBody?.error ?? "서버와 통신 중 오류가 발생했습니다.");
  }

  const data = (await response.json()) as ChatSuccessResponse;
  return data.reply;
}
