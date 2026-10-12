// Shared E2E helpers for the JSTQB Advanced Level Test Analyst (AL-TA) drill suite.
//
// ── Browser launch ────────────────────────────────────────────────────────
// 依存は `playwright-core`（インストール時にブラウザを外部DLしない）+
// `@sparticuz/chromium`（npmパッケージにchromiumバイナリを同梱）。この2つだけで
// `npm ci` 後すぐ `npm run test:e2e` が動き、ドキュメントCIにブラウザDLの負荷を
// 持ち込まない。resolveExecutablePath は、システムにPlaywrightブラウザがあれば
// それを優先し、無ければ同梱chromium（/tmp/chromium に展開）にフォールバックする。
//
// playwright-core は CJS なので default を import して `.chromium` を読む
// （named import 不可）。@playwright/test ランナーはブラウザDL前提のため使わない。
//
// 同梱chromiumは1プロセスで newContext() を多数作るとクラッシュするため、
// runner は *テストブロックごとに fresh browser を launch→finallyでclose* する。
// helpers 側はグローバルなブラウザ状態を持たない。

import pwpkg from 'playwright-core'
const chromium = pwpkg.chromium

const BASE = process.env.E2E_BASE || 'http://localhost:4174'

async function resolveExecutablePath() {
  // 1) Prefer a normally-installed Playwright browser if present.
  try {
    const p = chromium.executablePath()
    if (p) {
      const { existsSync } = await import('fs')
      if (existsSync(p)) return { executablePath: p, extraArgs: [] }
    }
  } catch {
    /* not installed — fall through to sparticuz */
  }
  // 2) Fall back to the bundled @sparticuz/chromium.
  const sparticuz = (await import('@sparticuz/chromium')).default
  const execPath = await sparticuz.executablePath()
  return { executablePath: execPath, extraArgs: sparticuz.args }
}

export async function launchBrowser() {
  const { executablePath, extraArgs } = await resolveExecutablePath()
  return chromium.launch({
    executablePath,
    args: [...extraArgs, '--no-sandbox'],
    headless: true,
  })
}

// Create a page that records console errors, page errors and bad network
// responses. The benign Vercel analytics 404s are filtered out (they only exist
// on Vercel prod; theme code is try/catch wrapped).
const BENIGN_404 = [
  '/_vercel/insights/script.js',
  '/_vercel/speed-insights/script.js',
]

function isBenign(url) {
  return BENIGN_404.some((b) => url.includes(b))
}

export async function newInstrumentedPage(browser, { viewport } = {}) {
  const context = await browser.newContext(
    viewport ? { viewport } : undefined,
  )
  const page = await context.newPage()
  const errors = {
    pageErrors: [],      // uncaught JS exceptions
    consoleErrors: [],   // console.error / console.warning (hydration etc.)
    badResponses: [],    // non-benign 4xx/5xx
    failedRequests: [],  // network failures (non-benign)
  }
  page.on('pageerror', (err) => {
    errors.pageErrors.push(String(err && err.message ? err.message : err))
  })
  page.on('console', (msg) => {
    const type = msg.type()
    const text = msg.text()
    const loc = msg.location && msg.location()
    const locUrl = loc && loc.url ? loc.url : ''
    if (type === 'error') {
      // "Failed to load resource: ... 404" surfaces as a console error whose
      // *text* has no URL; the URL lives in msg.location(). The only 404s on a
      // correctly-served preview build are the benign Vercel analytics scripts,
      // so filter resource-load errors by their location URL.
      if (/Failed to load resource/i.test(text)) {
        if (isBenign(locUrl)) return
        // Any other resource 404/5xx is a real issue; the `response` listener
        // already captures it with the URL, so don't double-count here.
        return
      }
      if (isBenign(text) || isBenign(locUrl)) return
      errors.consoleErrors.push(text + (locUrl ? ` @ ${locUrl}` : ''))
    } else if (type === 'warning') {
      // Surface Vue hydration mismatch warnings as real issues.
      if (/hydrat/i.test(text) || /mismatch/i.test(text)) {
        errors.consoleErrors.push('[warning] ' + text)
      }
    }
  })
  page.on('response', (resp) => {
    const status = resp.status()
    const url = resp.url()
    if (status >= 400 && !isBenign(url)) {
      errors.badResponses.push(`${status} ${url}`)
    }
  })
  page.on('requestfailed', (req) => {
    const url = req.url()
    if (!isBenign(url)) errors.failedRequests.push(`${req.failure()?.errorText} ${url}`)
  })
  return { page, context, errors }
}

function isBenignText(text) {
  return BENIGN_404.some((b) => text.includes(b))
}

export function summarizeErrors(errors) {
  const parts = []
  if (errors.pageErrors.length) parts.push(`pageErrors=${JSON.stringify(errors.pageErrors)}`)
  if (errors.consoleErrors.length) parts.push(`consoleErrors=${JSON.stringify(errors.consoleErrors)}`)
  if (errors.badResponses.length) parts.push(`badResponses=${JSON.stringify(errors.badResponses)}`)
  if (errors.failedRequests.length) parts.push(`failedRequests=${JSON.stringify(errors.failedRequests)}`)
  return parts.join(' | ')
}

export function hasErrors(errors) {
  return (
    errors.pageErrors.length > 0 ||
    errors.consoleErrors.length > 0 ||
    errors.badResponses.length > 0 ||
    errors.failedRequests.length > 0
  )
}

export const BASE_URL = BASE

export function url(path) {
  return BASE + path
}

// Clear all client-side state on the current origin.
export async function clearStorage(page) {
  await page.evaluate(() => {
    try { localStorage.clear() } catch {}
    try { sessionStorage.clear() } catch {}
  })
}

// Wait for the quiz card to be ready (or finish screen).
export async function waitQuiz(page) {
  await page.waitForSelector('.quiz-card, .quiz-finish', { timeout: 15000 })
}

// ── AL-TA additions ─────────────────────────────────────────────────────────

export const FOOTER_SELECTOR = '.VPFooter'

// Goto + wait for network idle.
export async function gotoPage(page, path) {
  return page.goto(url(path), { waitUntil: 'networkidle' })
}

// Goto a drill page and wait for the card (or finish) to render.
export async function gotoQuiz(page, path) {
  const resp = await gotoPage(page, path)
  await waitQuiz(page)
  return resp
}

// Pre-seed sessionStorage/localStorage before the page scripts run (one-shot per
// navigation: the init script is registered on the context and runs on every load,
// so callers that need a one-shot seed should use seedAndReload instead).
export async function setStorage(page, { local, session } = {}) {
  await page.evaluate(
    ({ local, session }) => {
      if (local) for (const [k, v] of Object.entries(local)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))
      if (session) for (const [k, v] of Object.entries(session)) sessionStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))
    },
    { local, session },
  )
}

export async function getStorage(page, kind, key) {
  return page.evaluate(
    ({ kind, key }) => {
      const raw = (kind === 'local' ? localStorage : sessionStorage).getItem(key)
      return raw == null ? null : JSON.parse(raw)
    },
    { kind, key },
  )
}

// Rounded blend-aware luminance helpers run in the page.
// Returns { fg, bg, ratio } for an element, resolving transparent backgrounds
// by walking up the ancestors (ignoring opacity, which callers handle).
export async function contrastOf(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    function parse(c) {
      const m = c.match(/rgba?\(([^)]+)\)/)
      if (!m) return null
      const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number)
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }
    }
    function lum({ r, g, b }) {
      const f = (v) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      }
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }
    function bgOf(node) {
      let layers = []
      for (let n = node; n; n = n.parentElement) {
        const c = parse(getComputedStyle(n).backgroundColor)
        if (c && c.a > 0) {
          layers.push(c)
          if (c.a >= 1) break
        }
      }
      let base = { r: 255, g: 255, b: 255 }
      for (const c of layers.reverse()) {
        base = { r: c.r * c.a + base.r * (1 - c.a), g: c.g * c.a + base.g * (1 - c.a), b: c.b * c.a + base.b * (1 - c.a) }
      }
      return base
    }
    const fg = parse(getComputedStyle(el).color)
    const bg = bgOf(el)
    const l1 = lum(fg), l2 = lum(bg)
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
    return { fg, bg, ratio }
  }, selector)
}

// ── Quiz card interaction (shared by the QZ / FG / MK suites) ───────────────
// Choices are shuffled on the client, so every interaction matches by choice TEXT
// (never by position) using the ground truth in data.mjs.

import { BY_CARD, BY_ID, cardKey, norm } from './data.mjs'

export async function readChoices(page) {
  const texts = await page.$$eval('.quiz-choices button', (btns) =>
    btns.map((b) => {
      const t = b.querySelector('.choice-text')
      return t ? t.textContent : b.textContent
    }),
  )
  return texts.map(norm)
}

export async function readQuestion(page) {
  return norm(await page.textContent('.quiz-question'))
}

// Identify the quiz currently on screen (null if it matches nothing in the data).
export async function currentQuiz(page) {
  const q = await readQuestion(page)
  const choices = await readChoices(page)
  return BY_CARD.get(cardKey(q, choices)) ?? null
}

// Display index of the correct / a wrong choice for the given quiz.
export async function choiceIndexes(page, quiz) {
  const want = norm(quiz.choices[quiz.answer])
  const choices = await readChoices(page)
  const correct = choices.findIndex((c) => c === want)
  const wrong = choices.findIndex((c) => c !== want)
  return { correct, wrong, choices }
}

export async function clickChoice(page, displayIndex) {
  await page.locator('.quiz-choices button').nth(displayIndex).click()
  await page.waitForSelector('.quiz-result', { timeout: 5000 })
}

// Answer the card on screen. mode: 'correct' | 'wrong'. Returns the quiz and clicked index.
export async function answerCurrent(page, mode = 'correct') {
  const quiz = await currentQuiz(page)
  if (!quiz) throw new Error('cannot identify the current card: ' + (await readQuestion(page)))
  const { correct, wrong } = await choiceIndexes(page, quiz)
  const idx = mode === 'correct' ? correct : wrong
  if (idx < 0) throw new Error(`choice not found for ${quiz.id} (${mode})`)
  await clickChoice(page, idx)
  return { quiz, idx }
}

export async function clickNext(page) {
  await page.locator('.btn-next').click()
  await page.waitForSelector('.quiz-card, .quiz-finish', { timeout: 5000 })
}

// "3 / 37" from the card meta line → { n, total }
export async function readCardPosition(page) {
  const txt = await page.textContent('.quiz-num')
  const m = txt.match(/(\d+)\s*\/\s*(\d+)/)
  return m ? { n: Number(m[1]), total: Number(m[2]) } : null
}

// "5 / 45 問回答済み" → { answered, total }
export async function readProgress(page) {
  const txt = await page.textContent('.quiz-progress-text')
  const m = txt.match(/(\d+)\s*\/\s*(\d+)\s*問回答済み/)
  return m ? { answered: Number(m[1]), total: Number(m[2]) } : null
}

// Class of every choice button, by display index (after answering).
export async function readChoiceClasses(page) {
  return page.$$eval('.quiz-choices button', (btns) => btns.map((b) => b.className))
}

export { BY_ID }
