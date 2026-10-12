// ============================================================================
// AL-TA E2E — dark mode, contrast, appearance toggle, accessibility sampling, mobile.
//
//   UX-A  dark mode: key pages render dark (html.dark, dark background, light text), footer
//         attribution stays legible, drill states and figure questions work, no errors
//   UX-B  contrast (>= 4.5:1, WCAG AA) of drill states and buttons, one block per scheme
//   UX-C  appearance switch toggles html.dark and the choice survives a reload
//   UX-D  accessibility sampling: image alt (nav logo decorative), button / link names,
//         lang / title / single h1, figure captions and alt, quiz landmarks and roles
//   UX-E  mobile 375px: page width on key pages, tap targets of the drill controls
// ============================================================================

import { block, run } from './runner.mjs'
import {
  newInstrumentedPage, summarizeErrors, hasErrors, url, clearStorage, gotoQuiz, gotoPage,
  answerCurrent, clickNext, contrastOf, FOOTER_SELECTOR, readChoices, getStorage,
} from './helpers.mjs'
import {
  ALL, BY_CHAPTER, CHAPTER_IDS, FIGURE_QUIZZES, LESSONS, STORAGE_KEY, chapterOfLesson, indexInChapter, norm,
} from './data.mjs'

const smallest = CHAPTER_IDS.reduce((a, b) => (BY_CHAPTER[a].length <= BY_CHAPTER[b].length ? a : b))
const DRILL = `/quiz/chapter${smallest}/`

const MAIN_PAGES = [
  '/', '/about/', '/glossary/', '/quiz/', ...CHAPTER_IDS.map((n) => `/quiz/chapter${n}/`),
  '/quiz/random-45/', '/quiz/review/', '/lessons/lesson01/', '/lessons/lesson10/', '/lessons/lesson16/',
]

function lum({ r, g, b }) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

async function pageTone(page) {
  const c = await contrastOf(page, 'body')
  return { dark: await page.evaluate(() => document.documentElement.classList.contains('dark')), bgLum: lum(c.bg), fgLum: lum(c.fg), ratio: c.ratio }
}

async function openFigureQuestion(page, quiz) {
  const ch = chapterOfLesson(quiz.lesson)
  const p = `/quiz/chapter${ch}/`
  await page.goto(url(p), { waitUntil: 'domcontentloaded' })
  await page.evaluate(([k, i]) => {
    localStorage.clear(); sessionStorage.clear()
    sessionStorage.setItem(k, JSON.stringify({ currentIndex: i, finished: false }))
  }, [`quiz-state-${p}`, indexInChapter(quiz)])
  await page.goto(url(p), { waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-card')
}

// ============================================================================
block('UX-A. Dark mode renders on key pages, drill states and figure questions', async ({ t, browser }) => {
  const { page, errors } = await newInstrumentedPage(browser, { colorScheme: 'dark' })
  t.check('prefers-color-scheme: dark is emulated', await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches))
  for (const p of MAIN_PAGES) {
    const before = { pe: errors.pageErrors.length, ce: errors.consoleErrors.length, br: errors.badResponses.length }
    const resp = await gotoPage(page, p)
    await page.waitForTimeout(250)
    const tone = await pageTone(page)
    t.check(`${p} (dark): 200, html.dark, dark background (L=${tone.bgLum.toFixed(3)}), light text (L=${tone.fgLum.toFixed(2)})`,
      resp.status() === 200 && tone.dark && tone.bgLum < 0.1 && tone.fgLum > 0.4, JSON.stringify(tone))
    t.check(`${p} (dark): no console / page / network errors`,
      errors.pageErrors.length === before.pe && errors.consoleErrors.length === before.ce && errors.badResponses.length === before.br,
      summarizeErrors({ pageErrors: errors.pageErrors.slice(before.pe), consoleErrors: errors.consoleErrors.slice(before.ce), badResponses: errors.badResponses.slice(before.br), failedRequests: [] }))
    const f = await contrastOf(page, `${FOOTER_SELECTOR} .message`)
    t.check(`${p} (dark): footer attribution is legible (contrast ${f ? f.ratio.toFixed(1) : 'n/a'} >= 4.5)`, !!f && f.ratio >= 4.5, JSON.stringify(f))
  }

  // lesson diagrams in dark mode
  await gotoPage(page, '/lessons/lesson01/')
  await page.waitForSelector('.mermaid svg', { timeout: 10000 })
  const diag = await page.$$eval('.mermaid svg', (svgs) => svgs.map((s) => /Syntax error/i.test(s.textContent) || s.getAttribute('aria-roledescription') === 'error'))
  t.check('lesson01 diagram renders in dark mode without a mermaid error', diag.length > 0 && diag.every((x) => !x))

  // drill states in dark
  await clearStorage(page)
  await gotoQuiz(page, DRILL)
  const wrong = await answerCurrent(page, 'wrong')
  const cls = await page.$$eval('.quiz-choices button', (bs) => bs.map((b) => b.className))
  t.check('dark: wrong answer shows red + green choices and 不正解', cls.some((c) => /\bwrong\b/.test(c)) && cls.some((c) => /\bcorrect\b/.test(c)) && (await page.getAttribute('.result-badge', 'data-correct')) === 'false')
  t.check('dark: the drill card is still on a dark surface', (await pageTone(page)).bgLum < 0.1)
  await clickNext(page)
  await answerCurrent(page, 'correct')
  t.check('dark: correct answer → 正解', (await page.getAttribute('.result-badge', 'data-correct')) === 'true')

  // figure questions in dark: one each with mermaid, table, pre
  const pick = (type) => FIGURE_QUIZZES.find((q) => [...(q.figures ?? []), ...(q.explanationFigures ?? [])].some((f) => f.type === type))
  for (const type of ['mermaid', 'table', 'pre']) {
    const q = pick(type)
    await openFigureQuestion(page, q)
    await answerCurrent(page, 'correct')
    if (type === 'mermaid') {
      await page.waitForSelector('.quiz-figure[data-type="mermaid"] svg', { timeout: 10000 })
      const bad = await page.$$eval('.quiz-figure[data-type="mermaid"] svg', (s) => s.filter((x) => /Syntax error/i.test(x.textContent)).length)
      t.check(`dark: ${q.id} mermaid figure renders`, bad === 0)
    }
    const fig = await contrastOf(page, `.quiz-figure[data-type="${type}"] ${type === 'table' ? 'td, th' : type === 'pre' ? 'pre code' : 'figcaption, .mermaid'}`)
    t.check(`dark: ${q.id} ${type} figure sits on a dark surface`, (await pageTone(page)).bgLum < 0.1 && (type === 'mermaid' || !fig || fig.ratio >= 4.5), JSON.stringify(fig))
  }

  // finish screen in dark
  await clearStorage(page)
  await gotoQuiz(page, DRILL)
  for (let i = 0; i < BY_CHAPTER[smallest].length; i++) {
    await answerCurrent(page, i % 2 ? 'wrong' : 'correct')
    await clickNext(page)
  }
  await page.waitForSelector('.quiz-finish')
  t.check('dark: finish screen renders', (await page.locator('.quiz-finish').count()) === 1 && (await pageTone(page)).bgLum < 0.1)

  // review page with a wrong item
  await gotoPage(page, '/quiz/review/')
  await page.waitForSelector('.quiz-card')
  t.check('dark: review page shows the wrong questions', (await page.locator('.quiz-card').count()) === 1)
  t.check('no console / page / network errors in the whole dark run', !hasErrors(errors), summarizeErrors(errors))
})

// ============================================================================
async function contrastStates(page, scheme, t, errors) {
  const rows = []
  const add = async (label, sel, min = 4.5) => {
    await page.waitForTimeout(350) // buttons and choices transition their colours (0.15s)
    const c = await contrastOf(page, sel)
    rows.push({ label, ratio: c ? c.ratio : null, ok: !!c && c.ratio >= min, sel })
  }
  await clearStorage(page)
  await gotoQuiz(page, DRILL)
  await add('question text', '.quiz-question')
  await add('choice text', '.quiz-choices button')
  await add('difficulty chip', '.quiz-difficulty')
  await answerCurrent(page, 'wrong')
  await add('correct choice', '.choice.correct')
  await add('wrong choice', '.choice.wrong')
  await add('正解 check badge', '.choice-check')
  await add('result badge (不正解)', '.result-badge')
  await add('explanation', '.quiz-explanation')
  await add('lesson link', '.quiz-lesson-link a')
  await add('次の問題 button', '.btn-next')
  await add('もう一度解く button', '.btn-reset')
  await clickNext(page)
  await answerCurrent(page, 'correct')
  await add('result badge (正解)', '.result-badge')
  for (let i = 2; i < BY_CHAPTER[smallest].length; i++) {
    await clickNext(page)
    await answerCurrent(page, i % 3 === 0 ? 'wrong' : 'correct')
  }
  await clickNext(page)
  await page.waitForSelector('.quiz-finish')
  await add('finish score', '.finish-score')
  await add('finish wrong heading', '.finish-section-wrong')
  await add('finish correct heading', '.finish-section-correct')
  await add('finish wrong row answer', '.finish-row-answer')
  await add('復習 CTA button', '.btn-review-cta')
  await add('もう一度 button', '.finish-actions button.btn-restart')
  await add('ドリル一覧へ link', '.btn-list')
  await gotoPage(page, '/quiz/')
  await add('top page chapter title', '.chapter-title')
  await add('top page summary value', '.summary-value')
  await add('top page review banner', '.review-banner-text')
  // informational: low-emphasis text
  await gotoQuiz(page, `/quiz/chapter${CHAPTER_IDS[0]}/`)
  const infoSel = ['.quiz-progress-text', '.quiz-keyboard-hint']
  const info = []
  for (const s of infoSel) {
    const c = await contrastOf(page, s)
    if (c) info.push(`${s}=${c.ratio.toFixed(2)}`)
  }
  t.info(`${scheme}: low-emphasis text contrast ${info.join(', ')}`)
  const bad = rows.filter((r) => !r.ok)
  t.check(`${scheme}: ${rows.length} drill/top elements meet 4.5:1 contrast`, bad.length === 0, bad.map((r) => `${r.label}=${r.ratio && r.ratio.toFixed(2)}`).join(', '))
}

for (const scheme of ['light', 'dark']) {
  block(`UX-B-${scheme}. Contrast of drill states and buttons (${scheme})`, async ({ t, browser }) => {
    const { page, errors } = await newInstrumentedPage(browser, { colorScheme: scheme })
    await gotoPage(page, DRILL)
    const dark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    t.check(`${scheme}: scheme applied (html.dark === ${scheme === 'dark'})`, dark === (scheme === 'dark'))
    await contrastStates(page, scheme, t, errors)
    t.check(`${scheme}: no console / page / network errors`, !hasErrors(errors), summarizeErrors(errors))
  })
}

// ============================================================================
block('UX-C. Appearance switch toggles dark mode and remembers it', async ({ t, browser }) => {
  const { page, errors } = await newInstrumentedPage(browser, { colorScheme: 'light', viewport: { width: 1280, height: 900 } })
  await gotoPage(page, '/')
  const isDark = () => page.evaluate(() => document.documentElement.classList.contains('dark'))
  t.check('starts light (OS = light)', !(await isDark()))
  const sw = page.locator('.VPSwitchAppearance').first()
  t.check('appearance switch exists in the nav', (await sw.count()) === 1)
  t.check('appearance switch has an accessible role/name', !!(await sw.getAttribute('role')) || !!(await sw.getAttribute('aria-label')) || !!(await sw.getAttribute('title')), '')
  await sw.click()
  t.check('click → html.dark', await isDark())
  t.check('stored in localStorage (vitepress-theme-appearance=dark)', (await page.evaluate(() => localStorage.getItem('vitepress-theme-appearance'))) === 'dark')
  await page.reload({ waitUntil: 'networkidle' })
  t.check('reload keeps dark', await isDark())
  await gotoPage(page, DRILL)
  t.check('another page keeps dark', await isDark())
  await page.locator('.VPSwitchAppearance').first().click()
  t.check('click again → light', !(await isDark()))
  await page.reload({ waitUntil: 'networkidle' })
  t.check('reload keeps light', !(await isDark()))
  t.check('no console / page / network errors', !hasErrors(errors), summarizeErrors(errors))
})

// ============================================================================
block('UX-D. Accessibility sampling (alt, names, landmarks, figure captions)', async ({ t, browser }) => {
  const { page, errors } = await newInstrumentedPage(browser)
  const pages = [
    '/', '/about/', '/glossary/', '/quiz/', ...CHAPTER_IDS.map((n) => `/quiz/chapter${n}/`),
    '/quiz/random-5/', '/quiz/random-10/', '/quiz/random-45/', '/quiz/random/', '/quiz/review/',
    ...LESSONS.map((l) => `/lessons/${l}/`),
  ]
  const problems = { imgNoAlt: [], imgEmptyAlt: [], logo: [], buttonName: [], linkName: [], lang: [], title: [], h1: [], main: [], headingJump: [], dupId: [] }
  let imgCount = 0
  let mermaidInLessons = 0
  let mermaidUnnamed = 0
  for (const p of pages) {
    await gotoPage(page, p)
    await page.waitForTimeout(150)
    const r = await page.evaluate(() => {
      const name = (el) => (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') && el.getAttribute('aria-labelledby') || el.innerText || el.textContent || el.getAttribute('title') || '').trim()
      const imgs = [...document.querySelectorAll('img')].map((i) => ({ alt: i.getAttribute('alt'), src: i.getAttribute('src'), inNav: !!i.closest('.VPNav, .VPNavBar, .VPNavBarTitle') }))
      const buttons = [...document.querySelectorAll('button, [role="button"]')].filter((b) => b.offsetParent !== null || getComputedStyle(b).position === 'fixed').map((b) => ({ n: name(b), cls: b.className.toString().slice(0, 40) }))
      const links = [...document.querySelectorAll('a[href]')].map((a) => ({ n: (name(a) || (a.querySelector('img') && a.querySelector('img').getAttribute('alt')) || '').trim(), href: a.getAttribute('href') }))
      const heads = [...document.querySelectorAll('main h1, main h2, main h3, main h4, .vp-doc h1, .vp-doc h2, .vp-doc h3, .vp-doc h4')].map((h) => Number(h.tagName[1]))
      const ids = [...document.querySelectorAll('[id]')].map((e) => e.id)
      const dup = ids.filter((x, i) => ids.indexOf(x) !== i && !/^mermaid-|^quiz-mermaid-|^d/.test(x))
      const mm = [...document.querySelectorAll('.vp-doc .mermaid svg')].map((s) => !!(s.getAttribute('aria-label') || s.getAttribute('aria-labelledby') || s.querySelector('title')))
      return {
        imgs, buttons, links, heads, dup, mm,
        lang: document.documentElement.lang, title: document.title.trim(),
        h1: document.querySelectorAll('h1').length, main: document.querySelectorAll('main, [role="main"]').length,
      }
    })
    imgCount += r.imgs.length
    for (const i of r.imgs) {
      if (i.alt === null) problems.imgNoAlt.push(`${p}: ${i.src}`)
      else if (i.alt === '' && !i.inNav) problems.imgEmptyAlt.push(`${p}: ${i.src}`)
      else if (i.inNav && i.alt !== '') problems.logo.push(`${p}: nav logo alt="${i.alt}"`)
    }
    for (const b of r.buttons) if (!b.n) problems.buttonName.push(`${p}: button.${b.cls}`)
    for (const l of r.links) if (!l.n) problems.linkName.push(`${p}: ${l.href}`)
    if (r.lang !== 'ja') problems.lang.push(`${p}: lang="${r.lang}"`)
    if (!r.title) problems.title.push(p)
    if (r.h1 !== 1) problems.h1.push(`${p}: ${r.h1} h1`)
    if (r.main < 1) problems.main.push(p)
    for (let k = 1; k < r.heads.length; k++) if (r.heads[k] - r.heads[k - 1] > 1) { problems.headingJump.push(`${p}: h${r.heads[k - 1]} → h${r.heads[k]}`); break }
    if (r.dup.length) problems.dupId.push(`${p}: ${r.dup.slice(0, 3).join(',')}`)
    if (p.startsWith('/lessons/')) { mermaidInLessons += r.mm.length; mermaidUnnamed += r.mm.filter((x) => !x).length }
  }
  t.info(`${pages.length} pages, ${imgCount} <img> elements; lesson mermaid diagrams: ${mermaidInLessons} (${mermaidUnnamed} without aria-label/title; the surrounding text carries the meaning)`)
  const top = (a) => a.slice(0, 4).join(' | ')
  t.check('every <img> has an alt attribute', problems.imgNoAlt.length === 0, top(problems.imgNoAlt))
  t.check('content images have non-empty alt', problems.imgEmptyAlt.length === 0, top(problems.imgEmptyAlt))
  t.check('the nav logo is decorative (alt="")', problems.logo.length === 0, top(problems.logo))
  t.check('every visible button has text or an aria-label', problems.buttonName.length === 0, top(problems.buttonName))
  t.check('every link has a name', problems.linkName.length === 0, top(problems.linkName))
  t.check('<html lang="ja"> on every page', problems.lang.length === 0, top(problems.lang))
  t.check('every page has a <title>', problems.title.length === 0, top(problems.title))
  t.check('exactly one h1 per page', problems.h1.length === 0, top(problems.h1))
  t.check('a <main> landmark on every page', problems.main.length === 0, top(problems.main))
  t.check('headings never skip a level inside the content', problems.headingJump.length === 0, top(problems.headingJump))
  t.check('no duplicate element ids', problems.dupId.length === 0, top(problems.dupId))

  // quiz landmarks and roles
  await clearStorage(page)
  await gotoQuiz(page, DRILL)
  t.check('choice list is an <ol> labelled 選択肢', (await page.getAttribute('ol.quiz-choices', 'aria-label')) === '選択肢')
  t.check('choice letters are aria-hidden (the text is the name)', (await page.$$eval('.choice-label', (e) => e.every((x) => x.getAttribute('aria-hidden') === 'true'))))
  t.check('progress bar exposes role=progressbar with valuenow/valuemax', (await page.getAttribute('[role="progressbar"]', 'aria-valuenow')) === '0' && !!(await page.getAttribute('[role="progressbar"]', 'aria-valuemax')))
  await answerCurrent(page, 'wrong')
  t.check('result is announced (role=status, aria-live=polite)', (await page.getAttribute('.quiz-result', 'role')) === 'status' && (await page.getAttribute('.quiz-result', 'aria-live')) === 'polite')
  t.check('correct choice is not signalled by colour alone (正解 text badge)', (await page.locator('.choice-check').textContent()).trim() === '正解')
  t.check('the wrong answer is named in text (不正解)', norm(await page.textContent('.result-badge')).startsWith('不正解'))
  // keyboard operation: focus a choice and press Enter
  await page.locator('.btn-reset').click()
  await page.locator('.quiz-choices button').nth(0).focus()
  await page.keyboard.press('Enter')
  t.check('a focused choice can be answered with Enter', (await page.locator('.quiz-result').count()) === 1)
  t.check('次の問題 button is reachable by keyboard (a real <button>)', (await page.locator('button.btn-next').count()) === 1)

  // figures: caption / alt
  const figProblems = []
  for (const q of FIGURE_QUIZZES.slice(0, 12)) {
    await openFigureQuestion(page, q)
    const f = await page.$$eval('.quiz-card .quiz-figure', (figs) => figs.map((x) => ({
      type: x.getAttribute('data-type'),
      caption: !!(x.querySelector('caption') && x.querySelector('caption').textContent.trim()),
      alt: !!(x.querySelector('.sr-only') && x.querySelector('.sr-only').textContent.trim()),
      pre: !!(x.querySelector('pre code') && x.querySelector('pre code').textContent.trim()),
    })))
    for (const g of f) {
      if (g.type === 'table' && !g.caption) figProblems.push(`${q.id}: table without caption`)
      if (g.type === 'mermaid' && !g.alt) figProblems.push(`${q.id}: mermaid without sr-only alt`)
      if (g.type === 'pre' && !g.pre) figProblems.push(`${q.id}: empty pre`)
    }
  }
  t.check('figure questions: table caption / mermaid alt / pre text present (sampled)', figProblems.length === 0, figProblems.slice(0, 3).join(' | '))
  t.check('no console / page / network errors', !hasErrors(errors), summarizeErrors(errors))
})

// ============================================================================
block('UX-E. Mobile 375px: page width on key pages, tap targets', async ({ t, browser }) => {
  const { page, errors } = await newInstrumentedPage(browser, { viewport: { width: 375, height: 800 } })
  const pages = [...MAIN_PAGES, '/quiz/random-5/', '/quiz/random-10/', '/quiz/random/', ...LESSONS.map((l) => `/lessons/${l}/`)]
  const uniq = [...new Set(pages)]
  const strict = []
  const content = []
  for (const p of uniq) {
    await gotoPage(page, p)
    await page.waitForTimeout(200)
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      content: (document.querySelector('.VPContent') || {}).scrollWidth ?? -1,
      nav: (() => { const n = document.querySelector('.VPNavBar .content'); return n ? Math.round(n.getBoundingClientRect().right) : -1 })(),
    }))
    if (m.sw > 375) strict.push(`${p}: scrollWidth=${m.sw} (nav bar content right edge=${m.nav})`)
    if (m.content > 375 || m.content < 0) content.push(`${p}: .VPContent scrollWidth=${m.content}`)
  }
  t.info(`${uniq.length} pages measured at 375px`)
  t.check('page never scrolls horizontally at 375px (documentElement.scrollWidth <= 375)', strict.length === 0, `${strict.length}/${uniq.length} pages, e.g. ${strict.slice(0, 3).join(' | ')}`)
  t.check('page content (.VPContent, nav bar excluded) fits 375px on every page', content.length === 0, `${content.length} pages, e.g. ${content.slice(0, 3).join(' | ')}`)

  // tap targets in the drill
  await clearStorage(page)
  await gotoQuiz(page, DRILL)
  const small = []
  const size = async (sel, label, min = 44) => {
    const boxes = await page.$$eval(sel, (els) => els.map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)] }))
    boxes.forEach(([w, h], i) => { if (h < min) small.push(`${label}#${i + 1}: ${w}x${h}`) })
  }
  await size('.quiz-choices button', 'choice')
  await answerCurrent(page, 'wrong')
  await size('.btn-next', '次の問題')
  await size('.btn-reset', 'もう一度解く')
  t.check('choices, 次の問題 and もう一度解く are at least 44px tall', small.length === 0, small.join(', '))
  t.check('mobile: the keyboard hint is hidden on a touch-width screen', !(await page.locator('.quiz-keyboard-hint').isVisible()))
  const navFixed = await page.evaluate(() => { const n = document.querySelector('.quiz-nav'); return n ? getComputedStyle(n).position : null })
  t.check('mobile: the 前へ/次へ bar sticks to the bottom (position: sticky)', navFixed === 'sticky', String(navFixed))
  t.check('no console / page / network errors', !hasErrors(errors), summarizeErrors(errors))
})

run()
