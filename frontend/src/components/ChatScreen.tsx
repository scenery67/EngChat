// 대화 화면 - 아바타 + 자막 + 마이크 버튼
import { useCallback, useState } from "react";
import { AvatarCharacter, type AvatarState } from "./AvatarCharacter";
import { MicButton } from "./MicButton";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { useOpenAiSpeech } from "../hooks/useOpenAiSpeech";
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
  const [subtitle, setSubtitle] = useState(
    settings.micMode === "hold"
      ? "마이크를 누르고 있는 동안 영어로 말해보세요!"
      : "마이크를 눌러서 영어로 말해보세요!"
  );
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isSupported: isSttSupported, isListening, startListening, stopListening } =
    useSpeechRecognition();
  // React 훅 규칙상 조건부로 훅을 호출할 수 없어서, 두 훅을 항상 호출해두고 설정값에 따라
  // 실제 사용할 쪽만 골라 씁니다.
  const browserSpeech = useSpeechSynthesis(settings.ttsRate, settings.voiceURI);
  const openAiSpeech = useOpenAiSpeech(settings.ttsRate, settings.openAiVoice);
  const { isSupported: isTtsSupported, isSpeaking, speak } = settings.useOpenAiTts
    ? openAiSpeech
    : browserSpeech;

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
          settings.modelKey,
          settings.aiName
        );
        setHistory((prev) => [
          ...prev,
          { role: "user", content: userMessage },
          { role: "assistant", content: reply },
        ]);
        setSubtitle(`${settings.aiName}: ${reply}`);
        speak(reply);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "오류가 발생했습니다.");
      } finally {
        setIsSending(false);
      }
    },
    [history, speak, topicId, settings.levelId, settings.modelKey, settings.aiName]
  );

  const beginListening = () => {
    if (!isSttSupported) {
      setErrorMessage("이 브라우저는 음성 인식을 지원하지 않아요. Chrome을 사용해주세요.");
      return;
    }
    setErrorMessage(null);
    startListening((transcript) => {
      void handleUserMessage(transcript);
    });
  };

  // toggle 모드: 한 번 누르면 시작, 다시 누르면 종료
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      return;
    }
    beginListening();
  };

  // hold 모드: 누르고 있는 동안만 듣기
  const handleMicPress = () => {
    if (isListening) return;
    beginListening();
  };

  const handleMicRelease = () => {
    if (isListening) stopListening();
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
      <p className="max-w-md min-h-14 text-center text-lg font-medium text-gray-800">
        {subtitle}
      </p>
      {errorMessage && <p className="text-red-500 font-bold">{errorMessage}</p>}
      <MicButton
        disabled={isMicDisabled}
        isListening={isListening}
        mode={settings.micMode}
        onClick={handleMicClick}
        onPress={handleMicPress}
        onRelease={handleMicRelease}
      />
      {!isTtsSupported && (
        <p className="text-sm text-gray-400">
          이 브라우저는 음성 출력을 지원하지 않아 텍스트로만 표시돼요.
        </p>
      )}
    </div>
  );
}
