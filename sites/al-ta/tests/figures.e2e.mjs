// ============================================================================
// AL-TA E2E — questions with figures (QuizFigure: table / mermaid / pre / image).
//
//   FG-A  desktop: every figure question opens; each figure renders with the content from the
//         data (table caption + headers + cells, mermaid SVG without "Syntax error", pre text);
//         explanation figures appear only after answering
//   FG-B  mobile (375px): same questions, page never scrolls horizontally, figures stay in the
//         viewport or sit in a labelled scroll region; scroll hint matches real overflow
//   FG-C  figure-less questions render no figure; figure counts line up with the data
//
// Questions are reached by seeding sessionStorage `quiz-state-<path>` = { currentIndex } and
// reloading (QuizPage restores the view position from it).
// ============================================================================

import { block, run } from './runner.mjs'
import {
  newInstrumentedPage, summarizeErrors, hasErrors, url, clearStorage, gotoPage,
  currentQuiz, answerCurrent,
} from './helpers.mjs'
import { ALL, FIGURE_QUIZZES, chapterOfLesson, indexInChapter, norm } from './data.mjs'

const MOBILE = { width: 375, height: 800 }

async function openQuestion(page, quiz) {
  const ch = chapterOfLesson(quiz.lesson)
  const idx = indexInChapter(quiz)
  const p = `/quiz/chapter${ch}/`
  await page.goto(url(p), { waitUntil: 'domcontentloaded' })
  await page.evaluate(([k, i]) => {
    localStorage.clear()
    sessionStorage.clear()
    sessionStorage.setItem(k, JSON.stringify({ currentIndex: i, finished: false }))
  }, [`quiz-state-${p}`, idx])
  await page.goto(url(p), { waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-card', { timeout: 15000 })
}

// Wait until every mermaid figure currently in the DOM has an SVG (or the timeout hits).
async function waitMermaid(page, expected) {
  if (expected === 0) return
  await page
    .waitForFunction(
      (n) => document.querySelectorAll('.quiz-figure[data-type="mermaid"] .mermaid-box svg').length >= n,
      expected,
      { timeout: 10000 },
    )
    .catch(() => {})
  await page.waitForTimeout(100)
}

// Describe the figures matched by a selector (question area or explanation area).
async function readFigures(page, figureSelector) {
  return page.$$eval(figureSelector, (figs) =>
    figs.map((f) => {
      const type = f.getAttribute('data-type')
      const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '')
      if (type === 'table') {
        const rowsEl = [...f.querySelectorAll('tbody tr')]
        return {
          type,
          caption: txt(f.querySelector('caption')),
          headers: [...f.querySelectorAll('thead th')].map(txt),
          headerScopes: [...f.querySelectorAll('thead th')].map((h) => h.getAttribute('scope')),
          rows: rowsEl.map((r) => [...r.children].map(txt)),
          rowHeaderTags: rowsEl.map((r) => r.children[0] && r.children[0].tagName + ':' + r.children[0].getAttribute('scope')),
          hasRowHeaderClass: !!f.querySelector('table.has-row-header'),
        }
      }
      if (type === 'mermaid') {
        const svg = f.querySelector('.mermaid-box svg')
        const svgText = svg ? svg.textContent.replace(/\s+/g, ' ').trim() : ''
        return {
          type,
          alt: txt(f.querySelector('.sr-only')),
          hasSvg: !!svg,
          svgRole: svg ? svg.getAttribute('aria-roledescription') : null,
          svgHasError: !!svg && (/Syntax error/i.test(svgText) || svg.getAttribute('aria-roledescription') === 'error' || !!svg.querySelector('.error-icon, .error-text') && /error/i.test(svgText)),
          svgText: svgText.slice(0, 80),
          labelCount: svg ? svg.querySelectorAll('text, foreignObject, .nodeLabel, .edgeLabel').length : 0,
          figcaption: txt(f.querySelector('figcaption')),
        }
      }
      if (type === 'pre') {
        const code = f.querySelector('pre code')
        return { type, text: code ? code.textContent : '', caption: txt(f.querySelector('.pre-caption')) }
      }
      if (type === 'image') {
        const img = f.querySelector('img')
        return { type, alt: img ? img.getAttribute('alt') : null, src: img ? img.getAttribute('src') : null, figcaption: txt(f.querySelector('figcaption')) }
      }
      return { type }
    }),
  )
}

// Compare what the page rendered against one data figure. Returns a list of problems.
function compareFigure(want, got, label) {
  const bad = []
  if (!got) return [`${label}: figure missing`]
  if (got.type !== want.type) return [`${label}: type ${got.type} want ${want.type}`]
  if (want.type === 'table') {
    if (got.caption !== norm(want.caption)) bad.push(`${label}: caption "${got.caption}" want "${norm(want.caption)}"`)
    if (!got.caption) bad.push(`${label}: empty caption`)
    if (JSON.stringify(got.headers) !== JSON.stringify(want.headers.map(norm))) bad.push(`${label}: headers ${JSON.stringify(got.headers)}`)
    if (got.headers.length === 0 || got.headers.some((h) => !h)) bad.push(`${label}: empty header cell`)
    if (got.headerScopes.some((s) => s !== 'col')) bad.push(`${label}: header scope≠col`)
    if (JSON.stringify(got.rows) !== JSON.stringify(want.rows.map((r) => r.map(norm)))) bad.push(`${label}: cells differ`)
    if (want.rowHeader) {
      if (!got.hasRowHeaderClass) bad.push(`${label}: rowHeader table lacks has-row-header`)
      if (got.rowHeaderTags.some((t) => t !== 'TH:row')) bad.push(`${label}: first cells are not th[scope=row]`)
    }
  } else if (want.type === 'mermaid') {
    if (!got.hasSvg) bad.push(`${label}: no SVG rendered`)
    if (got.svgHasError) bad.push(`${label}: mermaid error SVG ("${got.svgText}")`)
    if (got.hasSvg && got.labelCount === 0) bad.push(`${label}: SVG has no labels`)
    if (got.alt !== norm(want.alt) || !got.alt) bad.push(`${label}: sr-only alt "${got.alt}"`)
    if (want.caption && got.figcaption !== norm(want.caption)) bad.push(`${label}: figcaption "${got.figcaption}"`)
  } else if (want.type === 'pre') {
    if (!got.text.trim()) bad.push(`${label}: empty pre`)
    if (got.text.trim() !== want.text.trim()) bad.push(`${label}: pre text differs`)
    if (want.caption && got.caption !== norm(want.caption)) bad.push(`${label}: pre caption "${got.caption}"`)
  } else if (want.type === 'image') {
    if (!got.alt) bad.push(`${label}: image without alt`)
    if (got.src !== want.src) bad.push(`${label}: image src`)
  }
  return bad
}

function mermaidCount(figs) {
  return (figs ?? []).filter((f) => f.type === 'mermaid').length
}

// Ground truth for a figure question, reading both areas.
async function checkQuestion(page, q, t, acc, mode) {
  const label = q.id
  const shown = await currentQuiz(page)
  if (!shown || shown.id !== q.id) { acc.open.push(`${label}: opened ${shown && shown.id}`); return }

  const qFigs = q.figures ?? []
  const eFigs = q.explanationFigures ?? []
  await waitMermaid(page, mermaidCount(qFigs))
  const totalBefore = await page.locator('.quiz-card .quiz-figure').count()
  const gotQ = await readFigures(page, '.quiz-card > .quiz-figure')
  // (question figures are direct children of .quiz-card; explanation figures live in .quiz-explanation-figures)
  const directQ = await page.locator('.quiz-card > .quiz-figure').count()
  if (directQ !== qFigs.length) acc.counts.push(`${label}: question figures ${directQ} want ${qFigs.length}`)
  const explBefore = await page.locator('.quiz-explanation-figures').count()
  if (explBefore !== 0 || totalBefore !== qFigs.length) acc.early.push(`${label}: explanation figures visible before answering (${explBefore}, total=${totalBefore})`)
  qFigs.forEach((f, i) => acc.content.push(...compareFigure(f, gotQ[i], `${label} q-fig${i + 1}`)))
  if (mode) await mode.afterQuestion(page, q, acc)

  // answer (alternate wrong / correct so both paths see the explanation)
  await answerCurrent(page, mermaidCount(qFigs) % 2 === 0 && q.id.charCodeAt(q.id.length - 1) % 2 === 0 ? 'wrong' : 'correct')
  const hasExplFigs = eFigs.length > 0
  await waitMermaid(page, mermaidCount(qFigs) + mermaidCount(eFigs))
  const explAfter = await page.locator('.quiz-explanation-figures').count()
  if (hasExplFigs && explAfter !== 1) acc.late.push(`${label}: explanation figures container missing after answering`)
  if (!hasExplFigs && explAfter !== 0) acc.late.push(`${label}: unexpected explanation figures container`)
  const gotE = hasExplFigs ? await readFigures(page, '.quiz-explanation-figures .quiz-figure') : []
  if (gotE.length !== eFigs.length) acc.counts.push(`${label}: explanation figures ${gotE.length} want ${eFigs.length}`)
  eFigs.forEach((f, i) => acc.content.push(...compareFigure(f, gotE[i], `${label} e-fig${i + 1}`)))
  // question figures survive the answer
  const directAfter = await page.locator('.quiz-card > .quiz-figure').count()
  if (directAfter !== qFigs.length) acc.counts.push(`${label}: question figures after answer ${directAfter}`)
  const gotQ2 = await readFigures(page, '.quiz-card > .quiz-figure')
  qFigs.forEach((f, i) => acc.content.push(...compareFigure(f, gotQ2[i], `${label} q-fig${i + 1} (after answer)`)))
  if (mode) await mode.afterAnswer(page, q, acc)
}

function newAcc() {
  return { open: [], counts: [], early: [], late: [], content: [], overflow: [], contentOverflow: [], hints: [], aria: [] }
}

function reportAcc(t, acc, n) {
  t.check(`${n} figure questions open at the expected card`, acc.open.length === 0, acc.open.slice(0, 3).join(' | '))
  t.check('figure counts match the data (question and explanation)', acc.counts.length === 0, acc.counts.slice(0, 3).join(' | '))
  t.check('explanation figures are hidden before answering', acc.early.length === 0, acc.early.slice(0, 3).join(' | '))
  t.check('explanation figures appear after answering (only where the data has them)', acc.late.length === 0, acc.late.slice(0, 3).join(' | '))
  t.check('table: caption, headers (scope=col), cells and row headers match; mermaid: SVG without error + alt; pre: text', acc.content.length === 0, `${acc.content.length} problems: ${acc.content.slice(0, 3).join(' | ')}`)
}

block('FG-A. Figure questions on desktop (content, mermaid SVG, explanation timing)', async ({ t, browser }) => {
  const { page, errors } = await newInstrumentedPage(browser, { viewport: { width: 1280, height: 900 } })
  const counts = { table: 0, mermaid: 0, pre: 0, image: 0 }
  for (const q of FIGURE_QUIZZES) for (const f of [...(q.figures ?? []), ...(q.explanationFigures ?? [])]) counts[f.type]++
  t.info(`${FIGURE_QUIZZES.length} figure questions; figures: ${JSON.stringify(counts)}`)
  t.check('data has figure questions of every type used (table, mermaid, pre)', counts.table > 0 && counts.mermaid > 0 && counts.pre > 0, JSON.stringify(counts))

  const acc = newAcc()
  for (const q of FIGURE_QUIZZES) {
    await openQuestion(page, q)
    await checkQuestion(page, q, t, acc, null)
  }
  reportAcc(t, acc, FIGURE_QUIZZES.length)

  // no Syntax error text anywhere in the DOM of the last page and no errors collected
  t.check('no console / page / network errors', !hasErrors(errors), summarizeErrors(errors))
  t.check('no mermaid "Syntax error" element left in the document', (await page.locator('text=/Syntax error in text/').count()) === 0)
})

// Mobile-only layout checks plugged into checkQuestion.
const mobileMode = {
  async afterQuestion(page, q, acc) {
    await measure(page, q, acc, 'question')
  },
  async afterAnswer(page, q, acc) {
    await measure(page, q, acc, 'answered')
  },
}

async function measure(page, q, acc, stage) {
  const m = await page.evaluate((VW) => {
    const doc = document.documentElement
    const figs = [...document.querySelectorAll('.quiz-card .quiz-figure')].map((f) => {
      const r = f.getBoundingClientRect()
      const type = f.getAttribute('data-type')
      const scroller = type === 'table' ? f.querySelector('.table-scroll') : type === 'mermaid' ? f.querySelector('.mermaid') : null
      const hint = f.querySelector('.scroll-hint')
      const overflowing = !!scroller && scroller.scrollWidth > scroller.clientWidth + 1
      const pre = f.querySelector('pre')
      return {
        type,
        right: Math.round(r.right),
        left: Math.round(r.left),
        scrollerOverflow: overflowing,
        hint: !!hint,
        tabindex: scroller ? scroller.getAttribute('tabindex') : null,
        role: scroller ? scroller.getAttribute('role') : null,
        ariaLabel: scroller ? scroller.getAttribute('aria-label') : null,
        preWraps: pre ? getComputedStyle(pre).whiteSpace : null,
        preOverflow: pre ? pre.scrollWidth > pre.clientWidth + 1 : false,
      }
    })
    const content = document.querySelector('.VPContent')
    return { scrollWidth: doc.scrollWidth, bodyScrollWidth: document.body.scrollWidth, clientWidth: doc.clientWidth, contentScrollWidth: content ? content.scrollWidth : -1, figs }
  }, 375)
  if (m.scrollWidth > 375) acc.overflow.push(`${q.id} (${stage}): documentElement.scrollWidth=${m.scrollWidth}`)
  if (m.bodyScrollWidth > 375) acc.overflow.push(`${q.id} (${stage}): body.scrollWidth=${m.bodyScrollWidth}`)
  // The same measurement restricted to the page content (nav bar excluded), so a figure that
  // overflows is not masked by anything else that widens the page.
  if (m.contentScrollWidth > 375 || m.contentScrollWidth < 0) acc.contentOverflow.push(`${q.id} (${stage}): .VPContent scrollWidth=${m.contentScrollWidth}`)
  for (const f of m.figs) {
    if (f.right > 376 || f.left < -1) acc.overflow.push(`${q.id} (${stage}): ${f.type} figure box spans ${f.left}..${f.right}`)
    if (f.type === 'table' || f.type === 'mermaid') {
      if (f.scrollerOverflow !== f.hint) acc.hints.push(`${q.id} (${stage}): ${f.type} overflow=${f.scrollerOverflow} but scroll-hint=${f.hint}`)
      if (f.type === 'table' && f.scrollerOverflow && (f.tabindex !== '0' || f.role !== 'region' || !f.ariaLabel)) {
        acc.aria.push(`${q.id} (${stage}): overflowing table scroller lacks tabindex/role/aria-label`)
      }
      if (f.type === 'mermaid' && f.scrollerOverflow && f.tabindex !== '0') acc.aria.push(`${q.id} (${stage}): overflowing mermaid is not keyboard-scrollable`)
    }
    if (f.type === 'pre' && f.preOverflow) acc.overflow.push(`${q.id} (${stage}): pre text overflows its box`)
  }
}

block('FG-B. Figure questions at 375px (no horizontal page scroll, scroll hints, labelled scrollers)', async ({ t, browser }) => {
  const { page, errors } = await newInstrumentedPage(browser, { viewport: MOBILE })
  const acc = newAcc()
  for (const q of FIGURE_QUIZZES) {
    await openQuestion(page, q)
    await checkQuestion(page, q, t, acc, mobileMode)
  }
  reportAcc(t, acc, FIGURE_QUIZZES.length)
  t.check('document never scrolls horizontally at 375px (scrollWidth <= 375), before and after answering', acc.overflow.length === 0, `${acc.overflow.length} problems: ${acc.overflow.slice(0, 4).join(' | ')}`)
  t.check('page content (.VPContent, nav bar excluded) never overflows 375px either', acc.contentOverflow.length === 0, `${acc.contentOverflow.length} problems: ${acc.contentOverflow.slice(0, 4).join(' | ')}`)
  t.check('「横にスクロールできます」hint shows exactly when a table / diagram overflows its box', acc.hints.length === 0, acc.hints.slice(0, 3).join(' | '))
  t.check('overflowing tables are labelled keyboard-scrollable regions', acc.aria.length === 0, acc.aria.slice(0, 3).join(' | '))
  t.check('no console / page / network errors', !hasErrors(errors), summarizeErrors(errors))
})

block('FG-C. Questions without figures render none; figure data is well-formed', async ({ t, browser }) => {
  const { page, errors } = await newInstrumentedPage(browser)
  const plain = ALL.filter((q) => !(q.figures?.length || q.explanationFigures?.length))
  t.info(`${plain.length} questions without figures`)
  // sample a spread: first, middle and last plain question of each chapter file
  const byCh = new Map()
  for (const q of plain) {
    const ch = chapterOfLesson(q.lesson)
    byCh.set(ch, [...(byCh.get(ch) ?? []), q])
  }
  const sample = []
  for (const list of byCh.values()) sample.push(list[0], list[Math.floor(list.length / 2)], list[list.length - 1])
  const bad = []
  for (const q of sample) {
    await openQuestion(page, q)
    const shown = await currentQuiz(page)
    if (!shown || shown.id !== q.id) { bad.push(`${q.id}: opened ${shown && shown.id}`); continue }
    if ((await page.locator('.quiz-card .quiz-figure').count()) !== 0) bad.push(`${q.id}: figure rendered before answering`)
    await answerCurrent(page, 'correct')
    if ((await page.locator('.quiz-card .quiz-figure, .quiz-explanation-figures').count()) !== 0) bad.push(`${q.id}: figure rendered after answering`)
  }
  t.check(`${sample.length} sampled figure-less questions render no figure`, bad.length === 0, bad.join(' | '))

  // Every figure in the data is well formed (what the page assumes).
  const malformed = []
  for (const q of FIGURE_QUIZZES) {
    for (const f of [...(q.figures ?? []), ...(q.explanationFigures ?? [])]) {
      if (f.type === 'table' && (!f.caption || !f.headers?.length || !f.rows?.length || f.rows.some((r) => r.length !== f.headers.length))) malformed.push(`${q.id}: table`)
      if (f.type === 'mermaid' && (!f.code || !f.alt || /<br/i.test(f.code))) malformed.push(`${q.id}: mermaid`)
      if (f.type === 'pre' && !f.text?.trim()) malformed.push(`${q.id}: pre`)
      if (f.type === 'image' && !f.alt) malformed.push(`${q.id}: image`)
    }
  }
  t.check('every figure in the data has caption/headers/rows, alt or text as required', malformed.length === 0, malformed.slice(0, 5).join(' | '))
  // Figure questions also work when seen through the review page (shuffled set): the figure follows the question.
  t.check('no console / page / network errors', !hasErrors(errors), summarizeErrors(errors))
})

run()
