// ============================================================================
// AL-TA E2E — chapter drills (5 chapters, all questions in fixed order).
//
//   QZ-Z    data sanity (lessons exist, chapter files match lessonRange, 4 choices …)
//   QZ-A-n  walk every question of chapter n: card order, badge, highlight, explanation,
//           lesson link, localStorage record, finish screen
//   QZ-B    resume: reload mid-way, reload after answering, new tab (toast), restart, reset
//   QZ-C    shuffle correctness: SSR order is identity, client shuffles, correct choice always
//           judged correct, keyboard selection follows the displayed order
//   QZ-D    navigation buttons (前の問題 / 次の問題 / 結果を見る) and keyboard guards
//   QZ-E    drill top page (counts, banners, reset progress)
//
// Expectations come from docs/quiz/data/*.ts and docs/quiz/types.ts via data.mjs.
// ============================================================================

import { block, run } from './runner.mjs'
import {
  newInstrumentedPage, summarizeErrors, hasErrors, url, clearStorage, gotoQuiz, gotoPage,
  readChoices, readQuestion, currentQuiz, answerCurrent, clickNext, clickChoice, choiceIndexes,
  readCardPosition, readProgress, readChoiceClasses, getStorage, setStorage,
} from './helpers.mjs'
import {
  ALL, BY_CHAPTER, BY_ID, CHAPTER_IDS, CHAPTERS, LESSONS, STORAGE_KEY, MOCK_SIZE, norm,
  chapterOfLesson, lessonNumber,
} from './data.mjs'

const DIFF_LABEL = { easy: 'やさしい', normal: 'ふつう', hard: 'むずかしい' }
const path = (n) => `/quiz/chapter${n}/`
const smallestChapter = CHAPTER_IDS.reduce((a, b) => (BY_CHAPTER[a].length <= BY_CHAPTER[b].length ? a : b))

async function freshChapter(browser, n, opts) {
  const ctx = await newInstrumentedPage(browser, opts)
  await gotoPage(ctx.page, path(n))
  await clearStorage(ctx.page)
  await gotoQuiz(ctx.page, path(n))
  return ctx
}

// ============================================================================
block('QZ-Z. Data sanity (ground truth for the other blocks)', async ({ t }) => {
  t.check(`${CHAPTER_IDS.length} chapters`, CHAPTER_IDS.length > 0, '')
  const badLesson = ALL.filter((q) => !LESSONS.includes(q.lesson)).map((q) => q.id)
  t.check('every quiz points to an existing lesson', badLesson.length === 0, badLesson.join(','))
  const ids = ALL.map((q) => q.id)
  t.check(`ids are unique (${ids.length})`, new Set(ids).size === ids.length)
  const mismatch = []
  for (const n of CHAPTER_IDS) for (const q of BY_CHAPTER[n]) if (chapterOfLesson(q.lesson) !== n) mismatch.push(q.id)
  t.check('every chapterN.ts only holds lessons of chapter N (lessonRange)', mismatch.length === 0, mismatch.join(','))
  const badChoices = ALL.filter(
    (q) => q.choices.length !== 4 || new Set(q.choices.map(norm)).size !== 4 || ![0, 1, 2, 3].includes(q.answer),
  ).map((q) => q.id)
  t.check('every quiz has 4 distinct choices and answer 0-3', badChoices.length === 0, badChoices.join(','))
  const cardKeys = new Set(ALL.map((q) => norm(q.question) + '||' + q.choices.map(norm).sort().join('|')))
  t.check('every (question, choices) pair is unique (cards are identifiable)', cardKeys.size === ALL.length)
  t.check('chapter list covers every lesson once', LESSONS.every((l) => chapterOfLesson(l) != null))
})

// ============================================================================
for (const n of CHAPTER_IDS) {
  block(`QZ-A-${n}. Walk chapter ${n} (every question, fixed order, mixed right/wrong)`, async ({ t, browser }) => {
    const quizzes = BY_CHAPTER[n]
    const total = quizzes.length
    const { page, errors } = await freshChapter(browser, n)
    t.info(`chapter ${n}: ${total} questions`)

    const problems = { order: [], position: [], difficulty: [], nextGate: [], badge: [], prevNote: [], highlight: [], disabled: [], explanation: [], lessonLink: [], progress: [], wrongNote: [] }
    const expectedCorrect = new Map() // id -> boolean
    const clickedOriginal = new Map() // id -> original index clicked

    for (let i = 0; i < total; i++) {
      const q = quizzes[i]
      const shown = await currentQuiz(page)
      if (!shown || shown.id !== q.id) problems.order.push(`#${i + 1} want ${q.id} got ${shown && shown.id}`)
      const pos = await readCardPosition(page)
      if (!pos || pos.n !== i + 1 || pos.total !== total) problems.position.push(`#${i + 1} ${JSON.stringify(pos)}`)
      const diff = norm(await page.textContent('.quiz-difficulty'))
      if (diff !== DIFF_LABEL[q.difficulty]) problems.difficulty.push(`${q.id}: ${diff}`)
      const nextDisabledBefore = await page.locator('.btn-next').isDisabled()
      if (!nextDisabledBefore) problems.nextGate.push(`${q.id}: next enabled before answering`)
      const progBefore = await readProgress(page)
      if (!progBefore || progBefore.answered !== i || progBefore.total !== total) problems.progress.push(`${q.id} before: ${JSON.stringify(progBefore)}`)

      const wantCorrect = i % 3 !== 2
      expectedCorrect.set(q.id, wantCorrect)
      const mode = wantCorrect ? 'correct' : 'wrong'
      const { correct, wrong, choices } = await choiceIndexes(page, q)
      const idx = wantCorrect ? correct : wrong
      clickedOriginal.set(q.id, q.choices.map(norm).indexOf(choices[idx]))
      await clickChoice(page, idx)

      const badge = await page.getAttribute('.result-badge', 'data-correct')
      if (badge !== String(wantCorrect)) problems.badge.push(`${q.id}: data-correct=${badge} want ${wantCorrect}`)
      const badgeText = norm(await page.textContent('.result-badge'))
      if (badgeText.replace(/\s*（前回の回答）/, '') !== (wantCorrect ? '正解' : '不正解')) problems.badge.push(`${q.id}: badge text "${badgeText}"`)
      // A fresh answer is not a "previous answer": the （前回の回答） note is for restored answers only.
      if (/前回の回答/.test(badgeText)) problems.prevNote.push(`${q.id}: "${badgeText}"`)

      const classes = await readChoiceClasses(page)
      const texts = await readChoices(page)
      const wantText = norm(q.choices[q.answer])
      const correctBtns = classes.map((c, k) => (/\bcorrect\b/.test(c) ? k : -1)).filter((k) => k >= 0)
      const wrongBtns = classes.map((c, k) => (/\bwrong\b/.test(c) ? k : -1)).filter((k) => k >= 0)
      const okCorrect = correctBtns.length === 1 && texts[correctBtns[0]] === wantText
      const okWrong = wantCorrect ? wrongBtns.length === 0 : wrongBtns.length === 1 && wrongBtns[0] === idx && texts[wrongBtns[0]] !== wantText
      const okDim = classes.every((c, k) => correctBtns.includes(k) || wrongBtns.includes(k) || /\bdim\b/.test(c))
      if (!(okCorrect && okWrong && okDim)) problems.highlight.push(`${q.id}: classes=${JSON.stringify(classes)} clicked=${idx} correctIdx=${correct}`)
      const checkBadge = await page.locator('.choice-check').count()
      if (checkBadge !== 1) problems.highlight.push(`${q.id}: .choice-check count=${checkBadge}`)
      const disabledAll = await page.$$eval('.quiz-choices button', (bs) => bs.every((b) => b.disabled))
      if (!disabledAll) problems.disabled.push(q.id)

      const expl = norm(await page.textContent('.quiz-explanation'))
      if (expl !== norm(q.explanation)) problems.explanation.push(q.id)
      const href = await page.getAttribute('.quiz-lesson-link a', 'href')
      if (href !== `/lessons/${q.lesson}/`) problems.lessonLink.push(`${q.id}: ${href}`)
      const hasWrongNote = (await page.locator('.quiz-after-wrong').count()) > 0
      if (hasWrongNote !== !wantCorrect) problems.wrongNote.push(`${q.id}: note=${hasWrongNote}`)
      if (await page.locator('.btn-next').isDisabled()) problems.nextGate.push(`${q.id}: next still disabled after answering`)
      const progAfter = await readProgress(page)
      if (!progAfter || progAfter.answered !== i + 1) problems.progress.push(`${q.id} after: ${JSON.stringify(progAfter)}`)

      const nextLabel = norm(await page.textContent('.btn-next'))
      const wantLabel = i + 1 < total ? '次の問題' : '結果を見る'
      if (nextLabel !== wantLabel) problems.nextGate.push(`${q.id}: next label "${nextLabel}"`)
      await clickNext(page)
    }

    t.check(`${total} cards shown in data order`, problems.order.length === 0, problems.order.slice(0, 3).join(' | '))
    t.check('card position "k / total" is correct', problems.position.length === 0, problems.position.slice(0, 3).join(' | '))
    t.check('difficulty label matches data', problems.difficulty.length === 0, problems.difficulty.slice(0, 3).join(' | '))
    t.check('次の問題 is disabled until answered, enabled after; last button says 結果を見る', problems.nextGate.length === 0, problems.nextGate.slice(0, 3).join(' | '))
    t.check('progress counter follows answers', problems.progress.length === 0, problems.progress.slice(0, 3).join(' | '))
    t.check('badge 正解/不正解 matches the clicked choice', problems.badge.length === 0, problems.badge.slice(0, 3).join(' | '))
    t.check('a fresh answer is not labelled （前回の回答）', problems.prevNote.length === 0, `${problems.prevNote.length} of ${total} cards, e.g. ${problems.prevNote.slice(0, 2).join(' | ')}`)
    t.check('exactly the correct choice is green, the wrong click is red, the rest dim (any shuffle)', problems.highlight.length === 0, problems.highlight.slice(0, 3).join(' | '))
    t.check('choices are disabled after answering', problems.disabled.length === 0, problems.disabled.slice(0, 3).join(' | '))
    t.check('explanation text equals data', problems.explanation.length === 0, problems.explanation.slice(0, 3).join(' | '))
    t.check('lesson link points to /lessons/<lesson>/', problems.lessonLink.length === 0, problems.lessonLink.slice(0, 3).join(' | '))
    t.check('「解説を読めば…」note only after a wrong answer', problems.wrongNote.length === 0, problems.wrongNote.slice(0, 3).join(' | '))

    // ── finish screen ──
    await page.waitForSelector('.quiz-finish')
    const correctN = [...expectedCorrect.values()].filter(Boolean).length
    const wrongN = total - correctN
    const score = norm(await page.textContent('.finish-score strong'))
    t.check(`finish score = ${correctN} / ${total}`, score === `${correctN} / ${total}`, score)
    const rate = norm(await page.textContent('.finish-rate'))
    t.check('finish rate matches', rate === `正答率 ${Math.round((correctN / total) * 100)}%`, rate)
    const wrongRows = await page.locator('.finish-row[data-correct="false"]').count()
    const wrongHeading = await page.locator('.finish-section-wrong').textContent()
    t.check(`wrong list lists ${wrongN} questions`, wrongRows === wrongN && norm(wrongHeading).includes(`${wrongN} 問`), `rows=${wrongRows} heading=${wrongHeading}`)
    const correctHeading = norm(await page.locator('.finish-section-correct').textContent())
    t.check(`correct section says ${correctN}`, correctHeading.includes(`正解 ${correctN} 問`), correctHeading)
    const wrongIdsShown = await page.$$eval('.finish-row[data-correct="false"] .finish-row-num', (els) => els.map((e) => Number(e.textContent)))
    const wrongIdsWant = quizzes.map((q, i) => (expectedCorrect.get(q.id) ? null : i + 1)).filter(Boolean)
    t.check('wrong list shows the right question numbers', JSON.stringify(wrongIdsShown) === JSON.stringify(wrongIdsWant), `${wrongIdsShown} vs ${wrongIdsWant}`)
    const answerLines = await page.$$eval('.finish-row[data-correct="false"] .finish-row-answer', (els) => els.map((e) => e.textContent.trim()))
    const wantLines = quizzes.filter((q) => !expectedCorrect.get(q.id)).map((q) => `正解: ${norm(q.choices[q.answer])}`)
    t.check('wrong rows show the correct answer text', JSON.stringify(answerLines.map(norm)) === JSON.stringify(wantLines.map(norm)), answerLines.slice(0, 2).join(' / '))
    const chLabels = await page.$$eval('.finish-row[data-correct="false"] .finish-row-chapter', (els) => els.map((e) => e.textContent.trim()))
    t.check(`chapter label on wrong rows is ${n}章`, chLabels.length === wrongN && chLabels.every((l) => l === `${n}章`), chLabels.join(','))
    const review = page.locator('.btn-review-cta')
    t.check('review CTA shows when something was wrong', (await review.count()) === 1 && norm(await review.textContent()).includes(`${wrongN} 問`) && (await review.getAttribute('href')) === '/quiz/review/')
    const nextCh = CHAPTERS.find((c) => c.id === n + 1)
    const nextLink = page.locator('.btn-next-chapter')
    if (nextCh) {
      t.check(`next-chapter link → /quiz/chapter${nextCh.id}/`, (await nextLink.count()) === 1 && (await nextLink.getAttribute('href')) === path(nextCh.id) && norm(await nextLink.textContent()).includes(nextCh.title))
    } else {
      t.check('last chapter has no next-chapter link', (await nextLink.count()) === 0)
    }
    t.check('finish screen has ドリル一覧へ link', (await page.locator('.finish-actions a.btn-list[href="/quiz/"]').count()) === 1)

    // ── persisted record ──
    const stored = await getStorage(page, 'local', STORAGE_KEY)
    const badRec = []
    for (const q of quizzes) {
      const r = stored && stored[q.id]
      if (!r) { badRec.push(`${q.id}: missing`); continue }
      if (r.correct !== expectedCorrect.get(q.id)) badRec.push(`${q.id}: correct=${r.correct}`)
      if (r.selectedIndex !== clickedOriginal.get(q.id)) badRec.push(`${q.id}: selectedIndex=${r.selectedIndex} want ${clickedOriginal.get(q.id)}`)
      if (r.correct && r.selectedIndex !== q.answer) badRec.push(`${q.id}: correct but selectedIndex≠answer`)
      if (!r.correct && r.selectedIndex === q.answer) badRec.push(`${q.id}: wrong but selectedIndex=answer`)
    }
    t.check(`localStorage "${STORAGE_KEY}" has ${total} records with correct flag + original-index selectedIndex`, badRec.length === 0, badRec.slice(0, 3).join(' | '))
    t.check('only this chapter was recorded', Object.keys(stored).length === total, `keys=${Object.keys(stored).length}`)
    t.check('no console / page / network errors during the walk', !hasErrors(errors), summarizeErrors(errors))
  })
}

// ============================================================================
block('QZ-B. Resume (reload, new tab, restart, reset)', async ({ t, browser }) => {
  const n = smallestChapter
  const quizzes = BY_CHAPTER[n]
  const total = quizzes.length
  const { page, context, errors } = await freshChapter(browser, n)
  t.info(`using chapter ${n} (${total} questions)`)

  // answer first 3 (2nd wrong), stay on the 4th, unanswered
  const done = []
  for (let i = 0; i < 3; i++) {
    done.push(await answerCurrent(page, i === 1 ? 'wrong' : 'correct'))
    await clickNext(page)
  }
  t.check('on question 4 after three answers', (await readCardPosition(page)).n === 4)

  // ── 1. same-tab reload (sessionStorage view position) ──
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-card')
  let pos = await readCardPosition(page)
  t.check('reload → resumes at question 4', pos && pos.n === 4, JSON.stringify(pos))
  t.check('reload → question 4 is the 4th question in data order', (await currentQuiz(page))?.id === quizzes[3].id)
  t.check('reload → 3 answered shown in progress', (await readProgress(page))?.answered === 3)
  t.check('reload in the same tab shows no 前回の続き toast', (await page.locator('.quiz-resume-toast').count()) === 0)
  t.check('reload → question 4 is unanswered (choices enabled, next disabled)', (await page.locator('.quiz-result').count()) === 0 && (await page.locator('.btn-next').isDisabled()))

  // step back: question 2 keeps its wrong answer and highlights
  await page.locator('.btn-prev').click()
  await page.locator('.btn-prev').click()
  const q2 = await currentQuiz(page)
  t.check('prev×2 → question 2', q2?.id === quizzes[1].id)
  t.check('question 2 is restored as answered (前回の回答)', (await page.locator('.result-badge-prev').count()) === 1)
  t.check('question 2 badge is 不正解', (await page.getAttribute('.result-badge', 'data-correct')) === 'false')
  {
    const classes = await readChoiceClasses(page)
    const texts = await readChoices(page)
    const wrongIdx = classes.findIndex((c) => /\bwrong\b/.test(c))
    const correctIdx = classes.findIndex((c) => /\bcorrect\b/.test(c))
    const want = done[1]
    t.check(
      'restored wrong highlight sits on the text that was clicked, green on the correct text',
      wrongIdx >= 0 && texts[correctIdx] === norm(q2.choices[q2.answer]) && texts[wrongIdx] === norm(q2.choices[q2.choices.map(norm).indexOf(texts[wrongIdx])]) && texts[wrongIdx] !== norm(q2.choices[q2.answer]),
      JSON.stringify({ classes, texts }),
    )
    const stored = await getStorage(page, 'local', STORAGE_KEY)
    t.check('restored wrong highlight = stored selectedIndex', wrongIdx >= 0 && norm(q2.choices[stored[q2.id].selectedIndex]) === texts[wrongIdx], `stored=${stored[q2.id].selectedIndex}`)
  }

  // ── 2. reload right after answering (without 次の問題) ──
  await page.locator('.btn-next').click() // → q3
  await page.locator('.btn-next').click() // → q4
  const a4 = await answerCurrent(page, 'wrong')
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-card')
  t.check('reload after answering (no 次へ) stays on that question', (await currentQuiz(page))?.id === a4.quiz.id)
  t.check('…and it is shown as answered wrong', (await page.getAttribute('.result-badge', 'data-correct')) === 'false' && (await page.locator('.result-badge-prev').count()) === 1)
  t.check('…and 次の問題 is enabled', !(await page.locator('.btn-next').isDisabled()))
  t.check('…progress says 4 answered', (await readProgress(page))?.answered === 4)

  // ── 3. new tab: sessionStorage is empty, localStorage carries over ──
  const page2 = await context.newPage()
  page2.on('pageerror', (e) => errors.pageErrors.push(String(e)))
  await page2.goto(url(path(n)), { waitUntil: 'networkidle' })
  await page2.waitForSelector('.quiz-card')
  const toast = page2.locator('.quiz-resume-toast')
  t.check('new tab shows the 前回の続き toast', (await toast.count()) === 1)
  t.check('toast says 5 問目から再開', norm(await page2.textContent('.quiz-resume-toast-text')) === '前回の続き、5 問目から再開しました', norm(await page2.textContent('.quiz-resume-toast-text').catch(() => '')))
  t.check('new tab opens question 5', (await readCardPosition(page2)).n === 5 && (await currentQuiz(page2))?.id === quizzes[4].id)
  t.check('new tab progress = 4 answered', (await readProgress(page2))?.answered === 4)
  await page2.locator('.quiz-resume-toast-close').click()
  t.check('× closes the toast', (await page2.locator('.quiz-resume-toast').count()) === 0)
  // previous answers are visible when going back
  await page2.locator('.btn-prev').click()
  t.check('going back in the new tab shows question 4 answered (前回の回答)', (await currentQuiz(page2))?.id === quizzes[3].id && (await page2.locator('.result-badge-prev').count()) === 1)
  // reload resets toast? (session state exists now)
  await page2.reload({ waitUntil: 'networkidle' })
  await page2.waitForSelector('.quiz-card')
  t.check('reloading the new tab stays on question 4 without the toast', (await readCardPosition(page2)).n === 4 && (await page2.locator('.quiz-resume-toast').count()) === 0)
  await page2.close()

  // new tab again, then use 「1問目から始める」
  const page3 = await context.newPage()
  page3.on('pageerror', (e) => errors.pageErrors.push(String(e)))
  await page3.goto(url(path(n)), { waitUntil: 'networkidle' })
  await page3.waitForSelector('.quiz-card')
  await page3.locator('.quiz-resume-toast-restart').click()
  t.check('「1問目から始める」→ question 1', (await readCardPosition(page3)).n === 1 && (await currentQuiz(page3))?.id === quizzes[0].id)
  t.check('…toast gone, progress 0', (await page3.locator('.quiz-resume-toast').count()) === 0 && (await readProgress(page3))?.answered === 0)
  const afterRestart = await getStorage(page3, 'local', STORAGE_KEY)
  t.check('…stored answers of this chapter are cleared', Object.keys(afterRestart ?? {}).filter((k) => BY_ID.get(k) && chapterOfLesson(BY_ID.get(k).lesson) === n).length === 0, JSON.stringify(afterRestart))
  await page3.close()

  // ── 4. finish → reload → new tab restores the result ──
  await page.goto(url(path(n)), { waitUntil: 'networkidle' })
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await gotoQuiz(page, path(n))
  let wrongCount = 0
  for (let i = 0; i < total; i++) {
    const wrongNow = i % 4 === 3
    if (wrongNow) wrongCount++
    await answerCurrent(page, wrongNow ? 'wrong' : 'correct')
    await clickNext(page)
  }
  await page.waitForSelector('.quiz-finish')
  const scoreText = norm(await page.textContent('.finish-score strong'))
  t.check(`finished: ${total - wrongCount} / ${total}`, scoreText === `${total - wrongCount} / ${total}`, scoreText)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-finish')
  t.check('reload on the finish screen → still the finish screen with same score', norm(await page.textContent('.finish-score strong')) === scoreText)
  const page4 = await context.newPage()
  page4.on('pageerror', (e) => errors.pageErrors.push(String(e)))
  await page4.goto(url(path(n)), { waitUntil: 'networkidle' })
  await page4.waitForSelector('.quiz-finish')
  t.check('new tab after answering everything → finish screen with same score', norm(await page4.textContent('.finish-score strong')) === scoreText)
  await page4.close()

  // ── 5. 「同じ問題でもう一度」 clears only this chapter ──
  const otherChapter = CHAPTER_IDS.find((c) => c !== n)
  const otherQ = BY_CHAPTER[otherChapter][0]
  await setStorage(page, { local: { [STORAGE_KEY]: { ...(await getStorage(page, 'local', STORAGE_KEY)), [otherQ.id]: { correct: false, ts: 1, selectedIndex: otherQ.answer === 0 ? 1 : 0 } } } })
  await page.locator('.finish-actions button.btn-restart').click()
  await page.waitForSelector('.quiz-card')
  t.check('「同じ問題でもう一度」 → question 1, progress 0', (await readCardPosition(page)).n === 1 && (await readProgress(page)).answered === 0)
  const afterAgain = await getStorage(page, 'local', STORAGE_KEY)
  t.check('…this chapter’s records are gone, other chapter’s record stays', Object.keys(afterAgain).length === 1 && !!afterAgain[otherQ.id], JSON.stringify(Object.keys(afterAgain)))
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-card')
  t.check('reload after restart opens question 1 (not the old finish screen)', (await readCardPosition(page)).n === 1)

  // ── 6. 「もう一度解く」 resets one answer ──
  const first = await answerCurrent(page, 'wrong')
  t.check('answered wrong → もう一度解く button visible', (await page.locator('.btn-reset').count()) === 1)
  await page.locator('.btn-reset').click()
  t.check('reset → no result, choices enabled', (await page.locator('.quiz-result').count()) === 0 && !(await page.locator('.quiz-choices button').first().isDisabled()))
  t.check('reset → progress back to 0 and next disabled', (await readProgress(page)).answered === 0 && (await page.locator('.btn-next').isDisabled()))
  const afterReset = await getStorage(page, 'local', STORAGE_KEY)
  t.check('reset → record removed from localStorage', !afterReset[first.quiz.id])
  const again = await answerCurrent(page, 'correct')
  t.check('after reset the question can be answered again (correct)', again.quiz.id === first.quiz.id && (await page.getAttribute('.result-badge', 'data-correct')) === 'true')

  t.check('no console / page / network errors', !hasErrors(errors), summarizeErrors(errors))
})

// ============================================================================
block('QZ-C. Shuffle correctness (SSR order, client shuffle, judging)', async ({ t, browser }) => {
  const n = CHAPTER_IDS[0]
  const q0 = BY_CHAPTER[n][0]

  // SSR HTML must carry the choices in the original (identity) order.
  const { page, errors } = await newInstrumentedPage(browser)
  const html = await (await page.request.get(url(path(n)))).text()
  const ssrChoices = [...html.matchAll(/<span class="choice-text"[^>]*>([\s\S]*?)<\/span>/g)].map((m) => norm(m[1].replace(/<[^>]+>/g, '')).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'))
  t.check('SSR HTML renders choices in data order (identity)', JSON.stringify(ssrChoices) === JSON.stringify(q0.choices.map(norm)), JSON.stringify(ssrChoices))
  t.check('SSR HTML contains the first question text', html.includes(norm(q0.question).slice(0, 12)))

  // Client shuffles: many loads of the same first question give more than one order.
  await gotoPage(page, path(n))
  await clearStorage(page)
  const orders = new Set()
  const loads = 14
  let allJudgedRight = true
  let selectedOk = true
  for (let i = 0; i < loads; i++) {
    await gotoQuiz(page, path(n))
    await clearStorage(page)
    await gotoQuiz(page, path(n))
    const texts = await readChoices(page)
    orders.add(texts.join('|'))
    const sameSet = JSON.stringify([...texts].sort()) === JSON.stringify(q0.choices.map(norm).sort())
    if (!sameSet) allJudgedRight = false
    const { quiz } = await answerCurrent(page, 'correct')
    const badge = await page.getAttribute('.result-badge', 'data-correct')
    if (badge !== 'true') allJudgedRight = false
    const rec = (await getStorage(page, 'local', STORAGE_KEY))[quiz.id]
    if (!rec || rec.selectedIndex !== quiz.answer || rec.correct !== true) selectedOk = false
  }
  t.check(`choice display order is shuffled on the client (${orders.size} distinct orders in ${loads} loads)`, orders.size > 1, `orders=${orders.size}`)
  t.check(`pressing the correct choice is always judged 正解 (${loads} loads, 4 choices intact)`, allJudgedRight)
  t.check('stored selectedIndex is the ORIGINAL index regardless of display order', selectedOk)

  // Wrong choice: each of the three wrong choices is judged 不正解 and stored by original index.
  let wrongOk = true
  for (let w = 0; w < 3; w++) {
    await clearStorage(page)
    await gotoQuiz(page, path(n))
    const texts = await readChoices(page)
    const wrongTexts = q0.choices.map(norm).filter((_, k) => k !== q0.answer)
    const idx = texts.indexOf(wrongTexts[w])
    await clickChoice(page, idx)
    const badge = await page.getAttribute('.result-badge', 'data-correct')
    const rec = (await getStorage(page, 'local', STORAGE_KEY))[q0.id]
    const origIdx = q0.choices.map(norm).indexOf(wrongTexts[w])
    const classes = await readChoiceClasses(page)
    if (badge !== 'false' || !rec || rec.correct !== false || rec.selectedIndex !== origIdx || !/\bwrong\b/.test(classes[idx])) wrongOk = false
  }
  t.check('each of the 3 wrong choices → 不正解, red on that text, original index stored', wrongOk)

  // Restoring an answered card after a reload keeps text↔highlight in step with the new shuffle.
  await clearStorage(page)
  await gotoQuiz(page, path(n))
  const a = await answerCurrent(page, 'wrong')
  const clickedText = (await readChoices(page))[a.idx]
  let restoredOk = true
  for (let i = 0; i < 6; i++) {
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('.quiz-card')
    const classes = await readChoiceClasses(page)
    const texts = await readChoices(page)
    const wi = classes.findIndex((c) => /\bwrong\b/.test(c))
    const ci = classes.findIndex((c) => /\bcorrect\b/.test(c))
    if (!(wi >= 0 && texts[wi] === clickedText && ci >= 0 && texts[ci] === norm(q0.choices[q0.answer]))) restoredOk = false
  }
  t.check('answered card restored after reload: red/green stay on the same TEXT (6 reloads)', restoredOk)

  // All questions of the smallest chapter: the correct text is judged correct, at least once per displayed position overall.
  const ch = CHAPTER_IDS.reduce((x, y) => (BY_CHAPTER[x].length <= BY_CHAPTER[y].length ? x : y))
  await clearStorage(page)
  await gotoQuiz(page, path(ch))
  const positions = new Set()
  let allOk = true
  for (let i = 0; i < BY_CHAPTER[ch].length; i++) {
    const { quiz, idx } = await answerCurrent(page, 'correct')
    positions.add(idx)
    if ((await page.getAttribute('.result-badge', 'data-correct')) !== 'true') allOk = false
    await clickNext(page)
  }
  t.check(`chapter ${ch}: every question's correct text judged 正解 (displayed at positions ${[...positions].sort().join(',')})`, allOk && positions.size > 1)
  t.check('no console / page / network errors', !hasErrors(errors), summarizeErrors(errors))
})

// ============================================================================
block('QZ-D. Navigation buttons and keyboard', async ({ t, browser }) => {
  const n = smallestChapter
  const quizzes = BY_CHAPTER[n]
  const { page, errors } = await freshChapter(browser, n)

  t.check('first question: 前の問題 is hidden', (await page.locator('.btn-prev').count()) === 0)
  t.check('first question: 次の問題 is disabled before answering', await page.locator('.btn-next').isDisabled())
  t.check('first question: keyboard hint is shown on desktop', (await page.locator('.quiz-keyboard-hint').count()) === 1)
  t.check('choices list has an aria-label', (await page.getAttribute('.quiz-choices', 'aria-label')) === '選択肢')
  t.check('progress bar has role=progressbar with aria-valuemax = total', (await page.getAttribute('[role="progressbar"]', 'aria-valuemax')) === String(quizzes.length))

  // keyboard: digits and letters pick the DISPLAYED choice
  for (const [key, want] of [['3', 2], ['b', 1], ['D', 3], ['1', 0]]) {
    await clearStorage(page)
    await gotoQuiz(page, path(n))
    await page.waitForTimeout(150) // keydown listener is attached in onMounted
    const texts = await readChoices(page)
    for (let i = 0; i < 6 && (await page.locator('.quiz-result').count()) === 0; i++) {
      await page.keyboard.press(key)
      await page.waitForTimeout(100)
    }
    const classes = await readChoiceClasses(page)
    const stored = await getStorage(page, 'local', STORAGE_KEY)
    const q = quizzes[0]
    const rec = stored[q.id]
    const pressedText = texts[want]
    t.check(
      `key "${key}" selects displayed choice ${want + 1} (${'ABCD'[want]})`,
      rec && norm(q.choices[rec.selectedIndex]) === pressedText && rec.correct === (pressedText === norm(q.choices[q.answer])),
      `rec=${JSON.stringify(rec)} pressedText=${pressedText}`,
    )
    t.check(`key "${key}" → the pressed choice is the one highlighted (green if right, red if wrong)`, /\b(correct|wrong)\b/.test(classes[want]), JSON.stringify(classes))
  }

  // after answering, other keys do not change the answer
  const before = JSON.stringify(await getStorage(page, 'local', STORAGE_KEY))
  await page.keyboard.press('2')
  await page.keyboard.press('c')
  t.check('keys after answering do not change the stored answer', JSON.stringify(await getStorage(page, 'local', STORAGE_KEY)) === before)
  // modifier keys are ignored
  await clearStorage(page)
  await gotoQuiz(page, path(n))
  await page.waitForTimeout(150)
  await page.keyboard.press('Control+a')
  await page.keyboard.press('Control+1')
  await page.keyboard.press('Alt+b')
  t.check('Ctrl/Alt + key does not answer (browser shortcuts are not hijacked)', (await page.locator('.quiz-result').count()) === 0)
  await page.keyboard.press('5')
  await page.keyboard.press('x')
  t.check('keys outside A-D / 1-4 are ignored', (await page.locator('.quiz-result').count()) === 0)

  // navigation: forward, back, last button label
  await clearStorage(page)
  await gotoQuiz(page, path(n))
  await answerCurrent(page, 'correct')
  await clickNext(page)
  t.check('second question: 前の問題 appears', (await page.locator('.btn-prev').count()) === 1)
  await page.locator('.btn-prev').click()
  t.check('前の問題 → question 1 (answered state kept)', (await readCardPosition(page)).n === 1 && (await page.locator('.quiz-result').count()) === 1)
  t.check('on an answered question 次の問題 is enabled', !(await page.locator('.btn-next').isDisabled()))
  await clickNext(page)
  for (let i = 1; i < quizzes.length; i++) {
    await answerCurrent(page, 'correct')
    if (i < quizzes.length - 1) await clickNext(page)
  }
  t.check('on the last question the button is 結果を見る', norm(await page.textContent('.btn-next')) === '結果を見る')
  await clickNext(page)
  t.check('結果を見る → finish screen with a perfect score', norm(await page.textContent('.finish-score strong')) === `${quizzes.length} / ${quizzes.length}`)
  t.check('perfect score: no review CTA, no wrong list', (await page.locator('.btn-review-cta').count()) === 0 && (await page.locator('.finish-section-wrong').count()) === 0)
  t.check('no console / page / network errors', !hasErrors(errors), summarizeErrors(errors))
})

// ============================================================================
block('QZ-E. Drill top page (counts, banners, reset)', async ({ t, browser }) => {
  const { page, errors } = await newInstrumentedPage(browser)
  await gotoPage(page, '/quiz/')
  await clearStorage(page)
  await gotoPage(page, '/quiz/')
  const txt = async (sel) => norm(await page.locator(sel).first().textContent())

  const summary = await page.$$eval('.summary-item', (els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim()))
  t.check(`summary starts at 0 / ${ALL.length}`, summary[0].includes(`0 / ${ALL.length}`), summary.join(' | '))
  const cards = await page.$$eval('.chapter-card', (els) => els.map((e) => ({ href: e.getAttribute('href'), text: e.textContent.replace(/\s+/g, ' ').trim() })))
  t.check(`${CHAPTER_IDS.length} chapter cards`, cards.length === CHAPTER_IDS.length, `n=${cards.length}`)
  for (const ch of CHAPTERS) {
    const qs = BY_CHAPTER[ch.id]
    const c = cards.find((x) => x.href === path(ch.id))
    const cnt = (d) => qs.filter((q) => q.difficulty === d).length
    t.check(
      `chapter ${ch.id} card: title, 0 / ${qs.length} 問, 易 ${cnt('easy')} 中 ${cnt('normal')} 難 ${cnt('hard')}`,
      !!c && c.text.includes(ch.title) && c.text.includes(`0 / ${qs.length} 問`) && c.text.includes(`易 ${cnt('easy')}`) && c.text.includes(`中 ${cnt('normal')}`) && c.text.includes(`難 ${cnt('hard')}`),
      c && c.text,
    )
  }
  t.check('no 続きから / review banner before answering', (await page.locator('.continue-banner, .review-banner').count()) === 0)
  t.check('review button is disabled-style when nothing wrong', (await page.locator('.btn-review-disabled').count()) === 1)
  t.check('no reset button before answering', (await page.locator('.btn-reset-progress').count()) === 0)
  const links = await page.$$eval('.quiz-top-actions a', (as) => as.map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim() })))
  const want = [['/quiz/random-5/', '5 問'], ['/quiz/random-10/', '10 問'], [`/quiz/random-${MOCK_SIZE}/`, `${MOCK_SIZE} 問（模擬試験）`], ['/quiz/random/', `全 ${ALL.length} 問`]]
  for (const [href, text] of want) {
    t.check(`random link ${href} labelled "${text}"`, links.some((l) => l.href === href && l.text.includes(text)), JSON.stringify(links))
  }

  // Answer via the real UI: chapter 1, 3 questions (2nd wrong)
  const first = CHAPTER_IDS[0]
  await gotoQuiz(page, path(first))
  await answerCurrent(page, 'correct'); await clickNext(page)
  await answerCurrent(page, 'wrong'); await clickNext(page)
  await answerCurrent(page, 'correct')
  await gotoPage(page, '/quiz/')
  await page.waitForSelector('.continue-banner')
  const summary2 = await page.$$eval('.summary-item', (els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim()))
  t.check(`summary shows 3 / ${ALL.length} answered`, summary2[0].includes(`3 / ${ALL.length}`), summary2.join(' | '))
  t.check('summary shows 2 correct and 67% rate', summary2[1].includes('2') && summary2[2].includes('67%'), summary2.join(' | '))
  const card1 = (await page.$$eval('.chapter-card', (els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim())))[0]
  t.check(`chapter ${first} card: 3 / ${BY_CHAPTER[first].length} 問 and 要復習 1`, card1.includes(`3 / ${BY_CHAPTER[first].length} 問`) && card1.includes('要復習 1'), card1)
  t.check(`続きから banner → chapter ${first} with remaining count`, (await page.getAttribute('.continue-banner', 'href')) === path(first) && (await txt('.continue-banner')).includes(`残り ${BY_CHAPTER[first].length - 3} 問`))
  t.check('review banner → /quiz/review/ with 1 問', (await page.getAttribute('.review-banner', 'href')) === '/quiz/review/' && (await txt('.review-banner')).includes('1 問'))
  t.check('review button now shows 1 件', (await txt('.btn-review')).includes('1 件') && (await page.getAttribute('a.btn-review', 'href')) === '/quiz/review/')

  // reset: dismiss then accept
  page.once('dialog', (d) => d.dismiss())
  await page.locator('.btn-reset-progress').click()
  t.check('reset dialog dismissed → progress kept', (await getStorage(page, 'local', STORAGE_KEY)) && Object.keys(await getStorage(page, 'local', STORAGE_KEY)).length === 3)
  let dialogMsg = ''
  page.once('dialog', (d) => { dialogMsg = d.message(); d.accept() })
  await page.locator('.btn-reset-progress').click()
  await page.waitForTimeout(200)
  t.check('reset dialog asks for confirmation', /削除しますか/.test(dialogMsg), dialogMsg)
  t.check('reset accepted → localStorage cleared', (await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)) === null)
  t.check('reset accepted → summary back to 0', (await page.$$eval('.summary-item', (els) => els[0].textContent.replace(/\s+/g, ' '))).includes(`0 / ${ALL.length}`))
  t.check('reset accepted → sessionStorage drill state cleared', (await page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith('quiz-state-') || k.startsWith('quiz-sample-')).length)) === 0)
  await gotoQuiz(page, path(first))
  t.check('after reset the chapter starts at question 1 (no toast, no finish)', (await readCardPosition(page)).n === 1 && (await page.locator('.quiz-resume-toast').count()) === 0)
  t.check('no console / page / network errors', !hasErrors(errors), summarizeErrors(errors))
})

run()
