// 화상대화 상대 캐릭터 일러스트 + 상태별 애니메이션
export type AvatarState = "idle" | "listening" | "speaking";

interface AvatarCharacterProps {
  state: AvatarState;
}

const STATE_LABEL: Record<AvatarState, string> = {
  idle: "🎤 눌러서 말해보세요",
  listening: "👂 듣고 있어요",
  speaking: "🗣️ 말하고 있어요",
};

const STATE_LABEL_COLOR: Record<AvatarState, string> = {
  idle: "text-gray-600",
  listening: "text-red-600",
  speaking: "text-blue-600",
};

export function AvatarCharacter({ state }: AvatarCharacterProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        // 모바일 브라우저의 강제 다크모드(자동 색 반전)가 이 얼굴 색만은 건드리지 않도록
        // color-scheme을 이 요소에만 라이트로 고정합니다 (앱 전체에는 적용하지 않음).
        style={{ colorScheme: "light" }}
        className={`relative w-56 h-56 rounded-full bg-yellow-300 border-8 border-yellow-500 shadow-xl ${
          state === "idle" ? "animate-breathe" : ""
        }`}
      >
        {/* 눈 */}
        <div className="absolute top-16 left-14 w-6 h-6 rounded-full bg-gray-900" />
        <div className="absolute top-16 right-14 w-6 h-6 rounded-full bg-gray-900" />
        {/* 볼 */}
        <div className="absolute top-28 left-8 w-8 h-5 rounded-full bg-pink-300/70" />
        <div className="absolute top-28 right-8 w-8 h-5 rounded-full bg-pink-300/70" />
        {/* 입 - 말하는 중에는 벌어졌다 닫히는 애니메이션 */}
        <div
          className={`absolute bottom-14 left-1/2 -translate-x-1/2 w-16 rounded-full bg-gray-900 ${
            state === "speaking" ? "animate-talk" : "h-3"
          }`}
        />
        {state === "listening" && (
          <div className="absolute -bottom-3 right-2 text-3xl animate-pulse">🎤</div>
        )}
      </div>
      <p className={`text-lg font-bold ${STATE_LABEL_COLOR[state]}`}>{STATE_LABEL[state]}</p>
    </div>
  );
}
