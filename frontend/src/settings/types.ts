import type { LevelId } from "../../shared/levels";
import type { ModelKey } from "../../shared/models";

export interface AppSettings {
  levelId: LevelId;
  modelKey: ModelKey;
  ttsRate: number;
}

// 기존 useSpeechSynthesis.ts에 하드코딩되어 있던 값(0.95)과 동일하게 맞춰,
// 기존 사용자의 경험이 설정 도입 전과 그대로 유지되도록 합니다.
export const DEFAULT_SETTINGS: AppSettings = {
  levelId: "e3",
  modelKey: "basic",
  ttsRate: 0.95,
};
