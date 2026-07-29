// 클라이언트는 "basic"/"advanced" 키만 다루고, 실제 OpenAI 모델 문자열은 서버가
// 화이트리스트로 강제 매핑합니다 (클라이언트가 임의 모델명을 지정해 예상 밖의 비용을
// 유발하지 못하도록 하는 보안/비용 방어).
export type ModelKey = "basic" | "advanced";

export const DEFAULT_MODEL_KEY: ModelKey = "basic";

const MODEL_MAP: Record<ModelKey, string> = {
  basic: "gpt-4o-mini",
  advanced: "gpt-4o",
};

export function resolveModel(key: unknown): string {
  return key === "advanced" ? MODEL_MAP.advanced : MODEL_MAP.basic;
}
