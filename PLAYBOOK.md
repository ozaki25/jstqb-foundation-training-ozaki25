# PLAYBOOK — JSTQB 学習コンテンツの運用プレイブック

このモノレポ（JSTQB 各資格の学習コンテンツ）で、新しいサイトを立ち上げ、公開まで育て、公開後も品質を上げ続けるための手順をまとめます。個々の判断や発見の経緯は各サイトの `SPRINTLOG.md` を参照。

以降、`<site>` は対象サイトのディレクトリ名（`fl`、`al-ta` など）を表します。サイトの実体は `sites/<site>/` にあります。

## 出典表示義務（全サイト・全ページで維持する）

各サイトは、対応する JSTQB シラバスを参考にした**非公式**の学習コンテンツであり、ISTQB®／JSTQB® の承認・公認を受けたものではありません。**サイトごとに**次の表示を欠かさないこと。

- `sites/<site>/README.md` 冒頭、およびルート `README.md` のサイト別の出典表示
- `sites/<site>/docs/index.md`（トップページ）
- `sites/<site>/docs/.vitepress/config.mts` のフッター（`footer.message` / `footer.copyright`）
- `sites/<site>/docs/about/`（出典・免責ページ）

表示文言は、シラバスのバージョンと翻訳版の著作権年がサイトごとに違うため、各サイトの `CLAUDE.md` に書く。FL の例:

> 本教材は、JSTQB Foundation Level シラバス（Version 2023 V4.0.J02）を参考に作成した非公式の学習コンテンツです。シラバスの著作権は International Software Testing Qualifications Board（ISTQB®）に、日本語翻訳版の著作権は Japan Software Testing Qualifications Board（JSTQB®）に帰属します（Translation Copyright © 2005-2023 JSTQB®, all rights reserved）。本教材は ISTQB®／JSTQB® が承認・公認したものではありません。正確な内容は必ず公式シラバス（<https://www.jstqb.jp/syllabus/>）をご確認ください。

シラバス本文の**転載は行わない**。事実・概念を理解したうえで、この教材のスタイルで書き直す。

## モデル運用方針

複数モデルを役割で使い分ける。役割の境界はスプリントごとに Opus が判断する。

| モデル | 役割 |
|---|---|
| Opus（起点オーケストレーター） | スプリント計画・スコープ判断・レビュー結果の統合・ふりかえり |
| Fable（`Agent` の `model: "fable"` で委譲） | レッスン執筆・レッスン/ドリルの品質レビュー・図版設計 |
| Sonnet | 実装・機械作業（土台構築、`config.mts`/`types.ts` 等の設定同期、ビルド・lint・quiz:validate の実行と検証、集計スクリプト、grep 監査、git 操作） |
| Haiku | ごく軽微な定型作業 |

日本語品質は単一のチェックに頼らず多層で担保する。

1. **natural-japanese スキル**: 文章としての自然さ（AI生成感のある詩的文体・不自然な問いかけ等）を点検
2. **review-lesson スキル**: レッスン単位の総合レビューの司令塔（事実・網羅性・構成・用語統一をまとめて指揮）。対象サイトを引数またはパスで受け取る
3. **機械フック**: `check-bold` / `check-style` / `check-lesson-title` 等でレッスンの型を機械的に検査
4. **textlint**（`preset-ja-technical-writing`）: 文の長さ・読点数・表記ゆれ等を機械的に検査

複数サイトを並行して進めるときは、サイトごとに担当を分け、他サイトのディレクトリには触らせない。`packages/shared/` と `.claude/` は全サイトに影響するため、変更はオーケストレーターが調整する。

## Phase 0: サイトの土台づくり（半日）

新しいサイトは `sites/<site>/` に作り、共通部品は `packages/shared/` を使う。サイトごとに複製するのは設定とコンテンツだけで、ドリルの Vue 部品・テーマ CSS・問題の型・検証スクリプトは複製しない。

1. **ディレクトリを作る**: `sites/<site>/` を作り、`sites/fl/` を雛形にして次を用意する。レッスン本文とドリルデータは空にする。
   - `package.json`: 名前は `@jstqb/site-<site>`、依存に `"@jstqb/shared": "*"`、scripts は `sites/fl/package.json` と同じ形にする。
     - 対象: `docs:dev` / `docs:build` / `docs:preview` / `docs:lint` / `quiz:validate` / `check:bold` / `check:style` / `pwa:icons` / `test:e2e`
     - 共通の設定とスクリプトは `../../` を介して参照する
   - `docs/.vitepress/config.mts`: タイトル・説明・テーマ色・PWA manifest・サイドバー・フッター（出典表示）を置き換える。`gitLastUpdated` は `@jstqb/shared/vitepress/git-last-updated.mjs` から読み込み、vite の alias `@quiz` を自サイトの `docs/quiz` に向ける（共通のドリル部品が問題データを読むための入口）
   - `docs/.vitepress/theme/index.ts`: `export { default } from "@jstqb/shared/theme";`。サイト固有の見た目を変えたいときは、ここで CSS を追加 import する
   - `docs/quiz/types.ts`: 共通の型を `@jstqb/shared/quiz/types` から再エクスポートし、章 ID の型・`STORAGE_KEY`（サイトごとに別の値にする）・章メタ情報 `chapters` を定義する
   - `docs/index.md`・`docs/about/index.md`・`docs/glossary/index.md`・`docs/404.md`、`docs/public/`（`logo.svg`・OGP・アイコン）、`pwa-assets.config.ts`
   - `CLAUDE.md`（サイト固有の前提）・`README.md`・`FACTCHECK.md`・`SPRINTLOG.md`
2. **サイト固有の項目を置き換える**:
   - テーマ色（`config.mts` と、サイト固有の CSS を追加する場合はその CSS。**WCAG AA 4.5:1 をライト・ダーク両方で計算して確認**）
   - `docs/public/logo.svg`（→ `npm run pwa:icons -w sites/<site>` でアイコン再生成、OGP も作り直す）
   - 模擬試験ページを本番準拠の設問数・時間・合格ラインに変更（FL は 40 問・60 分・65%）
3. **横断設定に登録する**:
   - ルート `package.json` の workspaces は `sites/*` なので、自動で対象になる。サイト別のショートカットが欲しければ `<site>:dev` などを足す
   - `.github/workflows/build.yml` の matrix（`site: [fl]`）に `<site>` を追加する
   - ルート `README.md` のサイト一覧と出典表示、ルート `CLAUDE.md` のサイト一覧に追記する
4. **Vercel プロジェクトを作る**: 新サイトのプロジェクトは **Root Directory を `sites/<site>` にして作る**。ビルド設定は `sites/<site>/vercel.json`（`buildCommand: npm run docs:build`、`outputDirectory: docs/.vitepress/dist`。`sites/fl/vercel.json` を雛形にする）に置く。ルートの `vercel.json` は FL の既存プロジェクト専用なので、新サイトのために触らない。
5. **確認**: ルートで `npm install` → `npm run docs:build -w sites/<site>` が通ることを確認してから main に初回コミット。既存サイトのビルドが壊れていないことも `npm run docs:build` で確認する。

## Phase 1: 一次情報の確定（最重要・先にやる）

- **公式シラバス（日本語版）を必ず入手してから**カリキュラムを設計する。検索情報だけで作ると学習目標の欠落や誤読が出る
- シラバスの学習目標（Learning Objectives, LO）は K レベル付きで章ごとに定義されている。レッスン設計時は LO 単位で対応漏れがないか確認する
- 出典の優先順位をサイトの CLAUDE.md に明記する（例: 公式シラバス > 公式サイト（JSTQB/ISTQB） > 定評のある解説書 > 一般知識）

### 一次資料の受け取り

この環境は jstqb.jp・istqb.org などへのアクセスが遮断されるため、一次資料は自分で取得せず、**ユーザーにアップロードしてもらう**。

1. 次の資料をユーザーに依頼する。
   - 日本語版シラバス（PDF）。JSTQB の公式サイトからダウンロードできる
   - 必要に応じて ISTQB 英語版シラバス（訳が揺れる・わかりにくい箇所の確認用）
   - サンプル試験（問題と解答の PDF）。出題傾向の把握に使う（流用はしない）
   - 用語集（glossary.istqb.org から**ユーザーに PDF 出力してもらう**。用語の訳語と定義の確認に使う）
2. 受け取った資料は `references/<site>/` に置く（FL は `references/` 直下で、索引は `references/INDEX.md`）。PDF はテキスト抽出版も作り、grep で引けるようにする
3. `references/` は `.gitignore` で除外済み。**絶対にコミット・プッシュしない**。索引（`INDEX.md`）を作り、どの資料がどこにあるかを残す
4. リモート実行環境ではセッションごとにファイルが消える。受け取った資料は非公開の Artifact「JSTQB 一次資料庫」にも保管し、消えていたらそこから取り出す（手順はルート `CLAUDE.md` の「非公開の参考資料」）。再アップロードを依頼するのは、資料庫にない資料だけ

## Phase 2: カリキュラム設計（1スプリント）

- レッスンはシラバスの学習目標（LO）の集合と 1 対 1 対応に近い単位で構成する。複数 LO を 1 レッスンに統合する場合は対応表に明記する
- 同期箇所は次の 5 か所
  - `sites/<site>/docs/.vitepress/config.mts`（サイドバー）
  - `sites/<site>/docs/index.md`（目次）
  - `sites/<site>/docs/quiz/types.ts`（章メタ）
  - `sites/<site>/README.md`（章対応表）
  - `sites/<site>/CLAUDE.md`（対応表）
- **再編時はこの 5 か所を機械的に grep で確認**する。ルート `README.md` のサイト一覧（章・レッスン数）も確認する

## Phase 3: レッスン執筆（1レッスン=1スプリント）

- 最初の 1 本は手本として丁寧に書き、以降のドラフトの基準にする（構成・分量・トーン）
- レッスンの型は固定: `# lessonNN: テーマ — サブタイトル` → `## このレッスンで学ぶこと`（3〜5項目） → 本文 → `## 試験のポイント`（原則 3 項目・最大 4）。用語の定義は `## キーワード` 表としてレッスンに置かず、用語集に一本化する
- 追加は `add-lesson` スキル（対象サイトを指定）を使う
- 執筆は Fable に委譲する。必須インプット: ルートの CLAUDE.md と `sites/<site>/CLAUDE.md` / 手本レッスン / 担当範囲のシラバス該当節（学習目標・重要ワード）/ 対応する一次資料のパス。**「自信のない記述を申告させる」**と後段のファクトチェックが効率化する
- ドラフトは必ず人手（Opus によるレビュー統合）でレビューしてからコミットする。観点は学習目標網羅 / 事実の一次資料との照合 / 執筆ルール準拠 / textlint / ビルド。`review-lesson` スキルで全項目を通す
- レビュー観点 10 項目は `sites/<site>/SPRINTLOG.md` 冒頭を参照

## Phase 4: 横断監査（章・全体の完了後に一括）

ルートで実行する。`<site>` を対象サイトに置き換える。

```bash
# 位置依存表現・禁止記法
grep -rn "次のレッスン\|前のレッスン\|前章\|次章で" sites/<site>/docs/lessons/
grep -rn "——\|<br" sites/<site>/docs/lessons/
# 用語の統一チェック（サイトの CLAUDE.md の「用語の統一ルール」に沿って grep を作る。以下は FL の例）
grep -rn "デシジョンテーブル" sites/fl/docs/lessons/ | grep -v "デシジョンテーブルテスト"
grep -rln "故障" sites/fl/docs/lessons/ | xargs grep -n "バグ\b"
grep -rn "確認テスト" sites/fl/docs/lessons/ | grep -v "確認テスト（Confirmation"
grep -rn "リグレッションテスト\|回帰テスト" sites/fl/docs/lessons/
grep -rn "欠陥\|不具合\|障害" sites/fl/docs/lessons/
# リンク切れ（存在しない lessonNN への参照）
grep -rhno "/lessons/lesson[0-9]\{2\}/" sites/<site>/docs/ | grep -o "lesson[0-9]\{2\}" | sort -u
# 必須セクションの存在と、廃止した ## キーワード 表が残っていないこと
for f in sites/<site>/docs/lessons/lesson*/index.md; do for s in "## このレッスンで学ぶこと" "## 試験のポイント"; do grep -q "^$s" "$f" || echo "$f missing: $s"; done; grep -q "^## キーワード" "$f" && echo "$f has deprecated: ## キーワード"; done
# 型の機械検査
npm run check:style -w sites/<site>
npm run check:bold -w sites/<site>
```

FL では、シラバスが「欠陥（defect）」「故障（failure）」「エラー（error）」を区別して定義しているため、レッスン内で言い換えが混在していないか（同じ現象を指すのに章によって語が変わっていないか）を必ず確認する。「確認テスト」と「リグレッションテスト」も別概念として区別する。他のサイトでも、サイトの CLAUDE.md の用語ルールに沿って同じ観点で監査する。

## Phase 5: ドリル作成（1章=1スプリント）

- ルールはルート CLAUDE.md の「ドリル（quiz）」を踏襲。`npm run quiz:validate -w sites/<site>` が形式（id・4択・answer 0-3・difficulty・図表の caption/alt など）を保証する
- difficulty はシラバスの K レベルに対応づける目安（FL は K1→easy / K2→normal / K3→hard）。K4 を含む資格の対応づけはサイトの CLAUDE.md に書く
- デシジョンテーブル・トレーサビリティ表・状態遷移図などが必要な問題は、`figures` / `explanationFigures` で表（`table`）・Mermaid 図（`mermaid`）・整形済みテキスト（`pre`）・画像（`image`）を付ける。型は `packages/shared/quiz/types.ts`、使い方はルート CLAUDE.md の「図表（figures）の使い方」
- 形式チェックでは保証されない品質（**正答がレッスン本文と一致しているか・ひっかけが概念混同として成立しているか・K3技法（境界値分析・デシジョンテーブル等）の計算例に誤りがないか**）は全問レビューする
- バランス集計（正解位置・難易度・レッスン別出題数）。ルートで実行し、章数 `c<=6` と対象サイトのパスを置き換える:

```bash
node -e '
const fs=require("fs");let pos=[0,0,0,0],diff={easy:0,normal:0,hard:0},per={};
for(let c=1;c<=6;c++){const t=fs.readFileSync(`sites/fl/docs/quiz/data/chapter${c}.ts`,"utf8");
for(const it of t.split(/\bid:\s*"/).slice(1)){
const a=it.match(/answer:\s*([0-3])/);if(a)pos[+a[1]]++;
const d=it.match(/difficulty:\s*"(\w+)"/);if(d)diff[d[1]]++;
const l=it.match(/lesson:\s*"(lesson\d+)"/);if(l)per[l[1]]=(per[l[1]]||0)+1;}}
console.log("正解位置:",pos.join("/"),"難易度:",JSON.stringify(diff));
console.log(Object.keys(per).sort().map(k=>`${k}:${per[k]}`).join(" "));'
```

- 目安（FL）: 正解位置は各 25%±5%、難易度 easy:normal:hard ≈ 4:4:2（本番試験の K1〜K3 の構成比に近づける）、全レッスン 6〜7 問以上

## Phase 6: リリース

- トップページ・README の「準備中」表記を解除し、確定数値（レッスン数・ドリル問題数）に更新する。ルート `README.md` のサイト一覧の状態も「公開中」にする
- 模擬試験が本番の設問数・時間・合格ラインと一致しているかを最終確認する（FL は 40問・60分・合格65%）
- 最終検証: `docs:lint` / `quiz:validate` / `docs:build`（`-w sites/<site>`）+ dist のスポットチェック（manifest・OGP・検索インデックスが noindex であること）
- 出典表示が全ページで生きているか（フッター・トップの warning・about・README）を確認する
- サイトの CLAUDE.md に完成状態を記録してからプッシュ

## Phase 7: 公開後の運用サイクル（継続）

公開後の品質改善は次のループで回す。**気づきを必ずファイルに落とす**ことが要点（会話やメモ帳に残すと消える）。

1. **気づきの記録**: 学習中・レビューで見つけた疑義は `sites/<site>/FACTCHECK.md` に追記（対象ファイル・現在の記述・確認先）
2. **裏取り**: 公式シラバス・公式サイト（JSTQB/ISTQB）・定評のある解説書の優先順で確認。確認結果と出典を `FACTCHECK.md` に記録
3. **修正**: レッスンを直したら、そのレッスンに紐づくドリル（`lesson` フィールドで grep）も必ず突き合わせる
4. **検証とリリース**: `docs:lint` / `quiz:validate` / `docs:build`（`-w sites/<site>`）→ コミット → push（Vercel が自動デプロイ）
5. **ルール化**: 同種の誤りを防げるなら、ルート CLAUDE.md（共通）・サイトの CLAUDE.md（固有）・このプレイブックに反映する

シラバス改訂時は Phase 2 の「5 か所同期」から再実行する。`packages/shared/` を変更したときは、全サイトのビルドと検証を通す。
