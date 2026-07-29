// 학년별 영어 난이도 12단계 정의 / 12-level grade-based English difficulty
// frontend(src, 설정 화면 표시용)와 worker(시스템 프롬프트 조합용) 양쪽에서 함께 사용하는
// 단일 소스입니다. 이름 충돌 방지: 이 학년 난이도는 항상 levelId/gradeLevel로 부르고,
// worker/systemPrompt.ts의 기존 Topic.level(주제 자체 복잡도, 1~3)과는 다른 개념입니다.
export type LevelId =
  | "e1"
  | "e2"
  | "e3"
  | "e4"
  | "e5"
  | "e6"
  | "m1"
  | "m2"
  | "m3"
  | "h1"
  | "h2"
  | "h3";

export interface LevelDefinition {
  id: LevelId;
  labelKo: string;
  description: string;
  tutoringStyle: string;
}

export const LEVELS: LevelDefinition[] = [
  {
    id: "e1",
    labelKo: "초등학교 1학년",
    description: "단어 위주, 인사·색깔·숫자·동물 이름 정도의 매우 쉬운 단계",
    tutoringStyle: `Use single words or 2-3 word phrases only (e.g. "Hello!", "A dog!", "Red color!").
Vocabulary: greetings, colors, numbers 1-10, animals, family words. Ask mostly Yes/No or
simple choice questions ("Is it a cat or a dog?"). Never use past tense or complex grammar.`,
  },
  {
    id: "e2",
    labelKo: "초등학교 2학년",
    description: "3~5단어의 짧은 문장, 현재시제 중심, 가족·음식·색깔 소재",
    tutoringStyle: `Use 3-5 word sentences with simple present tense only (e.g. "I like apples.",
"I have a dog."). Vocabulary: family, food, colors, simple daily objects. Avoid past/future
tense and connector words.`,
  },
  {
    id: "e3",
    labelKo: "초등학교 3학년",
    description: "5~8단어 문장, 현재/과거시제, 자기소개·취미 등 기본 생활 주제",
    tutoringStyle: `Use SHORT sentences (5-8 words), simple present/past tense, and common
vocabulary (numbers, colors, family, animals, food, school). Never use complex grammar,
idioms, or advanced vocabulary.`,
  },
  {
    id: "e4",
    labelKo: "초등학교 4학년",
    description: "6~9단어 문장, 과거·will 미래, because로 이유 설명하기",
    tutoringStyle: `Use 6-9 word sentences. Introduce simple past tense and "will" for future
plans. Encourage the child to give a short reason using "because" (e.g. "I like dogs because
they are cute."). Use descriptive adjectives.`,
  },
  {
    id: "e5",
    labelKo: "초등학교 5학년",
    description: "and/but/so로 문장 연결, 의견 말하기, 비교하기",
    tutoringStyle: `Encourage connecting ideas with "and", "but", "so". Introduce simple opinions
("I think...") and comparisons ("bigger than", "more fun than"). Ask about daily routines and
preferences with a short reason.`,
  },
  {
    id: "e6",
    labelKo: "초등학교 6학년",
    description: "다양한 연결어, 미래 계획, 짧은 이야기(사건) 다시 말하기",
    tutoringStyle: `Use a wider range of connectors ("because", "after that", "then"). Encourage
talking about future plans and retelling a simple recent event in 2-3 sentences. Ask follow-up
questions that need more than a one-word answer.`,
  },
  {
    id: "m1",
    labelKo: "중학교 1학년",
    description: "학교생활·주말계획 등 일상 대화, 감정과 이유 함께 표현",
    tutoringStyle: `Discuss everyday topics like school life and weekend plans. Encourage
expressing feelings with a reason (e.g. "I'm excited because..."). Light use of relative
clauses is okay if the child attempts it, but do not require it.`,
  },
  {
    id: "m2",
    labelKo: "중학교 2학년",
    description: "if 조건문, 환경·우정 같은 쉬운 의견 주제, 동의/반대 표현",
    tutoringStyle: `Introduce simple if-conditionals ("If it rains, I will..."). Discuss easy
opinion topics like friendship or the environment. Encourage simple agree/disagree responses
with a short reason.`,
  },
  {
    id: "m3",
    labelKo: "중학교 3학년",
    description: "비교·대조 표현, 진로·사회 등 초보 주제에 근거 있는 의견 말하기",
    tutoringStyle: `Encourage comparing and contrasting options with reasons. Introduce
beginner-level social/career topics. Ask the child to give a short opinion with at least one
supporting reason.`,
  },
  {
    id: "h1",
    labelKo: "고등학교 1학년",
    description: "복잡한 문장 구조, 쉬운 시사 주제, 짧은 설득 표현",
    tutoringStyle: `Allow more complex sentence structures (subordinate clauses). Discuss
easy current-events topics appropriate for a teenager. Encourage short persuasive statements
("I believe... because...").`,
  },
  {
    id: "h2",
    labelKo: "고등학교 2학년",
    description: "유창한 의견 교환, 기술·사회 이슈 등 추상적 주제",
    tutoringStyle: `Encourage fluent back-and-forth opinion exchange on more abstract topics
(technology, social issues). Push gently for nuance ("On the other hand...") rather than
one-line answers.`,
  },
  {
    id: "h3",
    labelKo: "고등학교 3학년",
    description: "고급 어휘·복문, 토론식 대화, 수능/면접 말하기 대비",
    tutoringStyle: `Use advanced vocabulary and complex sentences when appropriate. Engage in
discussion/debate-style exchanges. Ask questions similar in style to exam speaking tests or
interview practice, while staying encouraging and low-pressure.`,
  },
];

export const DEFAULT_LEVEL_ID: LevelId = "e3";

export function isValidLevelId(value: unknown): value is LevelId {
  return typeof value === "string" && LEVELS.some((level) => level.id === value);
}

export function getLevelById(id: string): LevelDefinition {
  return LEVELS.find((level) => level.id === id) ?? LEVELS.find((level) => level.id === DEFAULT_LEVEL_ID)!;
}
