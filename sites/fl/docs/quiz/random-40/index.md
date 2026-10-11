---
title: ドリル — 模擬試験（40問）
prev: false
next: false
---

# 模擬試験（40問）

本番の JSTQB Foundation Level と同じ **40 問**を、全 6 章・全難易度からランダムに出題します。本番の試験時間は 60 分、合格ラインは 65%（40 問中 26 問）です。時間を計って解くと本番のペース感覚をつかめます。

::: info 本番との違い
出題の順序・分野の配分はランダムであり、実際の試験の出題割合を再現したものではありません。実際の試験はオンライン CBT 方式で、見直し用のチェック機能などがあります。
:::

<script setup>
import { allQuizzes } from '../data/index'
</script>

<QuizPage :quizzes="allQuizzes" :random-sample="40" title="模擬試験（40問）" />
