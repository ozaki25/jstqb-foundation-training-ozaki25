---
title: ドリル — 模擬試験（45問）
prev: false
next: false
---

# 模擬試験（45問）

ISTQB の V4.0 試験と同じ **45 問**を、本番と同じ配分（章ごとに 8 問・3 問・22 問・4 問・8 問。学習目標ごとの問題数も本番に合わせる）で、各レッスンからランダムに出題します。ISTQB 基準の試験時間は 120 分（非母語の受験者は 150 分）、合格ラインは 78 点満点中 51 点です。時間を計って解くと本番のペース感覚をつかめます。

::: info 本番との違い
問題数の配分は ISTQB の出題表に合わせていますが、問題そのものはこの教材のオリジナルです。実際の試験は K2 を 1 点、K3 を 2 点、K4 を 3 点で採点しますが、この模擬試験は正答数と正答率で結果を表示します。日本の V4.0 試験の正式な形式（問題数・合格点など）は未発表のため、数値は ISTQB の基準です。
:::

<script setup>
import { allQuizzes } from '../data/index'
import { MOCK_EXAM_QUOTA } from '../types'
</script>

<QuizPage :quizzes="allQuizzes" :random-sample="45" :quota-groups="MOCK_EXAM_QUOTA" title="模擬試験（45問）" />
