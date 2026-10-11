// 全サイト共通のドリル型。章メタ（chapters）と保存キー（STORAGE_KEY）は
// 各サイトの docs/quiz/types.ts で定義する。

export type Difficulty = "easy" | "normal" | "hard";

export type Quiz = {
  id: string;
  lesson: string;
  difficulty: Difficulty;
  question: string;
  choices: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
};

export type StoredAnswer = { correct: boolean; ts: number; selectedIndex?: number | null };
export type StoredAnswers = Record<string, StoredAnswer>;

export type ChapterMeta<Id extends number = number> = {
  id: Id;
  title: string;
  lessonRange: [string, string];
};
