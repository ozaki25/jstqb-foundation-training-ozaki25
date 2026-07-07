# JSTQB Foundation Level 学習コンテンツ

> 本教材は、JSTQB Foundation Level シラバス（Version 2023 V4.0.J02）を参考に作成した**非公式**の学習コンテンツです。シラバスの著作権は International Software Testing Qualifications Board（ISTQB®）に、日本語翻訳版の著作権は Japan Software Testing Qualifications Board（JSTQB®）に帰属します（Translation Copyright © 2005-2023 JSTQB®, all rights reserved）。本教材は ISTQB®／JSTQB® が承認・公認したものではありません。正確な内容は必ず公式シラバス（<https://www.jstqb.jp/syllabus/>）をご確認ください。

JSTQB Foundation Level（テスト技術者資格）の合格を目指す学習コンテンツです。

全 6 章 30 レッスンで構成し、1 レッスン 1 トピックで段階的に学べるようにしています。

## コンテンツ

- **30 レッスン**: 公式シラバス（Version 2023 V4.0.J02）の全6章に対応。図解・キーワード・試験のポイント付き
- **ドリル 186 問**: 章別出題・ランダム（5/10問）・本番形式の模擬試験（40問）・復習に対応。回答履歴をブラウザに保存
- 試験形式: 40問・60分・合格ライン65%（40問中26問）・K1〜K3レベル

## 技術スタック

- [VitePress](https://vitepress.dev/) + PWA（`@vite-pwa/vitepress`）
- [Mermaid](https://mermaid.js.org/)（`vitepress-plugin-mermaid`）— 図解
- vitepress-plugin-tabs — タブ表示
- markdown-it-cjk-friendly — 日本語の強調記法の表示崩れ対策
- textlint（`preset-ja-technical-writing`）— 日本語文章の校正
- Vue 3 — ドリルのカスタムコンポーネント
- Vercel — ホスティング
- GitHub Actions — `main` と PR でビルド・lint・ドリル検証

## クイックスタート

```bash
npm install
npm run docs:dev   # 開発サーバー http://localhost:5173
```

## 主なコマンド

```bash
npm run docs:dev       # ローカル開発サーバー
npm run docs:build     # 本番ビルド
npm run docs:preview   # ビルド結果のプレビュー
npm run docs:lint      # textlint で日本語を校正
npm run quiz:validate  # ドリルデータの検証
npm run pwa:icons      # logo.svg から PWA アイコンを生成
```

## ディレクトリ構成

```
docs/
  index.md                     トップページ
  lessons/lessonNN/index.md    各レッスン（lesson01〜lesson30）
  quiz/                        ドリル（4 択問題）
    types.ts                   型定義・章メタ情報
    data/chapterN.ts           章ごとの問題データ
    chapterN/index.md          章別ドリルページ
    random/ random-5/ random-10/ random-40/ review/   ランダム・模擬試験（40問）・復習ページ
  glossary/                    用語集ページ
  about/                       出典・免責ページ
  public/                      アイコン・OGP画像等
  .vitepress/
    config.mts                 サイト設定（nav・サイドバー・PWA・SEO）
    theme/                     カスタムテーマ・Vue コンポーネント
scripts/quiz-validate.mjs      ドリルデータの検証スクリプト
```

## 章とレッスンの対応

| 章 | テーマ | レッスン |
|----|--------|----------|
| 1 | テストの基礎 | lesson01〜05 |
| 2 | ソフトウェア開発ライフサイクル全体を通してのテスト | lesson06〜10 |
| 3 | 静的テスト | lesson11〜13 |
| 4 | テスト分析と設計 | lesson14〜21 |
| 5 | テスト活動のマネジメント | lesson22〜28 |
| 6 | テストツール | lesson29〜30 |

## レッスン・ドリルの追加方法

詳細は [`CLAUDE.md`](./CLAUDE.md) を参照してください。執筆スタイル・用語統一ルール・図版作成のガイドラインが記載されています。

## デプロイ

- main ブランチへの push で Vercel が自動デプロイします

## 参考にしたリポジトリ

同じ仕組みで作られた学習コンテンツ:

- [ux-certification-basics-ozaki25](https://github.com/ozaki25/ux-certification-basics-ozaki25)
