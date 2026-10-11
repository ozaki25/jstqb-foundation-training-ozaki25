import type { ChapterMeta as BaseChapterMeta } from "@jstqb/shared/quiz/types";

export type { Difficulty, Quiz, QuizFigure, StoredAnswer, StoredAnswers } from "@jstqb/shared/quiz/types";

export type ChapterId = 1 | 2 | 3 | 4 | 5;

export type ChapterMeta = BaseChapterMeta<ChapterId>;

export const STORAGE_KEY = "quiz-answers";

// 模擬試験の問題数（ドリル一覧のボタンと /quiz/random-N/ ページに使う）
export const MOCK_EXAM_SIZE = 45;

// 模擬試験の出題配分。ISTQB Exam Structures & Rules Tables v1.19 の学習目標ごとの出題数に合わせる
// （章ごとに 8／3／22／4／8 問。K2・K3・K4 の比率も本番と同じになる）。
// lesson03・04・05・07 は試験表で 1 つの出題グループ（TA-1.3.1〜1.3.5・1.3.7 で 4 問）。
export const MOCK_EXAM_QUOTA: { lessons: string[]; count: number }[] = [
  { lessons: ["lesson01"], count: 1 },
  { lessons: ["lesson02"], count: 2 },
  { lessons: ["lesson03", "lesson04", "lesson05", "lesson07"], count: 4 },
  { lessons: ["lesson06"], count: 1 },
  { lessons: ["lesson08"], count: 1 },
  { lessons: ["lesson09"], count: 2 },
  { lessons: ["lesson10"], count: 2 },
  { lessons: ["lesson11"], count: 2 },
  { lessons: ["lesson12"], count: 1 },
  { lessons: ["lesson13"], count: 1 },
  { lessons: ["lesson14"], count: 2 },
  { lessons: ["lesson15"], count: 2 },
  { lessons: ["lesson16"], count: 2 },
  { lessons: ["lesson17"], count: 2 },
  { lessons: ["lesson18"], count: 2 },
  { lessons: ["lesson19"], count: 2 },
  { lessons: ["lesson20"], count: 1 },
  { lessons: ["lesson21"], count: 2 },
  { lessons: ["lesson22"], count: 1 },
  { lessons: ["lesson23"], count: 1 },
  { lessons: ["lesson24"], count: 1 },
  { lessons: ["lesson25"], count: 2 },
  { lessons: ["lesson26"], count: 1 },
  { lessons: ["lesson27"], count: 2 },
  { lessons: ["lesson28"], count: 2 },
  { lessons: ["lesson29"], count: 2 },
  { lessons: ["lesson30"], count: 1 },
];

export const chapters: ChapterMeta[] = [
  { id: 1, title: "テストプロセスにおけるテストアナリストのタスク", lessonRange: ["lesson01", "lesson07"] },
  { id: 2, title: "リスクベースドテストにおけるテストアナリストのタスク", lessonRange: ["lesson08", "lesson09"] },
  { id: 3, title: "テスト分析とテスト設計", lessonRange: ["lesson10", "lesson22"] },
  { id: 4, title: "品質特性のテスト", lessonRange: ["lesson23", "lesson25"] },
  { id: 5, title: "ソフトウェア欠陥予防", lessonRange: ["lesson26", "lesson30"] },
];
