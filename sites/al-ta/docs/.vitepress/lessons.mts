// 章・レッスンの定義（サイドバーの元データ）。
// カリキュラムを変えるときは sites/al-ta/CLAUDE.md の対応表・docs/index.md・docs/quiz/types.ts も同期する。
export type LessonDef = { n: number; title: string };
export type ChapterDef = { id: number; title: string; lessons: LessonDef[] };

export const chapterDefs: ChapterDef[] = [
  {
    id: 1,
    title: "テストプロセスにおけるテストアナリストのタスク",
    lessons: [
      { n: 1, title: "SDLC におけるテストアナリストの関わり" },
      { n: 2, title: "テスト活動への関与" },
      { n: 3, title: "ハイレベル／ローレベルテストケースと品質基準" },
      { n: 4, title: "テスト環境要件とテストデータ要件" },
      { n: 5, title: "テストオラクルの決定" },
      { n: 6, title: "キーワード駆動テスト" },
      { n: 7, title: "テストウェアをマネジメントするツール" },
    ],
  },
  {
    id: 2,
    title: "リスクベースドテストにおけるテストアナリストのタスク",
    lessons: [
      { n: 8, title: "プロダクトリスク分析への貢献" },
      { n: 9, title: "リグレッションテストの範囲の決定" },
    ],
  },
  {
    id: 3,
    title: "テスト分析とテスト設計",
    lessons: [
      { n: 10, title: "ドメインテスト" },
      { n: 11, title: "組み合わせテスト" },
      { n: 12, title: "ランダムテスト" },
      { n: 13, title: "CRUD テスト" },
      { n: 14, title: "状態遷移テスト" },
      { n: 15, title: "シナリオベースドテスト" },
      { n: 16, title: "デシジョンテーブルテスト" },
      { n: 17, title: "メタモルフィックテスト" },
      { n: 18, title: "セッションベースドテストのテストチャーター" },
      { n: 19, title: "経験ベースのテストを支援するチェックリスト" },
      { n: 20, title: "クラウドテスト" },
      { n: 21, title: "テスト技法の選択" },
      { n: 22, title: "テスト設計の自動化" },
    ],
  },
  {
    id: 4,
    title: "品質特性のテスト",
    lessons: [
      { n: 23, title: "機能テスト" },
      { n: 24, title: "使用性テスト" },
      { n: 25, title: "柔軟性テストと互換性テスト" },
    ],
  },
  {
    id: 5,
    title: "ソフトウェア欠陥予防",
    lessons: [
      { n: 26, title: "欠陥予防の実践" },
      { n: 27, title: "モデルを使った仕様の欠陥検出" },
      { n: 28, title: "レビュー技法の応用" },
      { n: 29, title: "テスト結果の分析" },
      { n: 30, title: "欠陥分類と根本原因分析" },
    ],
  },
];

export const lessonId = (n: number) => `lesson${String(n).padStart(2, "0")}`;
