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
      utterance.lang = "en-US";
      utterance.rate = rate;

      if (voiceURI) {
        const matched = window.speechSynthesis
          .getVoices()
          .find((voice) => voice.voiceURI === voiceURI);
        if (matched) utterance.voice = matched;
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
