-- Migration number: 0002 	 2026-07-29T18:45:12.110Z

-- IP + 라우트별 요청 횟수를 시간 창(window) 단위로 세는 테이블
-- (짧은 시간에 API를 몰아서 호출해 OpenAI 비용이 폭증하는 것을 막기 위한 레이트 리미팅용)
CREATE TABLE IF NOT EXISTS rate_limit_counters (
  bucket_key TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_key, window_start)
);
