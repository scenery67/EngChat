// 난이도/모델/TTS속도 설정을 localStorage에 저장하는 훅
import { useCallback, useState } from "react";
import { AI_NAME_MAX_LENGTH, DEFAULT_SETTINGS, type AppSettings } from "./types";
import { isValidLevelId } from "../../shared/levels";
import { isValidTtsVoice } from "../../shared/ttsVoices";

const STORAGE_KEY = "engchat:settings:v1";

function clampTtsRate(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return DEFAULT_SETTINGS.ttsRate;
  return Math.min(1.5, Math.max(0.5, n));
}

function sanitizeAiName(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_SETTINGS.aiName;
  const trimmed = value.trim().slice(0, AI_NAME_MAX_LENGTH);
  return trimmed || DEFAULT_SETTINGS.aiName;
}

// localStorage에서 읽은 값은 외부 입력으로 취급해 항상 검증합니다.
function readSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      levelId: isValidLevelId(parsed.levelId) ? parsed.levelId : DEFAULT_SETTINGS.levelId,
      modelKey: parsed.modelKey === "advanced" ? "advanced" : "basic",
      ttsRate: clampTtsRate(parsed.ttsRate),
      voiceURI: typeof parsed.voiceURI === "string" ? parsed.voiceURI : null,
      useOpenAiTts: parsed.useOpenAiTts === true,
      openAiVoice: isValidTtsVoice(parsed.openAiVoice) ? parsed.openAiVoice : DEFAULT_SETTINGS.openAiVoice,
      micMode: parsed.micMode === "hold" ? "hold" : "toggle",
      aiName: sanitizeAiName(parsed.aiName),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(readSettings);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, update };
}
