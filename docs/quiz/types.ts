export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6;

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

export const STORAGE_KEY = "quiz-answers";

export type StoredAnswer = { correct: boolean; ts: number; selectedIndex?: number | null };
export type StoredAnswers = Record<string, StoredAnswer>;

export type ChapterMeta = {
  id: ChapterId;
  title: string;
  lessonRange: [string, string];
};

export const chapters: ChapterMeta[] = [
  { id: 1, title: "テストの基礎", lessonRange: ["lesson01", "lesson05"] },
  { id: 2, title: "ソフトウェア開発ライフサイクル全体を通してのテスト", lessonRange: ["lesson06", "lesson10"] },
  { id: 3, title: "静的テスト", lessonRange: ["lesson11", "lesson13"] },
  { id: 4, title: "テスト分析と設計", lessonRange: ["lesson14", "lesson21"] },
  { id: 5, title: "テスト活動のマネジメント", lessonRange: ["lesson22", "lesson28"] },
  { id: 6, title: "テストツール", lessonRange: ["lesson29", "lesson30"] },
];
