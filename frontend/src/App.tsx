import { useState } from "react";
import { TopicSelector } from "./components/TopicSelector";
import { ChatScreen } from "./components/ChatScreen";

function App() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  if (selectedTopicId) {
    return <ChatScreen topicId={selectedTopicId} onExit={() => setSelectedTopicId(null)} />;
  }

  return <TopicSelector onSelect={setSelectedTopicId} />;
}

export default App;
