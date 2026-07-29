// push-to-talk 방식 마이크 버튼 (누르고 있는 동안 말하기)
interface MicButtonProps {
  disabled: boolean;
  isListening: boolean;
  onPress: () => void;
  onRelease: () => void;
}

export function MicButton({ disabled, isListening, onPress, onRelease }: MicButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={onPress}
      onPointerUp={onRelease}
      onPointerLeave={() => {
        if (isListening) onRelease();
      }}
      aria-pressed={isListening}
      className={`w-24 h-24 rounded-full text-4xl text-white shadow-lg transition-transform select-none ${
        isListening ? "bg-red-500 scale-110" : "bg-blue-500"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "active:scale-95"}`}
    >
      🎤
    </button>
  );
}
