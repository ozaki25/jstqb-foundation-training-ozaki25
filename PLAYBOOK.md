# PLAYBOOK — JSTQB Foundation Level 学習コンテンツの運用プレイブック

このリポジトリ（JSTQB Foundation Level 学習コンテンツ）を立ち上げ、公開まで育て、公開後も品質を上げ続けるための手順をまとめます。個々の判断や発見の経緯は `SPRINTLOG.md` を参照。

## 出典表示義務（全ページで維持する）

本教材は JSTQB Foundation Level シラバス（Version 2023 V4.0.J02）を参考にした**非公式**の学習コンテンツであり、ISTQB®／JSTQB® の承認・公認を受けたものではありません。次の表示を欠かさないこと。

- README.md 冒頭
- `docs/index.md`（トップページ）
- `docs/.vitepress/config.mts` のフッター（`footer.message` / `footer.copyright`）
- `docs/about/`（出典・免責ページ）

表示文言:

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
2. **review-lesson スキル**: レッスン単位の総合レビューの司令塔（事実・網羅性・構成・用語統一をまとめて指揮）
3. **機械フック**: `check-bold` / `check-style` / `check-lesson-title` 等でレッスンの型を機械的に検査
4. **textlint**（`preset-ja-technical-writing`）: 文の長さ・読点数・表記ゆれ等を機械的に検査

## Phase 0: 土台の複製（半日）

1. `ux-certification-basics-ozaki25` の構成をコピーする（`docs/` の仕組み・`scripts/`・`.github/`・設定ファイル一式）。レッスン本文とドリルデータは捨てて空にする
2. 置き換えるもの:
   - `package.json` の名前と説明
   - `config.mts` のタイトル・説明・テーマ色（青×緑パレット）・PWA manifest・サイドバー
   - `docs/quiz/types.ts` の章メタ情報（`ChapterMeta`）
   - `theme/custom.css` のブランド色（**WCAG AA 4.5:1 をライト・ダーク両方で計算して確認**）
   - `docs/public/logo.svg`（→ `npm run pwa:icons` でアイコン再生成、OGP も作り直す）
   - 模擬試験ページを本番準拠の設問数・時間・合格ラインに変更（JSTQB は 40 問・60 分・65%）
3. `npm install` → `docs:build` が通ることを確認してから main に初回コミット

## Phase 1: 一次情報の確定（最重要・先にやる）

- **公式シラバス（Version 2023 V4.0.J02、<https://www.jstqb.jp/syllabus/>）を必ず入手してから**カリキュラムを設計する。検索情報だけで作ると学習目標の欠落や誤読が出る
- シラバスの学習目標（Learning Objectives, LO）は K1〜K3 のレベル付きで章ごとに定義されている。レッスン設計時は LO 単位で対応漏れがないか確認する
- 非公開資料を使う場合は `references/` に置き、`.gitignore` で除外。索引 `references/INDEX.md` を作る
- 出典の優先順位を CLAUDE.md に明記する（例: 公式シラバス > 公式サイト（JSTQB/ISTQB） > 定評のある解説書 > 一般知識）

## Phase 2: カリキュラム設計（1スプリント）

- レッスンはシラバスの学習目標（LO）の集合と 1 対 1 対応に近い単位で構成する。複数 LO を 1 レッスンに統合する場合は対応表に明記する
- 同期箇所は 5 か所: `config.mts`（サイドバー）/ `docs/index.md`（目次）/ `docs/quiz/types.ts`（章メタ）/ `README.md`（章対応表）/ CLAUDE.md（対応表）。**再編時はこの 5 か所を機械的に grep で確認**

## Phase 3: レッスン執筆（1レッスン=1スプリント）

- 最初の 1 本は手本として丁寧に書き、以降のドラフトの基準にする（構成・分量・トーン）
- レッスンの型は固定: `# lessonNN: テーマ — サブタイトル` → `## このレッスンで学ぶこと`（3〜5項目） → 本文 → `## キーワード`（用語と説明の表） → `## 試験のポイント`
- 執筆は Fable に委譲する。必須インプット: CLAUDE.md / 手本レッスン / 担当範囲のシラバス該当節（学習目標・重要ワード）/ 対応する一次資料のパス。**「自信のない記述を申告させる」**と後段のファクトチェックが効率化する
- ドラフトは必ず人手（Opus によるレビュー統合）でレビューしてからコミット: 学習目標網羅 / 事実の一次資料との照合 / 執筆ルール準拠 / textlint / ビルド
- レビュー観点 10 項目は `SPRINTLOG.md` 冒頭を参照

## Phase 4: 横断監査（章・全体の完了後に一括）

```bash
# 位置依存表現・禁止記法
grep -rn "次のレッスン\|前のレッスン\|前章\|次章で" docs/lessons/
grep -rn "——\|<br" docs/lessons/
# JSTQB特有の表記統一チェック（シラバス表記に揃える）
grep -rn "デシジョンテーブル" docs/lessons/ | grep -v "デシジョンテーブルテスト"
grep -rln "故障" docs/lessons/ | xargs grep -n "バグ\b"
grep -rn "確認テスト" docs/lessons/ | grep -v "確認テスト（Confirmation"
grep -rn "リグレッションテスト\|回帰テスト" docs/lessons/
grep -rn "欠陥\|不具合\|障害" docs/lessons/
# リンク切れ（存在しない lessonNN への参照）
grep -rhno "/lessons/lesson[0-9]\{2\}/" docs/ | grep -o "lesson[0-9]\{2\}" | sort -u
# 必須セクションの存在
for f in docs/lessons/lesson*/index.md; do for s in "## このレッスンで学ぶこと" "## キーワード" "## 試験のポイント"; do grep -q "^$s" "$f" || echo "$f missing: $s"; done; done
```

シラバスは「欠陥（defect）」「故障（failure）」「エラー（error）」を区別して定義しているため、レッスン内で言い換えが混在していないか（同じ現象を指すのに章によって語が変わっていないか）を必ず確認する。「確認テスト」と「リグレッションテスト」も別概念として区別する。

## Phase 5: ドリル作成（1章=1スプリント）

- ルールは CLAUDE.md「ドリル（quiz）」を踏襲。`npm run quiz:validate` が形式（id・4択・answer 0-3・difficulty）を保証する
- difficulty はシラバスの K レベルに対応づける目安: K1→easy / K2→normal / K3→hard
- 形式チェックでは保証されない品質（**正答がレッスン本文と一致しているか・ひっかけが概念混同として成立しているか・K3技法（境界値分析・デシジョンテーブル等）の計算例に誤りがないか**）は全問レビューする
- バランス集計（正解位置・難易度・レッスン別出題数）:

```bash
node -e '
const fs=require("fs");let pos=[0,0,0,0],diff={easy:0,normal:0,hard:0},per={};
for(let c=1;c<=6;c++){const t=fs.readFileSync(`docs/quiz/data/chapter${c}.ts`,"utf8");
for(const it of t.split(/\bid:\s*"/).slice(1)){
const a=it.match(/answer:\s*([0-3])/);if(a)pos[+a[1]]++;
const d=it.match(/difficulty:\s*"(\w+)"/);if(d)diff[d[1]]++;
const l=it.match(/lesson:\s*"(lesson\d+)"/);if(l)per[l[1]]=(per[l[1]]||0)+1;}}
console.log("正解位置:",pos.join("/"),"難易度:",JSON.stringify(diff));
console.log(Object.keys(per).sort().map(k=>`${k}:${per[k]}`).join(" "));'
```

- 目安: 正解位置は各 25%±5%、難易度 easy:normal:hard ≈ 4:4:2（本番試験の K1〜K3 の構成比に近づける）、全レッスン 6〜7 問以上

## Phase 6: リリース

- トップページ・README の「準備中」表記を解除し、確定数値（30 レッスン・ドリル問題数）に更新
- 模擬試験（40問・60分・合格65%）が本番と一致しているかを最終確認する
- 最終検証: `docs:lint` / `quiz:validate` / `docs:build` + dist のスポットチェック（manifest・OGP・検索インデックスが noindex であること）
- CLAUDE.md に完成状態を記録してからプッシュ

## Phase 7: 公開後の運用サイクル（継続）

公開後の品質改善は次のループで回す。**気づきを必ずファイルに落とす**ことが要点（会話やメモ帳に残すと消える）。

1. **気づきの記録**: 学習中・レビューで見つけた疑義は `FACTCHECK.md` に追記（対象ファイル・現在の記述・確認先）
2. **裏取り**: 公式シラバス・公式サイト（JSTQB/ISTQB）・定評のある解説書の優先順で確認。確認結果と出典を `FACTCHECK.md` に記録
3. **修正**: レッスンを直したら、そのレッスンに紐づくドリル（`lesson` フィールドで grep）も必ず突き合わせる
4. **検証とリリース**: `docs:lint` / `quiz:validate` / `docs:build` → コミット → push（Vercel が自動デプロイ）
5. **ルール化**: 同種の誤りを防げるなら CLAUDE.md・このプレイブックに反映する

シラバス改訂時は Phase 2 の「5 か所同期」から再実行する。
