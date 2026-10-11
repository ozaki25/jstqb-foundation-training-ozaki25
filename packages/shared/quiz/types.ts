// 全サイト共通のドリル型。章メタ（chapters）と保存キー（STORAGE_KEY）は
// 各サイトの docs/quiz/types.ts で定義する。

export type Difficulty = "easy" | "normal" | "hard";

// 問題・解説に添える図表。セル・本文では `code` 記法だけが使える（QuizCard の renderText と同じ）。
// 表: デシジョンテーブル・トレーサビリティ表など。rowHeader が true なら各行の先頭セルを行見出しにする
//     （スマホで横スクロールしても見出し列は固定表示）。caption は表の名前として読み上げられるので必須。
export type QuizTable = {
  type: "table";
  caption: string;
  headers: string[];
  rows: string[][];
  rowHeader?: boolean;
};
// 図: 状態遷移図・アクティビティ図などは Mermaid で書く（レッスンと同じ見た目で、ダークモードの切り替えにも追従する）。
// alt は図の内容を文章で説明したもの（読み上げ用。必須）。ラベル内の改行は \n を使う。
export type QuizMermaid = { type: "mermaid"; code: string; alt: string; caption?: string };
// 画像: Mermaid で描けない図だけに使う。src は docs/public 配下の SVG（ダークモード対応必須）。
export type QuizImage = { type: "image"; src: string; alt: string; caption?: string };
// 整形済みテキスト: キーワード駆動のテストスクリプト、条件式、ユースケースの手順など。
export type QuizPre = { type: "pre"; caption?: string; text: string };
export type QuizFigure = QuizTable | QuizMermaid | QuizImage | QuizPre;

export type Quiz = {
  id: string;
  lesson: string;
  difficulty: Difficulty;
  question: string;
  choices: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
  // 問題文の直後に表示する図表（任意）
  figures?: QuizFigure[];
  // 解説の直後に表示する図表（任意。最小化後のデシジョンテーブルなど）
  explanationFigures?: QuizFigure[];
};

export type StoredAnswer = { correct: boolean; ts: number; selectedIndex?: number | null };
export type StoredAnswers = Record<string, StoredAnswer>;

export type ChapterMeta<Id extends number = number> = {
  id: Id;
  title: string;
  lessonRange: [string, string];
};
