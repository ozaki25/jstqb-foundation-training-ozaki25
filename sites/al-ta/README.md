# JSTQB Advanced Level テストアナリスト 学習コンテンツ

> 本教材は、JSTQB Advanced Level シラバス テストアナリスト（Version 4.0.J01）を参考に作成した**非公式・非公認**の学習コンテンツです。シラバスの著作権は International Software Testing Qualifications Board（ISTQB®）に、日本語翻訳版の著作権は Japan Software Testing Qualifications Board（JSTQB®）に帰属します（Translation Copyright © 2005-2026 JSTQB®, all rights reserved）。本教材は ISTQB®／JSTQB® が承認・公認したものではありません。正確な内容は必ず公式シラバス（<https://www.jstqb.jp/syllabus/>）をご確認ください。

JSTQB Advanced Level テストアナリスト（CTAL-TA V4.0）の合格を目指す学習コンテンツです（立ち上げ中）。

全 5 章 30 レッスンで構成し、1 レッスンがシラバスの 1 項（学習目標）に対応します。このディレクトリは、リポジトリ全体（モノレポ）の 1 サイトです。リポジトリ全体の説明はルートの [`README.md`](../../README.md) を参照してください。

## 現状

- 土台（サイト設定・ブランドカラー・ドリルのページ・出典表示）が完成しています
- レッスン本文とドリルの問題は準備中です。各レッスンのページにはプレースホルダを置いています
- 前提は Foundation Level の知識です。試験形式は ISTQB v4.0 の基準（45 問・78 点満点・合格 51 点・120 分）で、日本の V4.0 試験の正式な形式は未発表です。詳細は [`CLAUDE.md`](./CLAUDE.md) と [`FACTCHECK.md`](./FACTCHECK.md) を参照してください

## クイックスタート

リポジトリのルートで実行します。

```bash
npm install
npm run docs:dev -w sites/al-ta   # 開発サーバー http://localhost:5173
```

## 主なコマンド

リポジトリのルートで実行します。

```bash
npm run docs:dev -w sites/al-ta       # ローカル開発サーバー
npm run docs:build -w sites/al-ta     # 本番ビルド
npm run docs:preview -w sites/al-ta   # ビルド結果のプレビュー
npm run docs:lint -w sites/al-ta      # textlint で日本語を校正
npm run quiz:validate -w sites/al-ta  # ドリルデータの検証
npm run check:bold -w sites/al-ta     # 太字の崩れ検査
npm run check:style -w sites/al-ta    # レッスンの型の機械検査
npm run pwa:icons -w sites/al-ta      # logo.svg から PWA アイコンを生成
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
    random/ random-5/ random-10/ random-45/ review/   ランダム・模擬試験（45問）・復習ページ
  glossary/                    用語集ページ
  about/                       出典・免責ページ
  public/                      アイコン・OGP画像等
  .vitepress/
    config.mts                 サイト設定（nav・サイドバー・PWA・SEO）
    lessons.mts                章・レッスンの定義（サイドバーの元データ）
    theme/index.ts             共通テーマ（packages/shared/theme）の読み込み
    theme/al-ta.css            ブランドカラー（深いティール）の上書き
FACTCHECK.md                   事実確認の台帳
SPRINTLOG.md                   開発の経緯
```

ドリルの Vue コンポーネント・共通テーマ CSS・検証スクリプトは、リポジトリ直下の `packages/shared/` にあります。

## 章とレッスンの対応

| 章 | テーマ | レッスン |
|----|--------|----------|
| 1 | テストプロセスにおけるテストアナリストのタスク | lesson01〜07 |
| 2 | リスクベースドテストにおけるテストアナリストのタスク | lesson08〜09 |
| 3 | テスト分析とテスト設計 | lesson10〜22 |
| 4 | 品質特性のテスト | lesson23〜25 |
| 5 | ソフトウェア欠陥予防 | lesson26〜30 |

## デプロイ

- main ブランチへの push で Vercel が自動デプロイします
- Vercel のプロジェクトは Root Directory を `sites/al-ta` に設定します。`sites/al-ta/vercel.json` のビルドコマンドと出力ディレクトリが使われます
