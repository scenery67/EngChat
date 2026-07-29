// 대화 화면 - 아바타 + 자막 + 마이크 버튼
import { useCallback, useState } from "react";
import { AvatarCharacter, type AvatarState } from "./AvatarCharacter";
import { MicButton } from "./MicButton";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { sendChatMessage, type ChatTurn } from "../api/chatApi";
import { TOPICS } from "../curriculum/topics";
import { useSettings } from "../settings/useSettings";

interface ChatScreenProps {
  topicId: string;
  onExit: () => void;
}

export function ChatScreen({ topicId, onExit }: ChatScreenProps) {
  const topic = TOPICS.find((t) => t.id === topicId);
  const { settings } = useSettings();
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [subtitle, setSubtitle] = useState("마이크를 누르고 있는 동안 영어로 말해보세요!");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isSupported: isSttSupported, isListening, startListening, stopListening } =
    useSpeechRecognition();
  const { isSupported: isTtsSupported, isSpeaking, speak } = useSpeechSynthesis(
    settings.ttsRate,
    settings.voiceURI
  );

  const handleUserMessage = useCallback(
    async (userMessage: string) => {
      setErrorMessage(null);
      setSubtitle(`나: ${userMessage}`);
      setIsSending(true);
      try {
        const reply = await sendChatMessage(
          topicId,
          history,
          userMessage,
          settings.levelId,
          settings.modelKey
        );
        setHistory((prev) => [
          ...prev,
          { role: "user", content: userMessage },
          { role: "assistant", content: reply },
        ]);
        setSubtitle(`Buddy: ${reply}`);
        speak(reply);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "오류가 발생했습니다.");
      } finally {
        setIsSending(false);
      }
    },
    [history, speak, topicId, settings.levelId, settings.modelKey]
  );

  const handleMicPress = () => {
    if (!isSttSupported) {
      setErrorMessage("이 브라우저는 음성 인식을 지원하지 않아요. Chrome을 사용해주세요.");
      return;
    }
    setErrorMessage(null);
    startListening((transcript) => {
      void handleUserMessage(transcript);
    });
  };

  const avatarState: AvatarState = isSpeaking ? "speaking" : isListening ? "listening" : "idle";
  const isMicDisabled = isSending || isSpeaking;

  return (
    <div className="flex flex-col items-center gap-6 p-8 min-h-screen justify-center">
      <button type="button" onClick={onExit} className="self-start text-blue-500 underline">
        ← 주제 다시 고르기
      </button>
      <h2 className="text-xl font-bold text-gray-700">
        {topic?.emoji} {topic?.titleKo ?? ""}
      </h2>
      <AvatarCharacter state={avatarState} />
      <p className="max-w-md min-h-14 text-center text-lg text-gray-700">{subtitle}</p>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <MicButton
        disabled={isMicDisabled}
        isListening={isListening}
        onPress={handleMicPress}
        onRelease={stopListening}
      />
      {!isTtsSupported && (
        <p className="text-sm text-gray-400">
          이 브라우저는 음성 출력을 지원하지 않아 텍스트로만 표시돼요.
        </p>
      )}
    </div>
  );
}
