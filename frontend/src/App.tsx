import { useEffect, useRef, useState } from "react";
import { TopicSelector } from "./components/TopicSelector";
import { ChatScreen } from "./components/ChatScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { FeedbackScreen } from "./components/FeedbackScreen";
import { ExitConfirmModal } from "./components/ExitConfirmModal";

type Screen =
  | { type: "topics" }
  | { type: "settings" }
  | { type: "feedback" }
  | { type: "chat"; topicId: string };

function isScreen(value: unknown): value is Screen {
  return typeof value === "object" && value !== null && typeof (value as Screen).type === "string";
}

function App() {
  const [screen, setScreen] = useState<Screen>({ type: "topics" });
  const [exitState, setExitState] = useState<"none" | "confirm" | "close-hint">("none");
  // "종료할래요"를 확정한 뒤에는 다음 뒤로가기를 더 이상 가로채지 않습니다.
  const allowNextExitRef = useRef(false);

  // 최상위(주제 선택) 화면에 대응하는 history entry를 심어두고, 그보다 더 뒤로 가려는
  // 시도(popstate의 state가 null)를 "앱 종료 시도"로 간주해 확인창을 띄웁니다.
  useEffect(() => {
    const current = window.history.state;
    if (!isScreen(current)) {
      window.history.pushState({ type: "topics" }, "");
    }

    function handlePopState(event: PopStateEvent) {
      const state = event.state;

      if (isScreen(state)) {
        setScreen(state);
        return;
      }

      if (allowNextExitRef.current) {
        return;
      }

      // 실제 이탈을 취소하고(트랩 재무장) 확인창을 띄웁니다.
      window.history.pushState({ type: "topics" }, "");
      setScreen({ type: "topics" });
      setExitState("confirm");
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (next: Screen) => {
    window.history.pushState(next, "");
    setScreen(next);
  };

  const goBack = () => window.history.back();

  const handleCancelExit = () => setExitState("none");

  const handleConfirmExit = () => {
    setExitState("none");
    allowNextExitRef.current = true;
    window.close();
    // window.close()가 성공하면(스크립트로 연 탭) 문서가 사라져 아래 타이머는 실행되지 않습니다.
    // 실패하면(일반 탭) 페이지가 그대로 남아있으므로 안내 문구를 보여줍니다.
    setTimeout(() => setExitState("close-hint"), 300);
  };

  return (
    <>
      {screen.type === "topics" && (
        <TopicSelector
          onSelect={(topicId) => navigate({ type: "chat", topicId })}
          onOpenSettings={() => navigate({ type: "settings" })}
          onOpenFeedback={() => navigate({ type: "feedback" })}
        />
      )}
      {screen.type === "settings" && <SettingsScreen onExit={goBack} />}
      {screen.type === "feedback" && <FeedbackScreen onExit={goBack} />}
      {screen.type === "chat" && <ChatScreen topicId={screen.topicId} onExit={goBack} />}

      {exitState !== "none" && (
        <ExitConfirmModal
          mode={exitState === "confirm" ? "confirm" : "close-hint"}
          onCancel={handleCancelExit}
          onConfirm={handleConfirmExit}
        />
      )}
    </>
  );
}

export default App;
