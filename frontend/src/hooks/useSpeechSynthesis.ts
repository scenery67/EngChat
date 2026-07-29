// 브라우저 내장 SpeechSynthesis(TTS)를 감싸는 훅
import { useCallback, useState } from "react";

const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

export function useSpeechSynthesis(rate: number = 0.95, voiceURI: string | null = null) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!isSupported) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;

      // voice와 lang이 서로 다른 방언(en-US vs en-GB 등)을 가리키면 일부 브라우저(특히
      // 안드로이드 시스템 TTS)가 voice 지정을 무시하고 lang 기준으로 되돌아갑니다.
      // 그래서 lang은 항상 "선택된 voice 자체의 lang"과 일치시킵니다.
      const matched = voiceURI
        ? window.speechSynthesis.getVoices().find((voice) => voice.voiceURI === voiceURI)
        : undefined;

      if (matched) {
        utterance.voice = matched;
        utterance.lang = matched.lang;
      } else {
        utterance.lang = "en-US";
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      window.speechSynthesis.speak(utterance);
    },
    [rate, voiceURI]
  );

  return { isSupported, isSpeaking, speak };
}
