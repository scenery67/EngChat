// 브라우저 내장 SpeechRecognition(STT)을 감싸는 훅
// Web Speech API 표준 타입이 없는 환경(webkit 접두사)도 함께 지원합니다.
import { useCallback, useRef, useState } from "react";

interface SpeechRecognitionResultEvent extends Event {
  results: {
    [index: number]: { [index: number]: { transcript: string } };
    length: number;
  };
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => getSpeechRecognitionConstructor() !== null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // 인식 결과가 나오면 onResult 콜백으로 텍스트를 전달합니다.
  const startListening = useCallback((onResult: (text: string) => void) => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isSupported, isListening, startListening, stopListening };
}
