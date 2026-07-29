// 탭-토글 방식 마이크 버튼 (한 번 눌러 듣기 시작, 다시 눌러 듣기 종료)
interface MicButtonProps {
  disabled: boolean;
  isListening: boolean;
  onClick: () => void;
}

export function MicButton({ disabled, isListening, onClick }: MicButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={isListening}
      className={`w-24 h-24 rounded-full text-4xl text-white shadow-lg transition-transform select-none ${
        isListening ? "bg-red-500 scale-110" : "bg-blue-500"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "active:scale-95"}`}
    >
      {isListening ? "⏹️" : "🎤"}
    </button>
  );
}
