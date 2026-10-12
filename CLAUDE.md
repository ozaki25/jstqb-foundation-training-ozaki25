# CLAUDE.md

このリポジトリで作業する際の、モノレポ共通の方針をまとめます。サイト固有の方針（試験の前提・章とレッスンの対応・用語の統一ルール・出典表示の文言）は `sites/<site>/CLAUDE.md` に書きます。サイトのディレクトリで作業するときは、この CLAUDE.md と合わせて、そのサイトの CLAUDE.md を必ず読むこと。

## プロジェクト概要

**JSTQB（日本ソフトウェアテスト資格認定委員会）の各資格**の合格を目指す、**非公式・非公認**の学習コンテンツを、1 つの npm workspaces モノレポで管理します。1 レッスンがシラバスの小カテゴリ（またはテスト技法・学習目標）に対応するよう設計します。開発の経緯は各サイトの `SPRINTLOG.md` を参照。

- 各サイトは [VitePress](https://vitepress.dev/) で構築し、Vercel にデプロイします。
- 共通部品（ドリルの Vue コンポーネント・テーマ CSS・問題の型・検証スクリプト）は `packages/shared/` に置き、全サイトで共有します。
- 参考にした既存リポジトリ: `ux-certification-basics-ozaki25`（同じ仕組みの検定学習コンテンツ）。

### サイト一覧と状態

| サイト | 対象資格 | ディレクトリ | 状態 |
|---|---|---|---|
| FL | JSTQB Foundation Level（全 6 章 30 レッスン・ドリル 186 問） | `sites/fl/` | 公開中。`FACTCHECK.md` の裏取りと横断的な品質改善を継続 |
| AL-TA | JSTQB Advanced Level テストアナリスト（全 5 章 30 レッスン・ドリル 180 問） | `sites/al-ta/` | 全レッスン・ドリル完成。`FACTCHECK.md` の裏取りと品質改善を継続 |

- FL の現状・試験の前提は `sites/fl/CLAUDE.md`、AL-TA は `sites/al-ta/CLAUDE.md` を参照。
- 新しいサイトを立ち上げる手順は `PLAYBOOK.md` を参照。

## 試験の前提と一次資料

- 実施: 一般社団法人 日本語ソフトウェアテスト資格認定委員会（JSTQB）。公式: https://www.jstqb.jp/syllabus/
- 一次資料は各資格のシラバス（日本語版）。これが出題範囲の正。バージョン・試験形式・合格ライン・学習目標の K レベルは、サイトごとの CLAUDE.md に書く。
- コンテンツを書く前に、必ず一次資料（`references/` のシラバス）と突き合わせて構成・用語を確認する。

## 出典・著作権（必須・削除禁止）

本教材はシラバスを参考にした派生著作物です。シラバスのライセンスは「著作者および ISTQB® を出典・著作権保有者として明記する限り、派生著作物・トレーニング教材の基礎として利用可」です。この明記義務を満たすため、**各サイトで**以下を**常に維持**する。

- **全ページのフッター**（そのサイトの `docs/.vitepress/config.mts` の `themeConfig.footer`）に出典・著作権表示。
- **トップページ `docs/index.md`** に非公式である旨の warning。
- **`docs/about/`** に出典・免責・商標の詳細ページ。
- **サイトの `README.md`**（`sites/<site>/README.md`）と**ルートの `README.md`** に出典・著作権表示（サイトごとに）。

表示の核となる具体的な文言は、各サイトの CLAUDE.md に書く（シラバスのバージョンと翻訳版の著作権年が資格ごとに異なるため）。サイトを追加・変更するときは、その文言を上の 5 か所に反映する。

- リリース前チェックに「出典表示が全サイト・全ページで生きているか」を必ず含める。
- シラバス本文（条文・図・表現）を**そのまま転載しない**。事実・概念を理解した上で、この教材のスタイルで書き直す。

## 技術スタック

- VitePress + PWA（`@vite-pwa/vitepress`）
- Mermaid（`vitepress-plugin-mermaid`）— 図解
- vitepress-plugin-tabs — タブ表示
- markdown-it-cjk-friendly — 日本語の太字（CJK flanking）対策
- textlint（`preset-ja-technical-writing`）— 日本語文章の校正
- Vue 3 — ドリルのカスタムコンポーネント
- Vercel Analytics / Speed Insights
- npm workspaces — モノレポ（`packages/*` と `sites/*`）
- GitHub Actions — `main` と PR でサイト別にビルド・lint・ドリル検証（matrix）

## ディレクトリ構成

```
package.json                   workspaces と横断スクリプト
vercel.json                    FL の既存 Vercel プロジェクト用（Root Directory 変更なしで sites/fl をビルド）
.textlintrc.json               textlint 設定（全サイト共通）
CLAUDE.md                      モノレポ共通の方針（このファイル）
README.md / PLAYBOOK.md        入口の説明 / 新サイト立ち上げと公開後運用の手順
.github/workflows/build.yml    サイト別 matrix のビルド・lint・検証
.claude/                       品質チェック用フックとスキル（全サイト共通）
references/                    非公開の一次資料（git 管理外。FL は直下、AL-TA は references/al-ta/）
packages/
  shared/                      全サイト共通の部品
    theme/                     共通テーマ（ブランド CSS・ドリル用 Vue コンポーネント components/）
    quiz/types.ts              問題の型（Quiz・QuizFigure・ChapterMeta など）
    scripts/quiz-validate.mjs  ドリルデータの検証スクリプト
    vitepress/git-last-updated.mjs  最終更新日を git 履歴から取る処理
sites/
  fl/                          Foundation Level 教材（公開中）
  al-ta/                       Advanced Level テストアナリスト教材
```

各サイト（`sites/<site>/`）の中身は次のとおり。

```
sites/<site>/
  CLAUDE.md                    サイト固有の方針
  README.md                    サイトの説明（出典表示を冒頭に置く）
  FACTCHECK.md / SPRINTLOG.md  事実確認の台帳 / 開発の経緯
  package.json                 docs:dev / docs:build / docs:lint / quiz:validate / check:bold / check:style など
  vercel.json                  Root Directory を sites/<site> にした場合のビルド設定
  docs/
    index.md                   トップページ（カリキュラム目次）
    about/index.md             出典・免責・商標
    glossary/index.md          用語集
    lessons/lessonNN/index.md  各レッスン
    quiz/                      ドリル（4 択問題）
      types.ts                 章メタ情報・保存キー（共通の型は packages/shared/quiz/types.ts）
      data/chapterN.ts         章ごとの問題データ
      chapterN/index.md        章別ドリルページ
      random/ random-5/ random-10/ random-40/ review/   ランダム・模擬試験・復習ページ
    public/diagrams/           SVG 図版
    .vitepress/
      config.mts               サイト設定（nav・サイドバー・PWA・SEO・フッター）
      theme/index.ts           共通テーマ（@jstqb/shared/theme）の読み込み。サイト固有の見た目はここで CSS を追加
```

## 執筆スタイル

レッスンを書く・直すときは以下を守ります。

- **対象読者**: ソフトウェア開発の経験はあるが体系的なテストの知識は浅く、これから JSTQB FL 受験を目指す社会人・エンジニア。
- **分量**: 1 レッスン＝シラバスの小カテゴリ（またはテスト技法）1 つ分。目安は 10〜20 分程度の学習量（K3 技法など内容の多いレッスンは長くなる）。固定の「◯分」を看板にはせず、1 トピックを過不足なく扱うことを優先する。
- **文体**: です・ます体。
- **構成**: 各レッスンは次の順で書く。
  1. `# lessonNN: テーマ — サブタイトル`
  2. `## このレッスンで学ぶこと`（3〜5 個の箇条書き）
  3. 本文（`## セクション` / `### サブセクション`）
  4. `## 試験のポイント`（受験の切り口の箇条書き。**原則 3 項目・最大 4**）
- **用語定義はレッスンに置かず[用語集](/glossary/)に一本化する**: レッスン内に `## キーワード` 表は作らない。用語の初出は本文で太字（`**用語（よみ）**`）にして文脈で説明し、まとまった定義はサイトの[用語集](/glossary/)（章別・各語からレッスンへ逆リンク）が単一の情報源として担う。表記はシラバス（用語集）に合わせる。
- **`## 試験のポイント`の役割**: 本文の要約ではなく、**受験時に効く「切り口」だけ**を書く。原則 3 項目（多くても 4）に絞り、各項目は次のいずれかの価値を持たせる。(1) 紛らわしい概念の**区別**（例: 確認テスト⇔リグレッションテスト、テストレベル⇔テストタイプ）、(2) **ひっかけ**になりやすい言い回しや例外、(3) **頻出**の学習目標、(4) その学習目標の **K レベル**（K3 なら「導出・計算が問われる」）、(5) K3 技法の**計算・手順**の勘所。単に本文の一文を言い換えただけの項目は載せない。K1 の網羅リストは「N 個を漏れなく想起できるように」の 1 項目に集約し、列挙は本文に置く。
- **図解**: 必要に応じて Mermaid・表・`::: tip` / `::: warning` / `::: info` ブロックを使う。
- **Mermaid のラベル内改行は `\n` を使う**（`<br/>` は使わない。混在させない）。
- **相互参照**は `[lessonNN](/lessons/lessonNN/)` 形式のリンクにする。
- **位置依存の参照を使わない**: 「次のレッスン」「前のレッスン」「前章」など位置を表す語でレッスンを指さない。必ず `[lessonNN]` リンクで指す（カリキュラム再編で壊れないため）。
- **長い段落を作らない**: 3 文以上続く説明や複数の論点を含む段落は、短文・箇条書き・表・図に分解する。「削って短くする」のではなく「分解して読みやすくする」。
- **ピラミッド構造**: テーマ → 柱（3 つ程度）→ 各柱の詳細、の順で設計する。
- **見出しは体言止め・名詞句**で簡潔に。「〜しよう」「〜してみる」のような話しかけ調にしない。
- **セクション区切りに `---`（水平線）を使わない**。見出し自体が区切りになる。
- **本文中に em dash（——）を使わない**（文を分けるかカッコを使う）。レッスンタイトルの `タイトル — サブタイトル` の区切りは例外。
- **アクセシビリティを意識**: 図には意味の伝わる `alt` を必ず付け、色だけに依存しない説明を心がける。

- 対象読者・分量の目安などがサイト固有の場合は、各サイトの CLAUDE.md の記述を優先する。

## 図版（SVG / Mermaid）のルール

- Mermaid は本文に ` ```mermaid ` で書く。複雑な構造の SVG 図は `sites/<site>/docs/public/diagrams/*.svg` に置き `![alt](/diagrams/<name>.svg)` で参照。
- **ファイル名はトピック名**（例: `test-levels.svg`）。`lessonNN` を含めない（カリキュラム再編で破綻するため）。
- **`alt` は省略しない**。図の主旨が伝わる説明を書く。`alt="図"` のような無情報文字列は禁止。
- **ダークモード対応必須**: SVG 内に `<style>` を持たせ、`@media (prefers-color-scheme: dark)` で色を切り替える。白背景・黒文字を固定しない。
- **図は必ず画像へレンダリングして目視確認する**（色依存・重なり・はみ出し・ラベルの読みやすさ。座標の読みだけで判断しない）。グレースケールでも意味が区別できるように、色以外の手がかり（形・記号・ラベル）を併用する。
- 本文に素の `<script>` / `<style>` を書かない（VitePress は SPA でグローバルスコープを共有する）。ドリルページの `<script setup>` は可。

## 非公開の参考資料（references/）

- 一次参考資料として、各資格のシラバスの PDF とテキスト抽出版をローカルの `references/` に置く。FL は `references/` 直下（索引は `references/INDEX.md`）、AL-TA は `references/al-ta/`。新サイトは `references/<site>/` に置く。
- **非公開扱いのため `references/` は git 管理外（.gitignore 済み）。絶対にコミット・プッシュしない。**
- シラバスの内容（図・文章・構成）をそのまま転載しない。事実・概念を理解した上で書き直す。
- リモート実行環境ではセッションごとにファイルが消えるため、消えていたら再アップロードしてもらう。
- この環境は jstqb.jp・istqb.org などへのアクセスが遮断されるため、一次資料は自分で取得せず、ユーザーにアップロードしてもらう（手順は `PLAYBOOK.md` の Phase 1）。

## ドリル（quiz）

全サイト共通のルールです。サイトごとの章構成・難易度の目安・模擬試験の仕様は、各サイトの CLAUDE.md に従う。

- 問題データは `sites/<site>/docs/quiz/data/chapterN.ts` に `Quiz[]` 型で記述する（型は `packages/shared/quiz/types.ts`、章メタ・保存キーは `sites/<site>/docs/quiz/types.ts` を参照）。
- `id` は全体で一意（`q101` のように「q + 章番号 + 連番」）。`lesson` は実在する `lessonNN` を指す。`choices` は 4 つ・重複なし。`answer` は 0〜3。正解位置は散らす。
- 設問の文末は「〜ですか。」に統一する（「？」は使わない）。
- 難易度（`difficulty`）は `easy` / `normal` / `hard` をバランスよく。**シラバスの K レベルに対応づける目安**: K1→easy / K2→normal / K3→hard。K3 の技法レッスンには、実際にテストケースを導出する・カバレッジを計算するタイプの適用問題を入れる。K4 を含む資格の対応づけは、そのサイトの CLAUDE.md に従う。
- 問題・解説はレッスン本文の事実と一致させる。
- **解説で他の設問の答えを明かさない**: 誤答を退けるとき、その誤答（＝別の設問の正解になりうる用語）の定義まで列挙しない。概念名で軽く退けるにとどめる。
- 章別ドリル（`chapterN/index.md`）は**固定順**で出題する（`:shuffle` は付けない）。「途中から再開」を成立させるため。ランダム出題はランダム系ページ（`random` / `random-5` / `random-10` / `random-40`）が担う。
- **選択肢の表示順は `QuizCard.vue` がクライアントで Fisher-Yates シャッフルする。SSR では identity 順で描画し、`onMounted` でシャッフルする**こと。回答の保存は常に元 index で行う。
- **ドリルの `question` / `explanation` では `**`（太字）を使わない**。QuizCard の `renderText` はバッククォート（`` `code` ``）しか変換しない。
- 追加・編集後は必ず `npm run quiz:validate -w sites/<site>` で検証する。

### 図表（figures）の使い方

デシジョンテーブル・トレーサビリティ表・状態遷移図などは、問題（`figures`）や解説（`explanationFigures`）に図表を付けて出す。型は `packages/shared/quiz/types.ts` の `QuizFigure`。

| 種類 | `type` | 使いどころと注意 |
|---|---|---|
| 表 | `table` | `caption` 必須（表の名前として読み上げられる）。条件名やリスク名を行見出しにする表は `rowHeader: true`（スマホで横スクロールしても見出し列が固定される） |
| 図 | `mermaid` | 状態遷移図・アクティビティ図など。レッスンと同じ見た目で、ダークモードに追従する。`alt` に図の内容を文章で書く（読み上げ用。必須）。ラベル内の改行は `\n` |
| 整形済みテキスト | `pre` | キーワード駆動のスクリプト、条件式、ユースケースの手順など。スマホでは折り返して表示される |
| 画像 | `image` | Mermaid で描けない図だけに使う（`sites/<site>/docs/public` の SVG。ダークモード対応必須）。`alt` 必須 |

- 図表のセルや本文で使える記法は `` `code` `` だけ（QuizCard の `renderText` と同じ）。`**` は使わない。
- スマホ（幅 375px）で読めることを必ず確認する。はみ出す表・図には「横にスクロールできます」が自動で出る。図はなるべくスマホ幅に収める（横に広がる図は、分岐を減らす・`flowchart LR` にするなどで幅を抑える）。はみ出す流れ図は中央から表示される。
- `npm run quiz:validate -w sites/<site>` が図表の形式（`caption`・`alt` の有無、表の列数の一致、画像の実在）も検証する。

## モデルの使い分け（コスト最適化）

このプロジェクトは自律的に多数のスプリントを回す。役割ごとにモデルを使い分ける。

| モデル | 担当 |
|---|---|
| **Opus**（起点オーケストレーター） | スプリント計画・意思決定・振り返り・バックログ積み替え・複雑な統合判断 |
| **Fable** | レッスン執筆・書き直し、レッスン/ドリルの品質レビュー、図版設計（コンテンツ品質の中核） |
| **Sonnet** | 実装・機械作業（土台・設定同期・ビルド/lint/検証・集計・grep 監査・git 操作・ドキュメント整備） |
| **Haiku** | ごく軽微な単発確認 |

- Fable への委譲は `Agent`（`model: "fable"`）で行う。必須インプット: この CLAUDE.md とそのサイトの CLAUDE.md ／手本レッスン ／担当範囲のシラバス該当箇所（`references/`）／`review-lesson`・`natural-japanese` の適用指示。**「自信のない記述を申告させる」**とファクトチェックが効率化する。
- 独立レッスンは複数の Fable サブエージェントを並列起動してよい。生成物は機械チェック＋整合確認してからコミットする。
- 複数サイトを並行して進めるときは、サイトごとに担当を分け、他サイトのディレクトリには触らせない（`packages/shared/` と `.claude/` の変更は全サイトに影響するため、オーケストレーターが調整する）。

## 日本語品質チェックの多層構成

1. **`natural-japanese` スキル**（アカウント標準）— 直訳調・詩的常套句・説明の足場・文中ダッシュ・長すぎる段落を検出。全レッスン下書きと主要ドキュメントに適用。
2. **`review-lesson` スキル**（`.claude/skills/`）— A〜I の全カテゴリを指摘ゼロまでループ。技術的正確性（シラバス一次照合）＋構成＋自然な日本語＋ビルド健全性。この中から `natural-japanese` も呼ぶ。対象サイトの CLAUDE.md の用語ルールで判定する。
3. **機械フック**（`.claude/hooks/`）— `check-bold.js`（`**` 崩れ）、`check-style.js`（複文・詩的見出し・全角記号・足場）、`check-lesson-title.js`（h1 形式）、`textlint`、`quiz-validate`。

レッスンの追加には `add-lesson` スキル（`.claude/skills/`）を使う。`add-lesson` と `review-lesson` は対象サイトを引数またはパスで受け取る。

## 運用ルール

- 決定事項・方針は会話の中だけに残さず、必ずファイル（CLAUDE.md など）に記録してコミットする。サイト固有の決定は `sites/<site>/CLAUDE.md`、全サイトに及ぶ決定はこのファイルに書く。
- レッスン・ドリル・図版を変更したら、コミット前に必ずビルドと検証を通す（後述「変更時のチェック」）。
- **ブランチは `main` のみを使う。** main への push で Vercel が自動デプロイする。PR は原則作らない。
- 公開後の改善サイクルと新コンテンツ立ち上げの手順は `PLAYBOOK.md` を参照。事実確認の疑義は `sites/<site>/FACTCHECK.md` に追記してから裏取り・修正する（レッスンを直したら対応するドリルも突き合わせる）。
- Vercel はサイトごとにプロジェクトを分ける。FL の既存プロジェクトはルートの `vercel.json`（Root Directory を変えずに `sites/fl` をビルド）を使う。新しいサイトのプロジェクトは Root Directory を `sites/<site>` にして作る。
- Root Directory を `sites/<site>` にしたプロジェクトでは、`sites/<site>/vercel.json` の `installCommand`（`cd ../.. && npm ci`）でリポジトリのルートから依存関係を入れる。サイトのディレクトリで `npm install` すると、そのサイト自身の依存（`@jstqb/shared`）しか入らず、ルートの devDependencies にある VitePress が見つからずにビルドが失敗するため。
- Vercel の Redeploy が「Git information retrieval failed for this deployment」で失敗したら、Redeploy を繰り返さない。そのサイトのディレクトリ（`sites/<site>/`）のファイルを変えるコミットを main に push して、新しいデプロイを起こす。サイトのファイルに変更がないコミットは「Skipped - Not affected」となり、デプロイされない。

## サイトの見分け方（見た目）

- サイトごとにブランドカラーを変える（FL は青、AL-TA は紫）。新しいサイトは、既存サイトの色と、ドリルが使う意味のある色（緑＝正解、赤・オレンジ＝不正解・むずかしい、黄＝ふつう）のどちらとも重ならない色相を選ぶ。テキストとボタンの色はライト・ダークとも 4.5:1 以上を保ち、比をサイトの CSS の冒頭に記録する。
- 色だけに頼らないよう、ロゴは文字で区別する（FL「JSTQB」、AL-TA「TA」）。ナビゲーションにはロゴを出し（`themeConfig.logo`）、上端にブランド色の帯を出す（共通 CSS）。

## Markdown の太字（強調）について

日本語では `**強調**` の閉じ `**` の直前が全角閉じ括弧（`）」】〉》`）だと、素の markdown-it では強調が描画されない（CJK flanking 問題）。このプロジェクトは `markdown-it-cjk-friendly` を導入して解消済みのため、本文では `**用語（よみ）**` のような書き方をしてもよい。ただし**ドリル（quiz）では `**` を使わない**。

## よく使うコマンド

リポジトリのルートで実行する。サイトを指定するときは `-w sites/<site>`（例: `-w sites/fl`、`-w sites/al-ta`）を付ける。

```bash
npm install                            # 依存関係のインストール（全 workspace）

# サイト指定
npm run docs:dev -w sites/fl           # ローカル開発サーバー
npm run docs:build -w sites/fl         # 本番ビルド（Vercel と同じ）
npm run docs:preview -w sites/fl       # ビルド結果のプレビュー
npm run docs:lint -w sites/fl          # textlint で日本語を校正
npm run quiz:validate -w sites/fl      # ドリルデータの検証
npm run check:bold -w sites/fl         # 太字 ** の崩れ検査
npm run check:style -w sites/fl        # 型の欠陥の機械検出
npm run test:e2e -w sites/fl           # ドリルの E2E テスト
npm run pwa:icons -w sites/fl          # logo.svg から PWA アイコンを生成

# 横断（全サイト）
npm run docs:build                     # 全サイトをビルド
npm run docs:lint                      # 全サイトを lint
npm run quiz:validate                  # 全サイトのドリルを検証
npm run check:bold && npm run check:style   # 全サイトのレッスンを検査

# FL のショートカット
npm run fl:dev / fl:build / fl:preview / fl:test:e2e
```

## 変更時のチェック

レッスンやドリルを変更したら、コミット前に最低限これらを通す（`<site>` は変更したサイト）。

- `npm run docs:lint -w sites/<site>` がエラーなしで通る
- `npm run docs:build -w sites/<site>` が成功する
- ドリルを触ったら `npm run quiz:validate -w sites/<site>` も通る
- レッスンを触ったら `npm run check:bold -w sites/<site>` と `npm run check:style -w sites/<site>` の出力が空
  - 個別のファイルは `node .claude/hooks/check-bold.js sites/<site>/docs/lessons/*/index.md` と `node .claude/hooks/check-style.js sites/<site>/docs/lessons` でも検査できる
- `packages/shared/` や `.claude/` を変更したときは、全サイトで `npm run docs:build` と `npm run quiz:validate` を通す
- ドキュメント（`CLAUDE.md`・`README.md`・`PLAYBOOK.md` など）を変えたら `npx textlint --config .textlintrc.json <ファイル>` を通す
