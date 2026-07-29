// OpenAI TTS API를 통해 훨씬 자연스러운 음성을 재생하는 훅.
// useSpeechSynthesis.ts와 동일한 인터페이스({ isSupported, isSpeaking, speak })를 유지해서
// 설정값에 따라 두 훅을 손쉽게 교체해 쓸 수 있게 합니다.
import { useCallback, useRef, useState } from "react";
import type { TtsVoiceKey } from "../../shared/ttsVoices";

const isSupported = typeof window !== "undefined" && typeof Audio !== "undefined";

export function useOpenAiSpeech(rate: number = 0.95, voice: TtsVoiceKey = "nova") {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!isSupported) {
        onEnd?.();
        return;
      }

      // 이전 재생이 남아있으면 정리합니다.
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      let objectUrl: string | null = null;
      const cleanup = () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
        setIsSpeaking(false);
      };

      fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("TTS request failed");
          return response.blob();
        })
        .then((blob) => {
          objectUrl = URL.createObjectURL(blob);
          const audio = new Audio(objectUrl);
          audioRef.current = audio;
          audio.playbackRate = rate;
          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => {
            cleanup();
            onEnd?.();
          };
          audio.onerror = () => {
            cleanup();
            onEnd?.();
          };
          void audio.play();
        })
        .catch(() => {
          // 네트워크 오류/서버 오류 시 조용히 종료 처리 (기존 useSpeechSynthesis와 동일한 정책)
          cleanup();
          onEnd?.();
        });
    },
    [rate, voice]
  );

  return { isSupported, isSpeaking, speak };
}
