// 피드백 화면 - 자유 텍스트로 의견을 남길 수 있는 화면
import { useState } from "react";
import { sendFeedback } from "../api/feedbackApi";

interface FeedbackScreenProps {
  onExit: () => void;
}

const MAX_LENGTH = 2000;

export function FeedbackScreen({ onExit }: FeedbackScreenProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (trimmed.length === 0) return;

    setIsSending(true);
    setStatus("idle");
    setErrorMessage(null);
    try {
      await sendFeedback(trimmed);
      setMessage("");
      setStatus("sent");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 min-h-screen">
      <div className="w-full max-w-xl flex items-center">
        <button type="button" onClick={onExit} className="text-blue-500 underline">
          ← 뒤로 가기
        </button>
      </div>
      <h1 className="text-2xl font-bold text-gray-800">피드백 보내기</h1>
      <p className="text-gray-600 text-center max-w-xl">
        앱을 쓰면서 느낀 점이나 개선했으면 하는 부분을 자유롭게 남겨주세요.
      </p>

      <div className="w-full max-w-xl">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
          maxLength={MAX_LENGTH}
          rows={6}
          placeholder="여기에 의견을 적어주세요"
          className="w-full p-4 rounded-2xl border-4 border-gray-200 focus:border-blue-400 outline-none resize-none"
        />
        <p className="text-right text-sm text-gray-400 mt-1">
          {message.length} / {MAX_LENGTH}
        </p>
      </div>

      {status === "sent" && <p className="text-green-600 font-bold">피드백이 전달됐어요. 고마워요!</p>}
      {status === "error" && errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={isSending || message.trim().length === 0}
        className={`px-8 py-4 rounded-2xl text-white text-lg font-bold ${
          isSending || message.trim().length === 0
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 active:scale-95"
        }`}
      >
        {isSending ? "보내는 중..." : "보내기"}
      </button>
    </div>
  );
}
