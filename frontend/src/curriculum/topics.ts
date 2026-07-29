// 주제 목록 / Topic list
// worker/systemPrompt.ts 의 주제 id와 반드시 동일하게 유지해야 합니다.

export interface Topic {
  id: string;
  titleKo: string;
  titleEn: string;
  emoji: string;
}

export const TOPICS: Topic[] = [
  { id: "self_introduction", titleKo: "자기소개", titleEn: "Self Introduction", emoji: "👋" },
  { id: "favorite_food", titleKo: "좋아하는 음식", titleEn: "Favorite Food", emoji: "🍎" },
  { id: "animals", titleKo: "동물", titleEn: "Animals", emoji: "🐶" },
  { id: "school", titleKo: "학교", titleEn: "School", emoji: "🎒" },
  { id: "family", titleKo: "가족", titleEn: "Family", emoji: "👨‍👩‍👧" },
  { id: "hobbies", titleKo: "취미", titleEn: "Hobbies", emoji: "🎨" },
];
