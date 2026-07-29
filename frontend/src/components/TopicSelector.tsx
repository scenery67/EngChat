// 주제 선택 화면 - 큰 카드 버튼으로 초3 아동이 쉽게 고를 수 있게 구성
import { TOPICS } from "../curriculum/topics";

interface TopicSelectorProps {
  onSelect: (topicId: string) => void;
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
}

export function TopicSelector({ onSelect, onOpenSettings, onOpenFeedback }: TopicSelectorProps) {
  return (
    <div className="relative flex flex-col items-center gap-6 p-8 min-h-screen justify-center">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          type="button"
          onClick={onOpenFeedback}
          aria-label="피드백 보내기"
          className="w-11 h-11 rounded-full bg-white border-2 border-gray-200 shadow-sm text-xl"
        >
          💬
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="설정"
          className="w-11 h-11 rounded-full bg-white border-2 border-gray-200 shadow-sm text-xl"
        >
          ⚙️
        </button>
      </div>
      <h1 className="text-3xl font-bold text-gray-800">오늘은 무엇을 이야기할까요?</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl">
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelect(topic.id)}
            className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white border-4 border-blue-200 shadow-md hover:border-blue-400 hover:scale-105 transition-transform"
          >
            <span className="text-4xl">{topic.emoji}</span>
            <span className="font-bold text-gray-700">{topic.titleKo}</span>
            <span className="text-sm text-gray-400">{topic.titleEn}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
