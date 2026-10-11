import type { ChapterMeta as BaseChapterMeta } from "@jstqb/shared/quiz/types";

export type { Difficulty, Quiz, QuizFigure, StoredAnswer, StoredAnswers } from "@jstqb/shared/quiz/types";

export type ChapterId = 1 | 2 | 3 | 4 | 5;

export type ChapterMeta = BaseChapterMeta<ChapterId>;

export const STORAGE_KEY = "quiz-answers";

export const chapters: ChapterMeta[] = [
  { id: 1, title: "テストプロセスにおけるテストアナリストのタスク", lessonRange: ["lesson01", "lesson07"] },
  { id: 2, title: "リスクベースドテストにおけるテストアナリストのタスク", lessonRange: ["lesson08", "lesson09"] },
  { id: 3, title: "テスト分析とテスト設計", lessonRange: ["lesson10", "lesson22"] },
  { id: 4, title: "品質特性のテスト", lessonRange: ["lesson23", "lesson25"] },
  { id: 5, title: "ソフトウェア欠陥予防", lessonRange: ["lesson26", "lesson30"] },
];
