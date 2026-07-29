// 브라우저에서 사용 가능한 영어 음성 목록을 가져오는 훅
// 일부 브라우저는 getVoices()가 비동기로 채워져서 "voiceschanged" 이벤트를 함께 구독합니다.
import { useEffect, useState } from "react";

const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

function loadEnglishVoices(): SpeechSynthesisVoice[] {
  if (!isSupported) return [];
  // 실제 존재하는 목소리 수는 브라우저/OS가 제공하는 만큼으로 제한됩니다(우리가 늘릴 수 없음).
  return window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith("en"))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(loadEnglishVoices);

  useEffect(() => {
    if (!isSupported) return;

    function handleVoicesChanged() {
      setVoices(loadEnglishVoices());
    }

    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    // 일부 브라우저는 이벤트 없이도 약간의 지연 후 목록이 채워지므로 한 번 더 시도합니다.
    handleVoicesChanged();

    return () => window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
  }, []);

  return voices;
}
