// 브라우저 내장 SpeechRecognition(STT)을 감싸는 훅
// Web Speech API 표준 타입이 없는 환경(webkit 접두사)도 함께 지원합니다.
import { useCallback, useRef, useState } from "react";

interface SpeechRecognitionResult {
  [index: number]: { transcript: string };
}

interface SpeechRecognitionResultEvent extends Event {
  resultIndex: number;
  results: {
    [index: number]: SpeechRecognitionResult;
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
  continuous: boolean;
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
  // 사용자가 듣기를 켜둔 상태인지 (토글). 말 중간에 잠깐 멈추거나, 일부 브라우저가 무음
  // 몇 초 후 스스로 세션을 끝내버려도, 아직 켜져 있는 상태면 자동으로 다시 시작해서
  // "끄기 전까지 계속 듣기"를 유지합니다.
  const isActiveRef = useRef(false);
  // 이번 듣기 세션 동안 확정된 문장 조각들을 이어붙여 누적합니다. 버튼을 눌러 끌 때
  // 한 번에 합쳐서 전달합니다 (말 중간에 쉬었다고 그 전까지만 잘라 보내지 않도록).
  const transcriptRef = useRef("");
  const onResultRef = useRef<((text: string) => void) | null>(null);

  const finishSession = useCallback(() => {
    setIsListening(false);
    const transcript = transcriptRef.current.trim();
    transcriptRef.current = "";
    if (transcript) {
      onResultRef.current?.(transcript);
    }
  }, []);

  const startRecognitionInstance = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    // 말 중간에 잠깐 멈춰도 세션을 끝내지 않고 계속 듣도록 합니다.
    recognition.continuous = true;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const segment = event.results[i][0].transcript.trim();
        if (!segment) continue;
        transcriptRef.current = transcriptRef.current
          ? `${transcriptRef.current} ${segment}`
          : segment;
      }
    };
    recognition.onerror = (event) => {
      recognitionRef.current = null;
      // "no-speech"(무음 타임아웃)이고 아직 듣기가 켜진 상태라면, 사용자가 말을 고르고
      // 있는 중일 수 있으니 자동으로 다시 듣기 시작 (지금까지 누적된 내용은 유지됨).
      if (isActiveRef.current && event.error === "no-speech") {
        startRecognitionInstance();
      } else {
        isActiveRef.current = false;
        finishSession();
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (isActiveRef.current) {
        startRecognitionInstance();
      } else {
        finishSession();
      }
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, [finishSession]);

  // 인식 결과가 나오면 onResult 콜백으로 텍스트를 전달합니다.
  const startListening = useCallback(
    (onResult: (text: string) => void) => {
      if (recognitionRef.current) return;
      isActiveRef.current = true;
      transcriptRef.current = "";
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
