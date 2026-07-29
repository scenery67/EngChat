# 초등 3학년용 영어 "화상대화" 학습 웹앱 (개인 프로토타입)

AI 캐릭터와 화상대화를 하는 느낌으로 영어 회화를 연습하는 웹앱입니다. 마이크로 말하면
브라우저가 음성을 텍스트로 바꾸고(STT), OpenAI API가 튜터 역할로 답변을 만들고,
그 답변을 다시 음성으로 들려줍니다(TTS). 캐릭터는 말하는 중/듣는 중 상태에 따라
간단한 애니메이션으로 반응합니다.

프론트엔드와 백엔드가 **Cloudflare Pages** 하나의 프로젝트로 함께 배포됩니다 (백엔드는
상시 구동 서버가 아니라 Cloudflare Pages Functions라는 서버리스 함수 형태). 그래서
GitHub Actions 한 워크플로우로 배포가 끝납니다.

## 폴더 구조

- `frontend/src/` : React + TypeScript + Vite + Tailwind CSS 웹앱. 주제 선택 화면과
  화상대화 화면(아바타, 자막, 마이크 버튼)을 제공합니다.
- `frontend/functions/` : Cloudflare Pages Functions. `api/chat.ts`가 `/api/chat` 요청을
  받아 OpenAI API 키를 안전하게 보관한 채로 OpenAI에 대화를 중계합니다. 브라우저에는
  API 키가 절대 노출되지 않습니다.
- `.github/workflows/deploy.yml` : `main` 브랜치에 push하면 자동으로 Cloudflare Pages에
  배포하는 GitHub Actions 워크플로우.

## 1. OpenAI API 키 발급

1. https://platform.openai.com/api-keys 접속 후 로그인/가입
2. **Create new secret key** 클릭 → 이름 지정(예: `english-tutor-dev`) → 생성된 키(`sk-...`)를
   즉시 복사 (한 번만 표시됩니다)
3. https://platform.openai.com/settings/organization/billing 에서 결제 수단 등록 + 소액 크레딧 충전
   (프로토타입 테스트라면 $5 정도면 충분합니다)

## 2. 로컬 개발 실행

```bash
cd frontend
npm install
cp .dev.vars.example .dev.vars
# .dev.vars 파일을 열어 OPENAI_API_KEY 값을 방금 발급받은 키로 교체하세요.

npm run pages:dev
```

`npm run pages:dev`는 프론트엔드(Vite)와 Cloudflare Functions를 함께 로컬에서 띄워주는
`wrangler pages dev` 명령입니다. 실행 후 안내되는 주소(보통 `http://localhost:8788`)로
접속하면 프론트엔드와 `/api/chat`이 같은 주소에서 함께 동작합니다.

**`.dev.vars`를 수정한 뒤에는 반드시 `Ctrl+C`로 끄고 `npm run pages:dev`를 다시 실행해야
새 값이 적용됩니다.**

간단히 API만 테스트하려면:

```bash
curl -X POST http://localhost:8788/api/chat \
  -H "Content-Type: application/json" \
  -d '{"topicId":"self_introduction","history":[],"userMessage":"Hello"}'
```

## 3. 사용 방법

1. **Chrome 브라우저**를 권장합니다 (Web Speech API 지원이 가장 안정적입니다).
2. 주제 카드(자기소개/좋아하는 음식/동물/학교/가족/취미) 중 하나를 선택합니다.
3. 마이크 버튼을 **누르고 있는 동안** 영어로 말하고, 손을 떼면 인식이 종료됩니다.
4. 캐릭터가 화면에서 입을 움직이며 음성으로 답변합니다.
5. "← 주제 다시 고르기"를 눌러 다른 주제로 이동할 수 있습니다.

## 4. Cloudflare Pages + GitHub Actions 배포

최초 1회만 설정하면, 이후에는 `main` 브랜치에 push할 때마다 자동 배포됩니다.

1. **Cloudflare 계정 준비**: https://dash.cloudflare.com 가입 (무료)
2. **API 토큰 발급**: Cloudflare 대시보드 → 우측 상단 프로필 → **API Tokens** →
   **Create Token** → "Edit Cloudflare Workers" 템플릿 사용 (Pages 배포 권한 포함)
3. **계정 ID 확인**: Cloudflare 대시보드 우측 하단 또는 아무 도메인 개요 페이지에서
   **Account ID** 확인
4. **GitHub 저장소 Secrets 등록** (저장소 → Settings → Secrets and variables → Actions):
   - `CLOUDFLARE_API_TOKEN` : 2번에서 발급한 토큰
   - `CLOUDFLARE_ACCOUNT_ID` : 3번에서 확인한 계정 ID
5. **Cloudflare Pages 프로젝트 생성** (최초 1회, 로컬에서):
   ```bash
   cd frontend
   npx wrangler pages project create english-tutor-app
   ```
6. **OpenAI 키를 Cloudflare Pages 환경변수로 등록** (Cloudflare 대시보드 →
   Workers & Pages → `english-tutor-app` → Settings → Environment variables →
   **Production**에 `OPENAI_API_KEY` 추가, "Encrypt" 체크). GitHub Secrets에는 이 키를
   넣지 않습니다 — Cloudflare 쪽에만 보관합니다.
7. 이제 `git push`로 `main` 브랜치에 올리면 GitHub Actions가 자동으로 빌드 + 배포합니다.
   배포된 주소는 Cloudflare 대시보드에서 확인할 수 있습니다 (기본 HTTPS라 마이크 권한도
   정상 동작합니다).

## 참고 사항

- 개인용 프로토타입이므로 로그인/회원가입, 데이터베이스는 없습니다. 대화 기록은
  브라우저를 새로고침하면 초기화됩니다.
- `frontend/.dev.vars`는 절대 git에 커밋하지 마세요 (`.gitignore`에 이미 포함되어 있습니다).
- 대화 품질이 부족하면 `frontend/functions/api/chat.ts`의 모델명을 `gpt-4o-mini`에서
  `gpt-4o`로 바꾸면 됩니다.
