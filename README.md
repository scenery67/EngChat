# 영어 화상대화 학습 웹앱 "EngChat" (개인 프로토타입)

**배포된 사이트**: https://engchat.kkpark67.workers.dev/

AI 캐릭터와 화상대화를 하는 느낌으로 영어 회화를 연습하는 웹앱입니다. 마이크로 말하면
브라우저(또는 OpenAI TTS)가 음성을 텍스트로 바꾸고, OpenAI API가 튜터 역할로 답변을
만들고, 그 답변을 다시 음성으로 들려줍니다. 캐릭터는 대기/듣는 중/말하는 중 상태에 따라
간단한 애니메이션으로 반응합니다.

프론트엔드(정적 파일)와 백엔드(API)가 **하나의 Cloudflare Worker**로 함께 배포됩니다.
별도 서버를 관리할 필요가 없고, Cloudflare 대시보드의 Git 연동으로 `main` 브랜치에
push할 때마다 자동으로 빌드+배포됩니다.

## 폴더 구조

- `frontend/src/` — React + TypeScript + Vite + Tailwind CSS 프론트엔드. 주제 선택,
  대화, 설정, 피드백 화면을 제공합니다.
- `frontend/worker/` — Cloudflare Worker 진입점(`index.ts`)과 시스템 프롬프트
  (`systemPrompt.ts`). `/api/chat`, `/api/tts`, `/api/feedback`, `/admin` 라우트를
  직접 처리하고, 그 외 요청은 정적 자산(`dist/`)으로 위임합니다. **`/admin`은 React
  페이지가 아니라 이 Worker 코드가 직접 만들어주는 HTML입니다** — Vite(`npm run dev`)
  로는 절대 안 보이고, Wrangler(`npm run worker:dev`)로 띄워야만 동작합니다.
- `frontend/shared/` — 프론트엔드와 Worker가 함께 쓰는 데이터(난이도 12단계, GPT
  모델 화이트리스트, TTS 목소리 화이트리스트).
- `frontend/migrations/` — 피드백 저장용 D1(SQLite) 테이블 마이그레이션.
- `frontend/wrangler.toml` — Worker 이름, 정적 자산 경로, D1 바인딩 설정.

## 1. OpenAI API 키 발급

1. https://platform.openai.com/api-keys 접속 후 로그인/가입
2. **Create new secret key** 클릭 → 이름 지정 → 생성된 키(`sk-...`)를 즉시 복사
   (한 번만 표시됩니다)
3. https://platform.openai.com/settings/organization/billing 에서 결제 수단 등록 +
   소액 크레딧 충전 (개인 테스트용이면 $5~10 정도면 충분합니다)
4. 이 앱은 **채팅(GPT)** 과 **음성 합성(TTS, 설정에서 켠 경우)** 두 가지로 같은 키의
   크레딧을 함께 씁니다 — 새로 가입/결제할 필요 없이 하나의 크레딧에서 같이 차감됩니다.

## 2. 로컬 개발 실행

**중요: 로컬에 두 가지 실행 방법이 있고, 용도가 다릅니다.**

| 명령 | 주소 | 무엇을 확인할 때 |
|---|---|---|
| `npm run dev` | `http://localhost:5173` | 화면 레이아웃/스타일만 빠르게 확인 (Vite만 실행, **백엔드 없음** — 대화·피드백·`/admin` 전부 동작 안 함) |
| `npm run worker:dev` | `http://localhost:8788` | **실제 기능 전체** 테스트 (대화, 피드백, `/admin` 포함) ← 보통 이걸 쓰면 됩니다 |

```bash
cd frontend
npm install
cp .dev.vars.example .dev.vars
# .dev.vars 파일을 열어 OPENAI_API_KEY, ADMIN_PASSWORD 값을 입력하세요.
# (.dev.vars는 git에 커밋되지 않습니다 — 실제 키는 항상 이 파일에만 넣으세요.
#  .dev.vars.example은 커밋되는 "템플릿"이니 여기에는 절대 실제 키를 넣지 마세요.)

npm run worker:dev
```

`http://localhost:8788`으로 접속하면 프론트엔드 + `/api/chat` + `/api/tts` +
`/api/feedback` + `/admin`이 전부 같은 주소에서 동작합니다.

**`.dev.vars`를 수정한 뒤에는 반드시 `Ctrl+C`로 끄고 `npm run worker:dev`를 다시
실행해야 새 값이 반영됩니다.** (파일만 바꾸고 서버를 안 껐다 켜면 예전 값을 계속 씁니다.)

간단히 API만 테스트하려면:

```bash
curl -X POST http://localhost:8788/api/chat \
  -H "Content-Type: application/json" \
  -d '{"topicId":"self_introduction","history":[],"userMessage":"Hello"}'
```

### 로컬 D1(피드백 저장소) 준비

최초 1회, 로컬 SQLite에 피드백 테이블을 만들어야 `/api/feedback`이 동작합니다:

```bash
cd frontend
npx wrangler d1 migrations apply engchat-feedback --local
```

## 3. 사용 방법

1. **Chrome 브라우저**를 권장합니다 (Web Speech API 지원이 가장 안정적입니다).
2. 주제 카드(자기소개/좋아하는 음식/동물/학교/가족/취미) 중 하나를 선택합니다.
3. 마이크 버튼으로 말합니다. 설정에서 조작 방식을 바꿀 수 있습니다:
   - **탭해서 켜고 끄기(기본)**: 한 번 눌러 시작, 다시 눌러 종료
   - **누르고 있기**: 누르고 있는 동안만 듣기
   - 말하다 잠깐 멈춰도 끊기지 않고, 버튼을 눌러 끌 때까지 계속 듣습니다.
4. 캐릭터가 화면에서 입을 움직이며 음성으로 답변합니다.
5. 우상단 ⚙️(설정)에서 난이도(초1~고3), 고급 모델(GPT-4o) 사용 여부, 마이크 조작
   방식, 말하기 속도, 목소리(브라우저 무료 목소리 또는 OpenAI 유료 목소리), AI 캐릭터
   이름을 바꿀 수 있습니다.
6. 우상단 💬(피드백)에서 의견을 남길 수 있습니다 — Cloudflare D1에 저장됩니다.
7. "← 주제 다시 고르기"로 다른 주제로 이동, 모바일 뒤로가기는 최상위 화면에서
   종료 확인창이 뜹니다.

## 4. Cloudflare 배포 (최초 1회 설정)

이 프로젝트는 **Cloudflare 대시보드의 Git 연동(Workers Builds)** 으로 배포됩니다 —
GitHub Actions는 쓰지 않습니다. `main` 브랜치에 push하면 Cloudflare가 자동으로
빌드하고 배포합니다.

1. https://dash.cloudflare.com 가입(무료) → **Workers & Pages** → GitHub 저장소
   연동으로 Worker 생성 (Root directory: `frontend`, Build command: `npm run build`,
   Deploy command: `npx wrangler deploy`)
2. **환경변수 등록** — 대시보드 → 해당 Worker → **Settings → Variables and Secrets**:
   - `OPENAI_API_KEY` (Secret) — 1번에서 발급받은 키
   - `ADMIN_PASSWORD` (Secret) — `/admin` 접속용 비밀번호 (아이디는 아무거나, 비밀번호만 확인)
3. **D1(피드백 저장소) 준비** (최초 1회, 로컬에서):
   ```bash
   cd frontend
   npx wrangler d1 create engchat-feedback
   # 출력된 database_id를 wrangler.toml의 [[d1_databases]] 항목에 붙여넣고 커밋
   npx wrangler d1 migrations apply engchat-feedback --remote
   ```
   **주의**: Cloudflare의 자동 배포는 이 마이그레이션 명령을 대신 실행해주지 않습니다.
   `feedback` 테이블 스키마를 바꿀 때마다 `--remote`를 로컬에서 직접 실행해야 합니다.
4. `git push`하면 자동으로 빌드+배포됩니다. 현재 배포 주소는
   **https://engchat.kkpark67.workers.dev/** 입니다 (`*.workers.dev` 기본 제공,
   계정 서브도메인은 대시보드에서 한 번 변경 가능, 원하면 커스텀 도메인 연결도 가능).

### 피드백 확인 방법

- https://engchat.kkpark67.workers.dev/admin 접속 → 등록한 `ADMIN_PASSWORD` 입력
- 또는 CLI로: `npx wrangler d1 execute engchat-feedback --remote --command "SELECT * FROM feedback ORDER BY id DESC"`

## 참고 사항

- 개인용 프로토타입이므로 로그인/회원가입은 없습니다. 대화 기록은 브라우저를
  새로고침하면 초기화됩니다. 설정은 각 기기의 localStorage에 저장됩니다.
- `frontend/.dev.vars`는 절대 git에 커밋하지 마세요 (`.gitignore`에 이미 포함).
  실제 키는 `.dev.vars.example`(템플릿, 커밋 대상)에는 절대 넣지 마세요.
- 대화 품질이 부족하면 설정에서 "고급 모델 사용"을 켜거나, `frontend/worker/index.ts`의
  기본 모델명을 바꿀 수 있습니다 (`frontend/shared/models.ts`에서 화이트리스트 관리).
- OpenAI TTS(자연스러운 목소리)는 브라우저 무료 목소리보다 품질이 좋지만 별도 비용이
  발생합니다 (같은 OpenAI 크레딧에서 차감).
