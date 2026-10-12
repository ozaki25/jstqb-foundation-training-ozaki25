// Ground-truth data for the AL-TA E2E suites.
//
// 期待値（章ごとの問題数・模擬試験の配分・図表の中身など）はアプリと同じデータ
// （docs/quiz/data/*.ts と docs/quiz/types.ts）から求める。数値を直書きしない。
// Node 22 は .ts をそのまま import できる（型は読み込み時に取り除かれる）。
// 型だけを import しているファイルしか読まないので、パスの解決で困ることはない。

import { readdirSync } from 'node:fs'

const quizDir = new URL('../docs/quiz/', import.meta.url)
const types = await import(new URL('types.ts', quizDir))

export const STORAGE_KEY = types.STORAGE_KEY
export const MOCK_SIZE = types.MOCK_EXAM_SIZE
export const QUOTA = types.MOCK_EXAM_QUOTA
export const CHAPTERS = types.chapters

const chapterFiles = readdirSync(new URL('data/', quizDir))
  .filter((f) => /^chapter\d+\.ts$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10))

// Quizzes per chapter id, in file order (= fixed order of the chapter drill page).
export const BY_CHAPTER = {}
for (const f of chapterFiles) {
  const n = parseInt(f.match(/\d+/)[0], 10)
  const mod = await import(new URL(`data/${f}`, quizDir))
  BY_CHAPTER[n] = mod[`chapter${n}`]
}
export const CHAPTER_IDS = CHAPTERS.map((c) => c.id)
export const ALL = CHAPTER_IDS.flatMap((id) => BY_CHAPTER[id])
export const BY_ID = new Map(ALL.map((q) => [q.id, q]))

export function lessonNumber(lesson) {
  return parseInt(lesson.replace('lesson', ''), 10)
}

// Chapter that owns a lesson, according to chapters[].lessonRange.
export function chapterOfLesson(lesson) {
  const n = lessonNumber(lesson)
  for (const ch of CHAPTERS) {
    if (n >= lessonNumber(ch.lessonRange[0]) && n <= lessonNumber(ch.lessonRange[1])) return ch.id
  }
  return null
}

export const LESSONS = (() => {
  const last = Math.max(...CHAPTERS.map((c) => lessonNumber(c.lessonRange[1])))
  return Array.from({ length: last }, (_, i) => `lesson${String(i + 1).padStart(2, '0')}`)
})()

// The text the page shows for a string with `code` spans (QuizCard.renderText).
export function norm(s) {
  // Zero-width characters come from VitePress header anchors (and similar), never from the data.
  return String(s).replace(/`/g, '').replace(/[\u200b-\u200d\ufeff]/g, '').replace(/\s+/g, ' ').trim()
}

// A question stem is not unique on its own (q373 / q377 share a stem and differ in the
// figure that carries the situation), so a displayed card is identified by its stem
// plus its set of choices.
export function cardKey(question, choices) {
  return norm(question) + '||' + choices.map(norm).sort().join('|')
}
export const BY_CARD = new Map(ALL.map((q) => [cardKey(q.question, q.choices), q]))

export function hasFigures(q) {
  return (q.figures?.length ?? 0) + (q.explanationFigures?.length ?? 0) > 0
}
export const FIGURE_QUIZZES = ALL.filter(hasFigures)

// Index of the quiz inside its chapter (0-based).
export function indexInChapter(q) {
  const ch = chapterOfLesson(q.lesson)
  return BY_CHAPTER[ch].findIndex((x) => x.id === q.id)
}

// Quota expectations derived from MOCK_EXAM_QUOTA.
export function quotaPerChapter() {
  const per = {}
  for (const g of QUOTA) {
    for (const l of g.lessons) {
      const ch = chapterOfLesson(l)
      per[ch] = (per[ch] ?? 0)
    }
    // A group's count belongs to the chapter of its first lesson (groups never span chapters).
    const ch = chapterOfLesson(g.lessons[0])
    per[ch] += g.count
  }
  return per
}

export const QUOTA_PER_CHAPTER = quotaPerChapter()
