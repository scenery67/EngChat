// 브라우저 내장 SpeechRecognition(STT)을 감싸는 훅
// Web Speech API 표준 타입이 없는 환경(webkit 접두사)도 함께 지원합니다.
import { useCallback, useRef, useState } from "react";

interface SpeechRecognitionResultEvent extends Event {
  results: {
    [index: number]: { [index: number]: { transcript: string } };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
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
  // 사용자가 듣기를 켜둔 상태인지 (토글). 일부 브라우저가 몇 초 무음 후 스스로 종료해도,
  // 아직 켜져 있는 상태면 자동으로 다시 시작해서 "끄기 전까지 계속 듣기"를 유지합니다.
  const isActiveRef = useRef(false);
  const gotResultRef = useRef(false);
  const onResultRef = useRef<((text: string) => void) | null>(null);

  const startRecognitionInstance = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      gotResultRef.current = true;
      const transcript = event.results[0][0].transcript;
      onResultRef.current?.(transcript);
    };
    recognition.onerror = (event) => {
      recognitionRef.current = null;
      // "no-speech"(무음 타임아웃)이고 아직 듣기가 켜진 상태이며 결과를 못 받았다면,
      // 사용자가 아직 말을 고르고 있는 것으로 보고 자동으로 다시 듣기 시작.
      if (isActiveRef.current && !gotResultRef.current && event.error === "no-speech") {
        startRecognitionInstance();
      } else {
        isActiveRef.current = false;
        setIsListening(false);
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (isActiveRef.current && !gotResultRef.current) {
        startRecognitionInstance();
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, []);

  // 인식 결과가 나오면 onResult 콜백으로 텍스트를 전달합니다.
  const startListening = useCallback(
    (onResult: (text: string) => void) => {
      if (recognitionRef.current) return;
      isActiveRef.current = true;
      gotResultRef.current = false;
      onResultRef.current = onResult;
      startRecognitionInstance();
    },
    [startRecognitionInstance]
  );

  const stopListening = useCallback(() => {
    isActiveRef.current = false;
    recognitionRef.current?.stop();
  }, []);

  return { isSupported, isListening, startListening, stopListening };
}
