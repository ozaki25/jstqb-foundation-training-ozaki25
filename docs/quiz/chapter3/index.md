---
title: ドリル — 3章 静的テスト
prev: false
next: false
---

# 3章 静的テスト

<script setup>
import { quizzesByChapter } from '../data/index'
const quizzes = quizzesByChapter[3]
</script>

<QuizPage :quizzes="quizzes" :chapter="3" title="3章 静的テスト" />
