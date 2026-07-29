// 설정 화면 - AI 이름 / 난이도(학년) / 고급 모델 / 음성 목소리 / TTS 말하기 속도
import { LEVELS } from "../../shared/levels";
import { TTS_VOICE_LABELS, type TtsVoiceKey } from "../../shared/ttsVoices";
import { AI_NAME_MAX_LENGTH } from "../settings/types";
import { useSettings } from "../settings/useSettings";
import { useVoices } from "../hooks/useVoices";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { useOpenAiSpeech } from "../hooks/useOpenAiSpeech";

interface SettingsScreenProps {
  onExit: () => void;
}

export function SettingsScreen({ onExit }: SettingsScreenProps) {
  const { settings, update } = useSettings();
  const voices = useVoices();
  const browserSpeech = useSpeechSynthesis(settings.ttsRate, settings.voiceURI);
  const openAiSpeech = useOpenAiSpeech(settings.ttsRate, settings.openAiVoice);
  const speak = settings.useOpenAiTts ? openAiSpeech.speak : browserSpeech.speak;

  return (
    <div className="flex flex-col items-center gap-6 p-8 min-h-screen">
      <div className="w-full max-w-xl flex items-center">
        <button type="button" onClick={onExit} className="text-blue-500 underline">
          ← 뒤로 가기
        </button>
      </div>
      <h1 className="text-2xl font-bold text-gray-800">설정</h1>

      <section className="w-full max-w-xl p-4 rounded-2xl bg-white border-4 border-gray-200">
        <p className="font-bold text-gray-800 mb-2">AI 이름</p>
        <input
          type="text"
          value={settings.aiName}
          onChange={(e) => update({ aiName: e.target.value.slice(0, AI_NAME_MAX_LENGTH) })}
          maxLength={AI_NAME_MAX_LENGTH}
          placeholder="Buddy"
          className="w-full p-3 rounded-2xl border-4 border-gray-200"
        />
        <p className="text-sm text-gray-500 mt-1">대화 상대 캐릭터의 이름이에요</p>
      </section>

      <section className="w-full max-w-xl">
        <h2 className="font-bold text-gray-700 mb-2">난이도 (학년)</h2>
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          {LEVELS.map((level) => {
            const selected = settings.levelId === level.id;
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => update({ levelId: level.id })}
                className={`text-left p-3 rounded-2xl border-4 transition-colors ${
                  selected ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"
                }`}
              >
                <p className="font-bold text-gray-800">{level.labelKo}</p>
                <p className="text-sm text-gray-500">{level.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="w-full max-w-xl flex items-center justify-between p-4 rounded-2xl bg-white border-4 border-gray-200">
        <div>
          <p className="font-bold text-gray-800">고급 모델 사용</p>
          <p className="text-sm text-gray-500">응답 품질이 더 좋아지지만 느려질 수 있어요</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.modelKey === "advanced"}
          onClick={() =>
            update({ modelKey: settings.modelKey === "advanced" ? "basic" : "advanced" })
          }
          className={`w-14 h-8 rounded-full relative transition-colors ${
            settings.modelKey === "advanced" ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${
              settings.modelKey === "advanced" ? "translate-x-6" : ""
            }`}
          />
        </button>
      </section>

      <section className="w-full max-w-xl flex items-center justify-between p-4 rounded-2xl bg-white border-4 border-gray-200">
        <div>
          <p className="font-bold text-gray-800">자연스러운 목소리 사용</p>
          <p className="text-sm text-gray-500">
            훨씬 자연스러운 목소리지만 추가 비용이 발생해요
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.useOpenAiTts}
          onClick={() => update({ useOpenAiTts: !settings.useOpenAiTts })}
          className={`w-14 h-8 rounded-full relative transition-colors ${
            settings.useOpenAiTts ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${
              settings.useOpenAiTts ? "translate-x-6" : ""
            }`}
          />
        </button>
      </section>

      <section className="w-full max-w-xl p-4 rounded-2xl bg-white border-4 border-gray-200">
        <p className="font-bold text-gray-800 mb-2">마이크 조작 방식</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update({ micMode: "toggle" })}
            className={`flex-1 p-3 rounded-2xl border-4 text-left transition-colors ${
              settings.micMode === "toggle" ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"
            }`}
          >
            <p className="font-bold text-gray-800">탭해서 켜고 끄기</p>
            <p className="text-sm text-gray-500">한 번 눌러 시작, 다시 눌러 종료 (기본)</p>
          </button>
          <button
            type="button"
            onClick={() => update({ micMode: "hold" })}
            className={`flex-1 p-3 rounded-2xl border-4 text-left transition-colors ${
              settings.micMode === "hold" ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"
            }`}
          >
            <p className="font-bold text-gray-800">누르고 있기</p>
            <p className="text-sm text-gray-500">누르고 있는 동안만 듣기</p>
          </button>
        </div>
      </section>

      <section className="w-full max-w-xl p-4 rounded-2xl bg-white border-4 border-gray-200">
        <p className="font-bold text-gray-800 mb-2">말하기 속도: {settings.ttsRate.toFixed(2)}x</p>
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.05}
          value={settings.ttsRate}
          onChange={(e) => update({ ttsRate: Number(e.target.value) })}
          className="w-full"
        />
      </section>

      <section className="w-full max-w-xl p-4 rounded-2xl bg-white border-4 border-gray-200">
        <p className="font-bold text-gray-800 mb-2">음성 목소리</p>

        {settings.useOpenAiTts ? (
          <div className="flex gap-2">
            <select
              value={settings.openAiVoice}
              onChange={(e) => update({ openAiVoice: e.target.value as TtsVoiceKey })}
              className="flex-1 min-w-0 p-3 rounded-2xl border-4 border-gray-200"
            >
              {Object.entries(TTS_VOICE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => speak("Hello! Nice to meet you!")}
              className="flex-shrink-0 px-4 py-3 rounded-2xl bg-blue-500 text-white font-bold active:scale-95"
            >
              들어보기
            </button>
          </div>
        ) : voices.length === 0 ? (
          <p className="text-sm text-gray-500">
            이 브라우저에서는 목소리를 선택할 수 없어요. 기본 목소리로 재생됩니다.
          </p>
        ) : (
          <>
            <div className="flex gap-2">
              <select
                value={settings.voiceURI ?? ""}
                onChange={(e) => update({ voiceURI: e.target.value || null })}
                className="flex-1 min-w-0 p-3 rounded-2xl border-4 border-gray-200"
              >
                <option value="">기본 목소리</option>
                {voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => speak("Hello! Nice to meet you!")}
                className="flex-shrink-0 px-4 py-3 rounded-2xl bg-blue-500 text-white font-bold active:scale-95"
              >
                들어보기
              </button>
            </div>
            {voices.length <= 2 && (
              <p className="text-sm text-gray-400 mt-2">
                영어 목소리가 적게 보이면 기기 설정 &gt; 접근성 &gt; 텍스트 음성 변환에서 음성
                데이터를 추가로 설치하면 더 늘어날 수 있어요.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
