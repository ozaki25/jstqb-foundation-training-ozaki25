// ============================================================================
// AL-TA E2E — routes: every page opens cleanly and carries the attribution.
//
//   RT-A  every route → 200, no console / page / network errors, footer attribution
//   RT-B  internal links on the home page and the drill top resolve (no 404)
//   RT-C  unknown path → 404 page
//   RT-D  attribution pages (home warning, about page)
// ============================================================================

import { block, run } from './runner.mjs'
import { newInstrumentedPage, summarizeErrors, url, gotoPage, FOOTER_SELECTOR } from './helpers.mjs'
import { CHAPTER_IDS, LESSONS } from './data.mjs'

const ROUTES = [
  '/',
  '/about/',
  '/glossary/',
  '/quiz/',
  ...CHAPTER_IDS.map((n) => `/quiz/chapter${n}/`),
  '/quiz/random/',
  '/quiz/random-5/',
  '/quiz/random-10/',
  '/quiz/random-45/',
  '/quiz/review/',
  ...LESSONS.map((l) => `/lessons/${l}/`),
]

block('RT-A. All routes load cleanly and show the attribution footer', async ({ t, browser }) => {
  const { page, errors } = await newInstrumentedPage(browser)
  t.info(`${ROUTES.length} routes (${LESSONS.length} lessons, ${CHAPTER_IDS.length} chapter drills)`)
  for (const p of ROUTES) {
    const before = {
      pe: errors.pageErrors.length,
      ce: errors.consoleErrors.length,
      br: errors.badResponses.length,
      fr: errors.failedRequests.length,
    }
    const resp = await gotoPage(page, p)
    await page.waitForTimeout(200) // post-hydration work (card shuffle / sampling) settles
    t.check(`GET ${p} → 200`, resp && resp.status() === 200, `status=${resp && resp.status()}`)

    const slice = {
      pageErrors: errors.pageErrors.slice(before.pe),
      consoleErrors: errors.consoleErrors.slice(before.ce),
      badResponses: errors.badResponses.slice(before.br),
      failedRequests: errors.failedRequests.slice(before.fr),
    }
    const clean = Object.values(slice).every((a) => a.length === 0)
    t.check(`${p} no console / page / network errors`, clean, summarizeErrors(slice))

    const footer = await page.locator(FOOTER_SELECTOR).first().innerText().catch(() => '')
    t.check(
      `${p} footer carries ISTQB® and JSTQB® copyright attribution`,
      /ISTQB®/.test(footer) && /JSTQB®/.test(footer) && /©/.test(footer) && /非公式/.test(footer),
      `footer=${JSON.stringify(footer.slice(0, 120))}`,
    )
  }
})

block('RT-B. Internal links on home and drill top resolve', async ({ t, browser }) => {
  const { page } = await newInstrumentedPage(browser)
  for (const from of ['/', '/quiz/']) {
    await gotoPage(page, from)
    const hrefs = await page.$$eval('main a[href], .VPNav a[href]', (as) =>
      [...new Set(as.map((a) => a.getAttribute('href')).filter((h) => h && h.startsWith('/') && !h.startsWith('//')))],
    )
    t.check(`${from} has internal links`, hrefs.length > 0, `n=${hrefs.length}`)
    const bad = []
    for (const h of hrefs) {
      const path = h.split('#')[0]
      if (!path) continue
      const r = await page.request.get(url(path))
      if (r.status() !== 200) bad.push(`${r.status()} ${h}`)
    }
    t.check(`${from} all ${hrefs.length} internal links → 200`, bad.length === 0, bad.join(', '))
  }
  // Lessons are reachable from the home page: all 30 are linked.
  await gotoPage(page, '/')
  const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')))
  const missing = LESSONS.filter((l) => !hrefs.some((h) => h && h.startsWith(`/lessons/${l}/`)))
  t.check('home page links to every lesson', missing.length === 0, `missing=${missing.join(',')}`)
})

block('RT-C. Unknown path → 404 page', async ({ t, browser }) => {
  const { page, errors } = await newInstrumentedPage(browser)
  const resp = await page.goto(url('/no-such-page-xyz/'), { waitUntil: 'networkidle' })
  t.check('unknown path → HTTP 404', resp && resp.status() === 404, `status=${resp && resp.status()}`)
  const body = await page.textContent('body')
  t.check('404 page shows NotFound content', /404|PAGE NOT FOUND/i.test(body), body.slice(0, 80))
  t.check('404 page no JS exceptions', errors.pageErrors.length === 0, summarizeErrors(errors))
  const footer = await page.locator(FOOTER_SELECTOR).count()
  t.check('404 page still renders the footer', footer > 0, `footer count=${footer}`)
})

block('RT-D. Attribution pages (home warning, about page)', async ({ t, browser }) => {
  const { page } = await newInstrumentedPage(browser)
  await gotoPage(page, '/')
  const home = await page.locator('main').innerText()
  t.check('home page says the content is unofficial (非公式)', /非公式/.test(home), home.slice(0, 100))
  t.check('home page has a warning block', (await page.locator('.custom-block.warning').count()) > 0)
  await gotoPage(page, '/about/')
  const about = await page.locator('main').innerText()
  t.check('about page mentions ISTQB®', /ISTQB®/.test(about))
  t.check('about page mentions JSTQB®', /JSTQB®/.test(about))
  t.check('about page mentions 非公式', /非公式/.test(about))
  await gotoPage(page, '/quiz/')
  const link = await page.locator(`${FOOTER_SELECTOR} a[href="/about/"]`).count()
  t.check('footer links to /about/ (出典・免責について)', link > 0, `links=${link}`)
})

run()
