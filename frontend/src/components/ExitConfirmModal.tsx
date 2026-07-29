// 모바일 뒤로가기로 앱을 나가려 할 때 뜨는 확인 모달
interface ExitConfirmModalProps {
  mode: "confirm" | "close-hint";
  onCancel: () => void;
  onConfirm: () => void;
}

export function ExitConfirmModal({ mode, onCancel, onConfirm }: ExitConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col items-center gap-4 max-w-sm p-6 rounded-2xl bg-white border-4 border-blue-200 shadow-md text-center">
        {mode === "confirm" ? (
          <>
            <p className="text-xl font-bold text-gray-800">앱을 종료할까요?</p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 rounded-2xl bg-blue-500 text-white text-lg font-bold active:scale-95"
              >
                계속 할래요
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 py-4 rounded-2xl bg-gray-200 text-gray-700 text-lg font-bold active:scale-95"
              >
                종료할래요
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-600">
            브라우저 정책상 자동으로 닫을 수 없어요. 탭의 ✕ 버튼으로 닫아주시거나, 뒤로가기를 한
            번 더 눌러주세요.
          </p>
        )}
      </div>
    </div>
  );
}
