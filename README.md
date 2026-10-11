# JSTQB 学習コンテンツ（モノレポ）

JSTQB（日本ソフトウェアテスト資格認定委員会）の資格の合格を目指す、**非公式・非公認**の学習コンテンツを管理するモノレポです。資格ごとに 1 つのサイトを `sites/` に置き、ドリルの部品やテーマなどの共通部分は `packages/shared/` で共有します。

## 出典・著作権表示

各教材は、それぞれ対応するシラバスを参考にした派生著作物です。教材ごとの表示は次のとおりです。

### Foundation Level

> 本教材は、JSTQB Foundation Level シラバス（Version 2023 V4.0.J02）を参考に作成した**非公式**の学習コンテンツです。シラバスの著作権は International Software Testing Qualifications Board（ISTQB®）に、日本語翻訳版の著作権は Japan Software Testing Qualifications Board（JSTQB®）に帰属します（Translation Copyright © 2005-2023 JSTQB®, all rights reserved）。本教材は ISTQB®／JSTQB® が承認・公認したものではありません。正確な内容は必ず公式シラバス（<https://www.jstqb.jp/syllabus/>）をご確認ください。

### Advanced Level テストアナリスト

> 本教材は、JSTQB Advanced Level シラバス テストアナリスト（Version 4.0.J01）を参考に作成した非公式の学習コンテンツです。シラバスの著作権は ISTQB® に、日本語翻訳版の著作権は JSTQB®（Translation Copyright © 2005-2026 JSTQB®, all rights reserved）に帰属します。本教材は ISTQB®／JSTQB® が承認・公認したものではありません。

## サイト一覧

| サイト | 対象資格 | ディレクトリ | 状態 |
|---|---|---|---|
| FL | JSTQB Foundation Level（全 6 章 30 レッスン・ドリル 186 問） | [`sites/fl/`](./sites/fl/) | 公開中 |
| AL-TA | JSTQB Advanced Level テストアナリスト（全 5 章 30 レッスン） | [`sites/al-ta/`](./sites/al-ta/) | 準備中 |

各サイトの詳細は、サイトのディレクトリにある `README.md` と `CLAUDE.md` を参照してください。

## リポジトリの構成

```
package.json                   workspaces と横断スクリプト
vercel.json                    FL の既存 Vercel プロジェクト用の設定
CLAUDE.md                      モノレポ共通の方針（執筆スタイル・図版・ドリル・運用ルール）
PLAYBOOK.md                    新サイトの立ち上げと公開後の運用手順
.github/workflows/build.yml    サイト別のビルド・lint・ドリル検証
.claude/                       品質チェック用のフックとスキル
references/                    非公開の一次資料（git 管理外）
packages/shared/               全サイト共通の部品（ドリルの Vue 部品・テーマ CSS・問題の型・検証スクリプト）
sites/fl/                      Foundation Level 教材
sites/al-ta/                   Advanced Level テストアナリスト教材
```

## 技術スタック

- [VitePress](https://vitepress.dev/) + PWA（`@vite-pwa/vitepress`）
- [Mermaid](https://mermaid.js.org/)（`vitepress-plugin-mermaid`）— 図解
- vitepress-plugin-tabs — タブ表示
- markdown-it-cjk-friendly — 日本語の強調記法の表示崩れ対策
- textlint（`preset-ja-technical-writing`）— 日本語文章の校正
- Vue 3 — ドリルのカスタムコンポーネント
- npm workspaces — モノレポ
- Vercel — ホスティング
- GitHub Actions — `main` と PR でサイト別にビルド・lint・ドリル検証

## 開発コマンド

リポジトリのルートで実行します。サイトを指定するときは `-w sites/<site>` を付けます（例: `-w sites/fl`）。

```bash
npm install                            # 依存関係のインストール（全 workspace）

npm run docs:dev -w sites/fl           # 開発サーバー http://localhost:5173
npm run docs:build -w sites/fl         # 本番ビルド
npm run docs:lint -w sites/fl          # textlint で日本語を校正
npm run quiz:validate -w sites/fl      # ドリルデータの検証

npm run docs:build                     # 全サイトをビルド
npm run docs:lint                      # 全サイトを lint
npm run quiz:validate                  # 全サイトのドリルを検証

npm run fl:dev                         # FL のショートカット（fl:build / fl:preview / fl:test:e2e もあり）
```

## レッスン・ドリルの追加方法

共通の方針は [`CLAUDE.md`](./CLAUDE.md)、サイト固有の方針は `sites/<site>/CLAUDE.md` に記載しています。新しいサイトを立ち上げる手順は [`PLAYBOOK.md`](./PLAYBOOK.md) を参照してください。

## デプロイ

- main ブランチへの push で Vercel が自動デプロイします
- FL の既存 Vercel プロジェクトはルートの `vercel.json` を使い、Root Directory を変えずに `sites/fl` をビルドします
- 新しいサイトの Vercel プロジェクトは、Root Directory を `sites/<site>` にして作成します

## 参考にしたリポジトリ

同じ仕組みで作られた学習コンテンツ:

- [ux-certification-basics-ozaki25](https://github.com/ozaki25/ux-certification-basics-ozaki25)
