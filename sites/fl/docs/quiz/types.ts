import type { ChapterMeta as BaseChapterMeta } from "@jstqb/shared/quiz/types";

export type { Difficulty, Quiz, QuizFigure, StoredAnswer, StoredAnswers } from "@jstqb/shared/quiz/types";

export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6;

export type ChapterMeta = BaseChapterMeta<ChapterId>;

export const STORAGE_KEY = "quiz-answers";

// 模擬試験の問題数（ドリル一覧のボタンと /quiz/random-N/ ページに使う）
export const MOCK_EXAM_SIZE = 40;

export const chapters: ChapterMeta[] = [
  { id: 1, title: "テストの基礎", lessonRange: ["lesson01", "lesson05"] },
  { id: 2, title: "ソフトウェア開発ライフサイクル全体を通してのテスト", lessonRange: ["lesson06", "lesson10"] },
  { id: 3, title: "静的テスト", lessonRange: ["lesson11", "lesson13"] },
  { id: 4, title: "テスト分析と設計", lessonRange: ["lesson14", "lesson21"] },
  { id: 5, title: "テスト活動のマネジメント", lessonRange: ["lesson22", "lesson28"] },
  { id: 6, title: "テストツール", lessonRange: ["lesson29", "lesson30"] },
];
