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
| ✅ 受験要件 | Foundation Level の認定（v4.0 推奨。旧版も可）と実務経験 | ISTQB CTAL-TA v4.0 ページ |

## 未確認（優先度順）

| 項目 | 現状 | 確認先 |
|---|---|---|
| ⬜ 日本の V4.0 試験の問題数・合格点 | JSTQB 試験実施案内は「40問・120分」だが 3.1.1 試験の記載とみられる（FL は日本と ISTQB で問題数が一致するため）。日科技連 FAQ は「試験 150 分」（120 分×1.25 と一致）。教材の模擬試験は ISTQB 基準（45 問・51/78）を「日本の正式形式は未発表」と明記して使う | 日科技連 Advanced 試験ページ（https://www.juse.or.jp/sqip/qualification/jstqb/advanced.html#ta）・JSTQB の今後の告知 |
| ⬜ 章ごとの出題数・配点・K レベル | 未取得 | ISTQB Exam Structures & Rules Tables v1.19 |
| ⬜ 日本語の章名・用語の訳語 | 未取得 | JSTQB シラバス V4.0.J01・ISTQB 用語集（TA v4.0 で絞り込み） |
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
| ISTQB 用語集（日本語・TA v4.0 で絞り込み） | https://glossary.istqb.org/ |

この環境の egress ポリシーは jstqb.jp・istqb.org・glossary.istqb.org・juse.or.jp を遮断するため、資料はアップロードで受け取る。
