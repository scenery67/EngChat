// 난이도/모델/TTS속도 설정을 localStorage에 저장하는 훅
import { useCallback, useState } from "react";
import { DEFAULT_SETTINGS, type AppSettings } from "./types";
import { isValidLevelId } from "../../shared/levels";

const STORAGE_KEY = "engchat:settings:v1";

function clampTtsRate(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return DEFAULT_SETTINGS.ttsRate;
  return Math.min(1.5, Math.max(0.5, n));
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
