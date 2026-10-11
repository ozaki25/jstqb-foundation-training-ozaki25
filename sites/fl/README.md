# JSTQB Foundation Level 学習コンテンツ

> 本教材は、JSTQB Foundation Level シラバス（Version 2023 V4.0.J02）を参考に作成した**非公式**の学習コンテンツです。シラバスの著作権は International Software Testing Qualifications Board（ISTQB®）に、日本語翻訳版の著作権は Japan Software Testing Qualifications Board（JSTQB®）に帰属します（Translation Copyright © 2005-2023 JSTQB®, all rights reserved）。本教材は ISTQB®／JSTQB® が承認・公認したものではありません。正確な内容は必ず公式シラバス（<https://www.jstqb.jp/syllabus/>）をご確認ください。

JSTQB Foundation Level（テスト技術者資格）の合格を目指す学習コンテンツです。

全 6 章 30 レッスンで構成し、1 レッスン 1 トピックで段階的に学べるようにしています。

このディレクトリは、リポジトリ全体（モノレポ）の 1 サイトです。リポジトリ全体の説明はルートの [`README.md`](../../README.md) を参照してください。

## コンテンツ

- **30 レッスン**: 公式シラバス（Version 2023 V4.0.J02）の全6章に対応。図解・試験のポイント付き。用語定義は用語集に集約
- **ドリル 186 問**: 章別出題・ランダム（5/10問）・本番形式の模擬試験（40問）・復習に対応。回答履歴をブラウザに保存
- 試験形式: 40問・60分・合格ライン65%（40問中26問）・K1〜K3レベル

## 技術スタック

- [VitePress](https://vitepress.dev/) + PWA（`@vite-pwa/vitepress`）
- [Mermaid](https://mermaid.js.org/)（`vitepress-plugin-mermaid`）— 図解
- vitepress-plugin-tabs — タブ表示
- markdown-it-cjk-friendly — 日本語の強調記法の表示崩れ対策
- textlint（`preset-ja-technical-writing`）— 日本語文章の校正
- Vue 3 — ドリルのカスタムコンポーネント（共通部品は `packages/shared/`）
- Vercel — ホスティング
- GitHub Actions — `main` と PR でビルド・lint・ドリル検証

## クイックスタート

リポジトリのルートで実行します。

```bash
npm install
npm run docs:dev -w sites/fl   # 開発サーバー http://localhost:5173
```

## 主なコマンド

リポジトリのルートで実行します。`npm run fl:dev` などのショートカットも使えます。

```bash
npm run docs:dev -w sites/fl       # ローカル開発サーバー（fl:dev）
npm run docs:build -w sites/fl     # 本番ビルド（fl:build）
npm run docs:preview -w sites/fl   # ビルド結果のプレビュー（fl:preview）
npm run docs:lint -w sites/fl      # textlint で日本語を校正
npm run quiz:validate -w sites/fl  # ドリルデータの検証
npm run check:bold -w sites/fl     # 太字の崩れ検査
npm run check:style -w sites/fl    # レッスンの型の機械検査
npm run test:e2e -w sites/fl       # ドリルの E2E テスト（fl:test:e2e）
npm run pwa:icons -w sites/fl      # logo.svg から PWA アイコンを生成
```

## ディレクトリ構成

```
docs/
  index.md                     トップページ
  lessons/lessonNN/index.md    各レッスン（lesson01〜lesson30）
  quiz/                        ドリル（4 択問題）
    types.ts                   章メタ情報・保存キー（共通の型は packages/shared/quiz/types.ts）
    data/chapterN.ts           章ごとの問題データ
    chapterN/index.md          章別ドリルページ
    random/ random-5/ random-10/ random-40/ review/   ランダム・模擬試験（40問）・復習ページ
  glossary/                    用語集ページ
  about/                       出典・免責ページ
  public/                      アイコン・OGP画像等
  .vitepress/
    config.mts                 サイト設定（nav・サイドバー・PWA・SEO）
    theme/index.ts             共通テーマ（packages/shared/theme）の読み込み
tests/                         ドリルの E2E テスト
FACTCHECK.md                   事実確認の台帳
SPRINTLOG.md                   開発の経緯
```

ドリルの Vue コンポーネント・テーマ CSS・検証スクリプトは、リポジトリ直下の `packages/shared/` にあります。

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

詳細はリポジトリ直下の [`CLAUDE.md`](../../CLAUDE.md)（共通の執筆スタイル・図版作成のガイドライン）と、この教材の [`CLAUDE.md`](./CLAUDE.md)（用語統一ルール・章対応表）を参照してください。

## デプロイ

- main ブランチへの push で Vercel が自動デプロイします
- 既存の Vercel プロジェクトはリポジトリ直下の `vercel.json` を使い、Root Directory を変えずに `sites/fl` をビルドします（Root Directory を `sites/fl` にする場合は `sites/fl/vercel.json`）

## 参考にしたリポジトリ

同じ仕組みで作られた学習コンテンツ:

- [ux-certification-basics-ozaki25](https://github.com/ozaki25/ux-certification-basics-ozaki25)
