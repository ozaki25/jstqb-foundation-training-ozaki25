# FACTCHECK — AL-TA（Advanced Level テストアナリスト）

一次資料で裏取りが必要な事項の台帳。確認したら「確認済み」へ移し、出典を残す。

## 対象とする版（決定事項）

- **CTAL-TA V4.0 のみを対象にする。** 旧版 3.1.1J03 の内容は扱わない。
  - JSTQB お知らせ（2026-06-16）: V4.0 日本語版を公開。V4.0 対象の認定試験は **2026年11月中旬に開始予定**。それまでは 3.1.1J03 対象の試験を継続。
  - ISTQB CTAL-TA ページ: 旧版 v3.1 の終了日は英語版 2026-05-16、**英語以外 2026-11-16**。

## 確認済み

| 項目 | 結果 | 出典 |
|---|---|---|
| ✅ V4.0 日本語版の公開と試験開始時期 | 2026-06-12 公開（シラバス表記は 2026-06-09）。試験は 2026年11月中旬開始予定 | JSTQB お知らせ 2026-06-16・PR TIMES プレスリリース |
| ✅ V4.0 の主な変更点 | 学習目標 36 個（旧 31 個）。第3章の技法をデータ／振る舞い／ルールに基づく3分類に整理。第5章を欠陥予防全般へ拡充（欠陥分類を用いた根本原因分析など）。新規: テストオラクルの決定、テストデータ要件、ランダムテスト、CRUD テスト、メタモルフィックテスト、クラウドテストなど。ISO/IEC 25010:2023・ISO/IEC/IEEE 29119-4:2021 に対応 | PR TIMES プレスリリース（JSTQB, 2026-06-16）。シラバス本文で要再照合 |
| ✅ ISTQB 英語版の試験形式 | 45 問・78 点満点・51 点で合格・120 分（非母語は +25%） | ISTQB CTAL-TA v4.0 ページ |
| ✅ 章構成（5章） | 1 テストプロセスにおけるテストアナリストのタスク／2 リスクベースドテストにおけるテストアナリストのタスク／3 テスト分析とテスト設計／4 テストの品質特性／5 ソフトウェア欠陥の予防 | ISTQB CTAL-TA v4.0 ページ。日本語の章名はシラバス J01 で要確認 |
| ✅ 試験形式（v4.0）と旧版との違い | v4.0: 45 問・78 点満点・合格 51 点（50.70）・120 分（非母語 150 分）。v3.1: 40 問・80 点満点・合格 52 点・120 分（非母語 150 分）。JSTQB 試験実施案内の「40問・120分」と日科技連 FAQ の「試験150分」は v3.1 の値と一致する | ISTQB Exam Structures & Rules Tables v1.19（2026-08-19） |
| ✅ 章ごとの出題数・配点（v4.0） | 第1章 8 問/9 点、第2章 3 問/7 点、第3章 22 問/42 点、第4章 4 問/4 点、第5章 8 問/16 点。K レベル別: K2 18 問・K3 21 問・K4 6 問。配点: K2=1 点、K3=2 点、K4=3 点。K1 の出題なし（ただしキーワードの定義は記憶が前提） | ISTQB Exam Structures & Rules Tables v1.19 |
| ✅ 学習目標 36 個の K レベル | K2 22・K3 11・K4 3 | シラバス V4.0.J01 付録C |
| ✅ キーワード 67 個の公式定義 | 各章冒頭のキーワードは計 67 個。ISTQB 用語集 v4.8.1（2026-10-11 出力）の日本語版で 58 個、英語版で残り 9 個（キーワード、テストオラクル、リスクベースドテスト、ルールに基づくテスト技法、シナリオベースドテスト、適応性、機能適切性、機能正確性、インストール性）の定義を確認。9 個は新しい版の定義に日本語訳がまだなく、日本語表示では出ない（用語集マニュアル p.3 の注記どおり）。教材ではこの 9 個はシラバス J01 の表記を用語名に使い、定義は英語版を訳して書く | ISTQB 用語集 v4.8.1 日本語版・英語版、JSTQB 用語集ユーザーマニュアル V2.0 |
| ✅ 受験要件 | Foundation Level の認定（v4.0 推奨。旧版も可）と実務経験 | ISTQB CTAL-TA v4.0 ページ |

## 未確認（優先度順）

| 項目 | 現状 | 確認先 |
|---|---|---|
| ⬜ 日本の V4.0 試験の問題数・合格点 | JSTQB・日科技連の現行の記載は v3.1 の値と一致しており、v4.0 の日本の試験形式は未発表。教材の模擬試験は ISTQB v4.0 基準（45 問・51/78 点）を「日本の正式形式は未発表」と明記して使う | 日科技連 Advanced 試験ページ（https://www.juse.or.jp/sqip/qualification/jstqb/advanced.html#ta）・JSTQB の今後の告知 |
| ⬜ 用語集とシラバスの表記差 | 用語集の日本語版は「ユーザエクスペリエンス」、シラバス J01 は「ユーザーエクスペリエンス」。教材はシラバスの表記に合わせ、用語集ページで別表記を併記する | ISTQB 用語集 日本語版・シラバス V4.0.J01 |
| ⬜ 日本語訳の表記ゆれ | J01 内で表記が揺れる箇所あり: 3.5 節名（学習目標側「最適なテスト技法を適用する」／本文「最も適切なテスト技法の適用」）、付録C の「領域テスト」（本文は「ドメインテスト」）、TA-3.1.3 の文末（「要約する」／試験表は「まとめる」）。教材は本文の表記に統一し、迷う箇所は英語版で確認する | シラバス V4.0.J01・英語版 v4.0・ISTQB 用語集（TA v4.0 で絞り込み） |
| ⬜ サンプル試験の出題形式 | 未取得 | ISTQB Sample Exam Questions / Answers v4.1 |

## 一次資料（references/al-ta/ に置く。git 管理外）

| 資料 | 取得元 |
|---|---|
| JSTQB AL-TA シラバス V4.0.J01（日本語） | https://www.jstqb.jp/wordpress/wp-content/uploads/2026/06/JSTQB-Syllabus.Advanced_TA_VersionV4.0.J01.pdf |
| ISTQB CTAL-TA Syllabus v4.0（英語） | https://istqb.org/?sdm_process_download=1&download_id=5745 |
| Sample Exam Questions v4.1 | https://istqb.org/?sdm_process_download=1&download_id=5749 |
| Sample Exam Answers v4.1 | https://istqb.org/?sdm_process_download=1&download_id=5759 |
| Exam Structures & Rules Tables v1.19 | https://istqb.org/?sdm_process_download=1&download_id=3832 |
| CTAL-TA v4.0 Release Notes | https://istqb.org/?sdm_process_download=1&download_id=5762 |
| LO new vs old 比較表 | https://istqb.org/?sdm_process_download=1&download_id=6363 |
| ISTQB 用語集 v4.8.1（日本語版・英語版の全件 PDF 出力） | https://glossary.istqb.org/ （出力手順は JSTQB 用語集ユーザーマニュアル V2.0 の 3.2・4 章） |

この環境の egress ポリシーは jstqb.jp・istqb.org・glossary.istqb.org・juse.or.jp を遮断するため、資料はアップロードで受け取る。
