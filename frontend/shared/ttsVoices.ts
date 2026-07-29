// OpenAI TTS 목소리 화이트리스트. 클라이언트가 임의 문자열을 보내도 서버가 이 중 하나로만
// 강제 매핑합니다 (shared/models.ts의 resolveModel과 동일한 보안/비용 방어 패턴).
export type TtsVoiceKey = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export const DEFAULT_TTS_VOICE: TtsVoiceKey = "nova";

const TTS_VOICE_SET: ReadonlySet<string> = new Set([
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
]);

export function isValidTtsVoice(value: unknown): value is TtsVoiceKey {
  return typeof value === "string" && TTS_VOICE_SET.has(value);
}

export function resolveTtsVoice(value: unknown): TtsVoiceKey {
  return isValidTtsVoice(value) ? value : DEFAULT_TTS_VOICE;
}

// 설정 화면에 보여줄 한글 설명
export const TTS_VOICE_LABELS: Record<TtsVoiceKey, string> = {
  alloy: "Alloy (차분하고 중립적인 목소리)",
  echo: "Echo (또렷한 남성적인 목소리)",
  fable: "Fable (따뜻하고 이야기하듯 말하는 목소리)",
  onyx: "Onyx (깊고 낮은 목소리)",
  nova: "Nova (밝고 친근한 목소리)",
  shimmer: "Shimmer (부드럽고 상큼한 목소리)",
};
