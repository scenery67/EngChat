// /api/feedback 호출 함수 / Feedback API client
interface FeedbackErrorResponse {
  error: string;
}

export async function sendFeedback(message: string): Promise<void> {
  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as FeedbackErrorResponse | null;
    throw new Error(errorBody?.error ?? "피드백 전송 중 오류가 발생했습니다.");
  }
}
