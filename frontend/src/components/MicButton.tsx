// 마이크 버튼 - 설정에 따라 "탭-토글" 또는 "누르고 있기" 방식으로 동작
interface MicButtonProps {
  disabled: boolean;
  isListening: boolean;
  mode: "toggle" | "hold";
  onClick: () => void; // toggle 모드에서 사용
  onPress: () => void; // hold 모드에서 사용
  onRelease: () => void; // hold 모드에서 사용
}

export function MicButton({
  disabled,
  isListening,
  mode,
  onClick,
  onPress,
  onRelease,
}: MicButtonProps) {
  const interactionProps =
    mode === "hold"
      ? {
          onPointerDown: onPress,
          onPointerUp: onRelease,
          onPointerLeave: () => {
            if (isListening) onRelease();
          },
        }
      : { onClick };

  return (
    <button
      type="button"
      disabled={disabled}
      {...interactionProps}
      aria-pressed={isListening}
      className={`w-24 h-24 rounded-full text-4xl text-white shadow-lg transition-transform select-none ${
        isListening ? "bg-red-500 scale-110" : "bg-blue-500"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "active:scale-95"}`}
    >
      {isListening ? "⏹️" : "🎤"}
    </button>
  );
}
