import type { LevelId } from "../../shared/levels";
import type { ModelKey } from "../../shared/models";
import type { TtsVoiceKey } from "../../shared/ttsVoices";

export type MicMode = "toggle" | "hold";

export interface AppSettings {
  levelId: LevelId;
  modelKey: ModelKey;
  ttsRate: number;
  // 브라우저가 제공하는 SpeechSynthesisVoice.voiceURI. null이면 브라우저 기본 음성을 사용합니다.
  voiceURI: string | null;
  // true면 브라우저 무료 TTS 대신 OpenAI TTS(유료, 훨씬 자연스러움)를 사용합니다.
  useOpenAiTts: boolean;
  openAiVoice: TtsVoiceKey;
  // "toggle": 한 번 눌러 켜고 다시 눌러 끄기 (기본) / "hold": 누르고 있는 동안만 듣기
  micMode: MicMode;
  // AI 캐릭터 이름 (기본값 "Buddy"). 시스템 프롬프트와 화면 자막에 함께 사용됩니다.
  aiName: string;
}

export const AI_NAME_MAX_LENGTH = 20;

// 기존 useSpeechSynthesis.ts에 하드코딩되어 있던 값(0.95)과 동일하게 맞춰,
// 기존 사용자의 경험이 설정 도입 전과 그대로 유지되도록 합니다.
export const DEFAULT_SETTINGS: AppSettings = {
  levelId: "e3",
  modelKey: "basic",
  ttsRate: 0.95,
  voiceURI: null,
  useOpenAiTts: false,
  openAiVoice: "nova",
  micMode: "toggle",
  aiName: "Buddy",
};
