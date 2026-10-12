// ============================================================================
// AL-TA E2E — mock exam (random-45), the other random pages, and the review page.
//
//   MK-A  random-45: 45 questions drawn per MOCK_EXAM_QUOTA (per chapter / per group), no
//         duplicates, many re-draws, shown in drawn order, restored on reload (sessionStorage)
//   MK-B  random-5 / random-10 / random (all): sample sizes, uniqueness, headings
//   MK-C  review page: empty state, wrong-only set, stale ids, flow from a chapter drill
//   MK-D  random pages after earlier drill answers (answers in localStorage must not hijack a
//         fresh draw)
//
// Expectations (45, chapter split, group counts) come from docs/quiz/types.ts via data.mjs.
// ============================================================================

import { block, run } from './runner.mjs'
import {
  newInstrumentedPage, summarizeErrors, hasErrors, url, clearStorage, gotoQuiz, gotoPage,
  currentQuiz, answerCurrent, clickNext, readCardPosition, readProgress, getStorage, setStorage,
} from './helpers.mjs'
import {
  ALL, BY_ID, BY_CHAPTER, CHAPTER_IDS, STORAGE_KEY, MOCK_SIZE, QUOTA, QUOTA_PER_CHAPTER, chapterOfLesson, norm,
} from './data.mjs'

const MOCK_KEY = `quiz-sample-n${MOCK_SIZE}`
const MOCK_PATH = `/quiz/random-${MOCK_SIZE}/`

// Check an id list against the quota. Returns a list of problems (empty = OK).
function quotaProblems(ids) {
  const bad = []
  if (!Array.isArray(ids)) return ['no id list']
  if (ids.length !== MOCK_SIZE) bad.push(`size ${ids.length} want ${MOCK_SIZE}`)
  if (new Set(ids).size !== ids.length) bad.push(`duplicates: ${ids.filter((x, i) => ids.indexOf(x) !== i).join(',')}`)
  const unknown = ids.filter((id) => !BY_ID.has(id))
  if (unknown.length) bad.push(`unknown ids ${unknown.join(',')}`)
  const qs = ids.map((id) => BY_ID.get(id)).filter(Boolean)
  for (const ch of CHAPTER_IDS) {
    const got = qs.filter((q) => chapterOfLesson(q.lesson) === ch).length
    if (got !== QUOTA_PER_CHAPTER[ch]) bad.push(`chapter ${ch}: ${got} want ${QUOTA_PER_CHAPTER[ch]}`)
  }
  for (const g of QUOTA) {
    const got = qs.filter((q) => g.lessons.includes(q.lesson)).length
    if (got !== g.count) bad.push(`group [${g.lessons.join('+')}]: ${got} want ${g.count}`)
  }
  return bad
}

async function readIds(page, key) {
  return getStorage(page, 'session', key)
}

async function walk(page, total, wrongWhen = () => false) {
  const seen = []
  const outcomes = []
  for (let i = 0; i < total; i++) {
    const wrong = wrongWhen(i)
    const { quiz } = await answerCurrent(page, wrong ? 'wrong' : 'correct')
    seen.push(quiz.id)
    outcomes.push(!wrong)
    await clickNext(page)
  }
  return { seen, outcomes }
}

// ============================================================================
block('MK-A. Mock exam (random-45): quota, uniqueness, re-draws, restore on reload', async ({ t, browser }) => {
  // quota table consistency (pure data)
  const quotaSum = QUOTA.reduce((s, g) => s + g.count, 0)
  t.check(`MOCK_EXAM_QUOTA counts add up to MOCK_EXAM_SIZE (${MOCK_SIZE})`, quotaSum === MOCK_SIZE, `sum=${quotaSum}`)
  t.check('every lesson appears in exactly one quota group', (() => {
    const all = QUOTA.flatMap((g) => g.lessons)
    return new Set(all).size === all.length
  })())
  t.check('each quota group stays within one chapter', QUOTA.every((g) => new Set(g.lessons.map(chapterOfLesson)).size === 1))
  const shortGroups = QUOTA.filter((g) => ALL.filter((q) => g.lessons.includes(q.lesson)).length < g.count)
  t.check('every group has at least as many questions as its quota (no shortfall top-up needed)', shortGroups.length === 0, shortGroups.map((g) => g.lessons.join('+')).join(','))
  t.info(`per chapter: ${JSON.stringify(QUOTA_PER_CHAPTER)}, ${QUOTA.length} groups`)

  const { page, context, errors } = await newInstrumentedPage(browser)
  await gotoPage(page, MOCK_PATH)
  await clearStorage(page)

  // page text consistent with the quota
  await gotoQuiz(page, MOCK_PATH)
  const h1 = norm(await page.textContent('h1'))
  t.check('h1 is 模擬試験（45問）', h1 === `模擬試験（${MOCK_SIZE}問）`, h1)
  const body = norm(await page.locator('main').innerText())
  const split = CHAPTER_IDS.map((c) => `${QUOTA_PER_CHAPTER[c]} 問`).join('・')
  t.check(`page describes the split "${split}"`, body.includes(split), body.slice(0, 160))
  t.check(`progress starts at 0 / ${MOCK_SIZE}`, JSON.stringify(await readProgress(page)) === JSON.stringify({ answered: 0, total: MOCK_SIZE }))
  t.check(`first card is 1 / ${MOCK_SIZE}`, JSON.stringify(await readCardPosition(page)) === JSON.stringify({ n: 1, total: MOCK_SIZE }))

  // many draws via sessionStorage reset + reload (no answers, so localStorage stays clean)
  const draws = []
  let firstCardOk = true
  const drawProblems = []
  for (let i = 0; i < 12; i++) {
    await page.evaluate(() => sessionStorage.clear())
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('.quiz-card')
    const ids = await readIds(page, MOCK_KEY)
    const bad = quotaProblems(ids)
    if (bad.length) drawProblems.push(`draw ${i + 1}: ${bad.join('; ')}`)
    draws.push(ids)
    const shown = await currentQuiz(page)
    if (!shown || !ids || shown.id !== ids[0]) firstCardOk = false
  }
  t.check('12 fresh draws: 45 unique questions, chapter split and per-group counts exactly per MOCK_EXAM_QUOTA', drawProblems.length === 0, drawProblems.slice(0, 3).join(' | '))
  t.check('the first card shown is the first drawn question', firstCardOk)
  const distinct = new Set(draws.map((d) => [...d].sort().join(',')))
  t.check(`draws differ from each other (${distinct.size} distinct sets of ${draws.length})`, distinct.size === draws.length, `distinct=${distinct.size}`)
  const orders = new Set(draws.map((d) => d.join(',')))
  t.check('draw order differs too', orders.size === draws.length)
  const covered = new Set(draws.flat())
  t.check(`across draws more than ${MOCK_SIZE} different questions were used (sampling spans the bank)`, covered.size > MOCK_SIZE, `covered=${covered.size}`)

  // restore on reload (same tab): same ids, same order, same first card
  await page.evaluate(() => sessionStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-card')
  const ids0 = await readIds(page, MOCK_KEY)
  const firstShown = (await currentQuiz(page)).id
  for (let i = 0; i < 3; i++) {
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('.quiz-card')
  }
  t.check('reload ×3 keeps the same drawn set and order', JSON.stringify(await readIds(page, MOCK_KEY)) === JSON.stringify(ids0))
  t.check('reload keeps the same first question', (await currentQuiz(page)).id === firstShown && firstShown === ids0[0])

  // answer 3, move to #4, reload → same set, resumes at #4 with 3 answered
  const picked = []
  for (let i = 0; i < 3; i++) {
    picked.push((await answerCurrent(page, i === 1 ? 'wrong' : 'correct')).quiz.id)
    await clickNext(page)
  }
  t.check('answers followed the drawn order', JSON.stringify(picked) === JSON.stringify(ids0.slice(0, 3)), picked.join(','))
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-card')
  t.check('reload mid-way keeps the set', JSON.stringify(await readIds(page, MOCK_KEY)) === JSON.stringify(ids0))
  t.check('reload mid-way resumes at 4 / 45', (await readCardPosition(page)).n === 4 && (await currentQuiz(page)).id === ids0[3])
  t.check('reload mid-way keeps 3 answered', (await readProgress(page)).answered === 3)

  // walk the rest of the exam in order
  const rest = await walk(page, MOCK_SIZE - 3, (i) => i % 5 === 0)
  t.check(`the remaining ${MOCK_SIZE - 3} cards come in drawn order`, JSON.stringify(rest.seen) === JSON.stringify(ids0.slice(3)))
  await page.waitForSelector('.quiz-finish')
  const wrongN = rest.outcomes.filter((o) => !o).length + 1 // + the one answered wrong earlier
  const correctN = MOCK_SIZE - wrongN
  t.check(`finish: ${correctN} / ${MOCK_SIZE}`, norm(await page.textContent('.finish-score strong')) === `${correctN} / ${MOCK_SIZE}`, norm(await page.textContent('.finish-score strong')))
  const chapterLabels = await page.$$eval('.finish-row[data-correct="false"] .finish-row-chapter', (els) => els.map((e) => e.textContent.trim()))
  t.check(`wrong list (${wrongN}) shows chapter labels N章`, chapterLabels.length === wrongN && chapterLabels.every((l) => /^[1-5]章$/.test(l)), chapterLabels.join(','))
  t.check('restart button says 別の 45 問でもう一度', norm(await page.textContent('.finish-actions button.btn-restart')) === `別の ${MOCK_SIZE} 問でもう一度`)
  t.check('review CTA shows the wrong count', norm(await page.textContent('.btn-review-cta')).includes(`${wrongN} 問`))
  t.check('no next-chapter link on a mock exam', (await page.locator('.btn-next-chapter').count()) === 0)

  // restart → new draw, valid quota, fresh state
  await page.locator('.finish-actions button.btn-restart').click()
  await page.waitForSelector('.quiz-card')
  const redrawn = await readIds(page, MOCK_KEY)
  t.check('別の 45 問 → a new valid draw', quotaProblems(redrawn).length === 0, quotaProblems(redrawn).join('; '))
  t.check('別の 45 問 → a different set', JSON.stringify(redrawn) !== JSON.stringify(ids0))
  t.check('別の 45 問 → card 1 / 45, nothing answered, nothing finished', (await readCardPosition(page)).n === 1 && (await readProgress(page)).answered === 0)
  t.check('別の 45 問 → the first card is the first newly drawn question', (await currentQuiz(page)).id === redrawn[0])
  // and survives reload
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-card')
  t.check('the re-drawn set is what a reload restores', JSON.stringify(await readIds(page, MOCK_KEY)) === JSON.stringify(redrawn))

  // re-draw a few more times through the UI (finish → restart) with a fast path: answer all
  for (let r = 0; r < 2; r++) {
    await walk(page, MOCK_SIZE)
    await page.waitForSelector('.quiz-finish')
    await page.locator('.finish-actions button.btn-restart').click()
    await page.waitForSelector('.quiz-card')
    const ids = await readIds(page, MOCK_KEY)
    t.check(`UI re-draw #${r + 2} after a full run: valid quota`, quotaProblems(ids).length === 0, quotaProblems(ids).join('; '))
  }

  // a second tab (empty sessionStorage) draws its own set
  const page2 = await context.newPage()
  page2.on('pageerror', (e) => errors.pageErrors.push(String(e)))
  await page2.goto(url(MOCK_PATH), { waitUntil: 'networkidle' })
  await page2.waitForSelector('.quiz-card, .quiz-finish')
  const ids2 = await readIds(page2, MOCK_KEY)
  t.check('a second tab draws its own valid set', quotaProblems(ids2).length === 0, quotaProblems(ids2).join('; '))
  await page2.close()

  t.check('no console / page / network errors', !hasErrors(errors), summarizeErrors(errors))
})

// ============================================================================
block('MK-B. random-5 / random-10 / random (all questions)', async ({ t, browser }) => {
  const { page, errors } = await newInstrumentedPage(browser)
  for (const n of [5, 10]) {
    const p = `/quiz/random-${n}/`
    await gotoPage(page, p)
    await clearStorage(page)
    await gotoQuiz(page, p)
    t.check(`${p}: progress 0 / ${n}`, JSON.stringify(await readProgress(page)) === JSON.stringify({ answered: 0, total: n }))
    const ids = await readIds(page, `quiz-sample-n${n}`)
    t.check(`${p}: ${n} unique, existing questions`, ids && ids.length === n && new Set(ids).size === n && ids.every((id) => BY_ID.has(id)), JSON.stringify(ids))
    t.check(`${p}: first card is the first drawn id`, (await currentQuiz(page)).id === ids[0])
    t.check(`${p}: h1 mentions ${n}`, norm(await page.textContent('h1')).includes(`${n}`), norm(await page.textContent('h1')))
    const seen = await walk(page, n, (i) => i === 1)
    t.check(`${p}: cards come in drawn order`, JSON.stringify(seen.seen) === JSON.stringify(ids))
    await page.waitForSelector('.quiz-finish')
    t.check(`${p}: finish ${n - 1} / ${n}`, norm(await page.textContent('.finish-score strong')) === `${n - 1} / ${n}`)
    t.check(`${p}: restart label 別の ${n} 問でもう一度`, norm(await page.textContent('.finish-actions button.btn-restart')) === `別の ${n} 問でもう一度`)
    await page.locator('.finish-actions button.btn-restart').click()
    await page.waitForSelector('.quiz-card')
    const ids2 = await readIds(page, `quiz-sample-n${n}`)
    t.check(`${p}: re-draw gives ${n} unique questions`, ids2.length === n && new Set(ids2).size === n)
    // several draws: sets vary
    const sets = new Set()
    for (let i = 0; i < 6; i++) {
      await page.evaluate(() => sessionStorage.clear())
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForSelector('.quiz-card')
      const x = await readIds(page, `quiz-sample-n${n}`)
      if (!(x.length === n && new Set(x).size === n)) sets.add('BAD')
      sets.add(x.join(','))
    }
    t.check(`${p}: 6 re-draws are all valid and differ`, !sets.has('BAD') && sets.size === 6, `sets=${sets.size}`)
  }

  // random (all)
  const p = '/quiz/random/'
  await gotoPage(page, p)
  await clearStorage(page)
  await gotoQuiz(page, p)
  const total = ALL.length
  t.check(`${p}: progress 0 / ${total}`, JSON.stringify(await readProgress(page)) === JSON.stringify({ answered: 0, total }))
  const body = norm(await page.locator('main').innerText())
  t.check(`${p}: text says 全 ${total} 問`, body.includes(`全 ${total} 問`), body.slice(0, 80))
  const key = `quiz-sample-shuffle-all-${total}`
  const ids = await readIds(page, key)
  t.check(`${p}: a permutation of all ${total} questions`, ids && ids.length === total && new Set(ids).size === total && ids.every((id) => BY_ID.has(id)))
  t.check(`${p}: not in data order`, JSON.stringify(ids) !== JSON.stringify(ALL.map((q) => q.id)))
  t.check(`${p}: first card is the first shuffled id`, (await currentQuiz(page)).id === ids[0])
  await answerCurrent(page, 'correct')
  await clickNext(page)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-card')
  t.check(`${p}: reload keeps the shuffled order and position 2`, JSON.stringify(await readIds(page, key)) === JSON.stringify(ids) && (await readCardPosition(page)).n === 2 && (await currentQuiz(page)).id === ids[1])
  t.check('no console / page / network errors', !hasErrors(errors), summarizeErrors(errors))
})

// ============================================================================
block('MK-C. Review page (empty state, wrong-only set, stale ids, flow from a drill)', async ({ t, browser }) => {
  const { page, context, errors } = await newInstrumentedPage(browser)
  await gotoPage(page, '/quiz/review/')
  await clearStorage(page)

  // empty: nothing answered
  await gotoPage(page, '/quiz/review/')
  await page.waitForSelector('.review-empty, .quiz-card', { timeout: 10000 })
  t.check('nothing answered → 復習する問題はありません', (await page.locator('.review-empty-title').count()) === 1 && norm(await page.textContent('.review-empty-title')) === '復習する問題はありません')
  t.check('empty state links to the drill list', (await page.locator('.review-empty a[href="/quiz/"]').count()) === 1)
  t.check('empty state shows no quiz card', (await page.locator('.quiz-card').count()) === 0)
  t.check('h1 is 間違えた問題を復習', norm(await page.textContent('h1')) === '間違えた問題を復習')

  // only correct answers → still empty
  const ch1 = BY_CHAPTER[CHAPTER_IDS[0]]
  await setStorage(page, { local: { [STORAGE_KEY]: Object.fromEntries(ch1.slice(0, 4).map((q) => [q.id, { correct: true, ts: 1, selectedIndex: q.answer }])) } })
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.review-empty, .quiz-card')
  t.check('only correct answers stored → 復習する問題はありません', (await page.locator('.review-empty').count()) === 1)

  // seeded: 4 wrong (across 2 chapters) + 2 correct + 1 stale id
  const w = [ch1[0], ch1[3], BY_CHAPTER[CHAPTER_IDS[2]][1], BY_CHAPTER[CHAPTER_IDS[4]][0]]
  const c = [ch1[1], BY_CHAPTER[CHAPTER_IDS[2]][0]]
  const wrongSel = (q) => (q.answer === 0 ? 1 : 0)
  const seed = {}
  for (const q of w) seed[q.id] = { correct: false, ts: 1, selectedIndex: wrongSel(q) }
  for (const q of c) seed[q.id] = { correct: true, ts: 1, selectedIndex: q.answer }
  seed.q9999 = { correct: false, ts: 1, selectedIndex: 0 }
  await setStorage(page, { local: { [STORAGE_KEY]: seed } })
  await page.evaluate(() => sessionStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-card')
  t.check(`review shows ${w.length} questions (stale id ignored)`, JSON.stringify(await readProgress(page)) === JSON.stringify({ answered: 0, total: w.length }), JSON.stringify(await readProgress(page)))
  const shownIds = []
  for (let i = 0; i < w.length; i++) {
    const cur = await currentQuiz(page)
    shownIds.push(cur.id)
    const pos = await readCardPosition(page)
    if (pos.total !== w.length) shownIds.push('BADTOTAL')
    await answerCurrent(page, i === 0 ? 'correct' : 'wrong')
    await clickNext(page)
  }
  t.check('review walks exactly the wrong questions (any order), none of the correct ones', JSON.stringify([...shownIds].sort()) === JSON.stringify(w.map((q) => q.id).sort()), shownIds.join(','))
  await page.waitForSelector('.quiz-finish')
  t.check(`finish: 1 / ${w.length}`, norm(await page.textContent('.finish-score strong')) === `1 / ${w.length}`)
  t.check('review finish hides the 復習 CTA (we are already reviewing)', (await page.locator('.btn-review-cta').count()) === 0)
  t.check('review finish offers 順番をシャッフルしてもう一度', norm(await page.textContent('.finish-actions button.btn-restart')) === '順番をシャッフルしてもう一度')
  // the correctly answered one leaves the review set
  const stored = await getStorage(page, 'local', STORAGE_KEY)
  const firstShown = shownIds[0]
  t.check('answering correctly in review updates the stored record', stored[firstShown].correct === true)
  await page.evaluate(() => sessionStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-card, .review-empty')
  t.check(`next visit: ${w.length - 1} questions remain to review`, (await readProgress(page))?.total === w.length - 1, JSON.stringify(await readProgress(page)))
  const left = []
  for (let i = 0; i < w.length - 1; i++) {
    left.push((await currentQuiz(page)).id)
    await answerCurrent(page, 'correct')
    await clickNext(page)
  }
  t.check('…and they are exactly the ones still wrong', JSON.stringify([...left].sort()) === JSON.stringify(w.map((q) => q.id).filter((id) => id !== firstShown).sort()))
  await page.evaluate(() => sessionStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-card, .review-empty')
  t.check('after answering everything correctly the review is empty again', (await page.locator('.review-empty').count()) === 1)

  // real flow: a wrong answer in a chapter drill shows up in review
  await page.goto(url('/quiz/chapter2/'), { waitUntil: 'networkidle' })
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await gotoQuiz(page, '/quiz/chapter2/')
  const a = await answerCurrent(page, 'wrong')
  await clickNext(page)
  const b = await answerCurrent(page, 'correct')
  await gotoPage(page, '/quiz/top-dummy-skip').catch(() => {})
  await gotoPage(page, '/quiz/review/')
  await page.waitForSelector('.quiz-card, .review-empty')
  t.check('wrong answer from chapter drill appears in review (1 question)', JSON.stringify(await readProgress(page)) === JSON.stringify({ answered: 0, total: 1 }), JSON.stringify(await readProgress(page)))
  t.check('…and it is that question, not the correct one', (await currentQuiz(page)).id === a.quiz.id && a.quiz.id !== b.quiz.id)
  t.check('review card has a link back to its lesson', (await page.locator('.quiz-card').count()) === 1)
  await answerCurrent(page, 'wrong')
  const href = await page.getAttribute('.quiz-lesson-link a', 'href')
  t.check('review explanation links to the lesson', href === `/lessons/${a.quiz.lesson}/`, href)
  t.check('no console / page / network errors', !hasErrors(errors), summarizeErrors(errors))
})

// ============================================================================
block('MK-D. Earlier drill answers must not hijack a fresh random draw', async ({ t, browser }) => {
  const { page, errors } = await newInstrumentedPage(browser)
  await gotoPage(page, '/quiz/')
  await clearStorage(page)

  // Everything answered correctly in earlier drills.
  const all = Object.fromEntries(ALL.map((q) => [q.id, { correct: true, ts: 1, selectedIndex: q.answer }]))
  await setStorage(page, { local: { [STORAGE_KEY]: all } })
  for (const [path, n] of [['/quiz/random-5/', 5], ['/quiz/random-10/', 10], [MOCK_PATH, MOCK_SIZE]]) {
    await page.evaluate(() => sessionStorage.clear())
    await page.goto(url(path), { waitUntil: 'networkidle' })
    await page.waitForSelector('.quiz-card, .quiz-finish')
    const fresh = (await page.locator('.quiz-card').count()) === 1 && (await page.locator('.quiz-finish').count()) === 0
    t.check(`${path} after all ${ALL.length} questions were answered elsewhere: a fresh draw starts at 1 / ${n}`, fresh && (await readCardPosition(page))?.n === 1 && (await readProgress(page))?.answered === 0,
      `finish=${await page.locator('.quiz-finish').count()} progress=${JSON.stringify(await readProgress(page).catch(() => null))}`)
  }

  // Partly answered (first half of the bank): still a fresh draw, no 前回の続き toast.
  const half = Object.fromEntries(ALL.slice(0, Math.floor(ALL.length / 2)).map((q) => [q.id, { correct: true, ts: 1, selectedIndex: q.answer }]))
  await setStorage(page, { local: { [STORAGE_KEY]: half } })
  for (const path of ['/quiz/random-10/', MOCK_PATH]) {
    await page.evaluate(() => sessionStorage.clear())
    await page.goto(url(path), { waitUntil: 'networkidle' })
    await page.waitForSelector('.quiz-card, .quiz-finish')
    t.check(`${path} with half the bank answered elsewhere: no 前回の続き toast, starts at card 1`, (await page.locator('.quiz-resume-toast').count()) === 0 && (await readCardPosition(page))?.n === 1,
      `toast=${await page.locator('.quiz-resume-toast').count()} pos=${JSON.stringify(await readCardPosition(page).catch(() => null))}`)
  }

  // Random (all) and review use the shuffle path.
  await setStorage(page, { local: { [STORAGE_KEY]: all } })
  await page.evaluate(() => sessionStorage.clear())
  await page.goto(url('/quiz/random/'), { waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-card, .quiz-finish')
  t.check('/quiz/random/ after everything was answered elsewhere: starts at card 1 with 0 answered', (await page.locator('.quiz-card').count()) === 1 && (await readProgress(page))?.answered === 0)
  t.check('no console / page / network errors', !hasErrors(errors), summarizeErrors(errors))
})

run()
