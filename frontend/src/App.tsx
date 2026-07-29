import { useEffect, useState } from "react";
import { TopicSelector } from "./components/TopicSelector";
import { ChatScreen } from "./components/ChatScreen";

function App() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // 모바일 뒤로가기 버튼을 누르면 대화 화면 → 주제 선택 화면으로 돌아가도록,
  // 대화 화면 진입 시 브라우저 히스토리에 항목을 하나 쌓아둡니다.
  useEffect(() => {
    function handlePopState() {
      setSelectedTopicId(null);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSelectTopic = (topicId: string) => {
    window.history.pushState({ topicId }, "");
    setSelectedTopicId(topicId);
  };

  // 뒤로가기 버튼과 "주제 다시 고르기" 버튼이 같은 경로(history.back())를 타게 해서
  // 히스토리 스택이 항상 화면 상태와 일치하도록 유지합니다.
  const handleExitChat = () => {
    window.history.back();
  };

  if (selectedTopicId) {
    return <ChatScreen topicId={selectedTopicId} onExit={handleExitChat} />;
  }

  return <TopicSelector onSelect={handleSelectTopic} />;
}

export default App;
