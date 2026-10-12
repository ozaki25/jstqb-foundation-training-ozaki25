// Minimal block-based test runner (AL-TA E2E). Same design as sites/fl/tests/runner.mjs.
//
// ── Block isolation ─────────────────────────────────────────────────────────
// Each "block" gets a FRESH browser (launched then closed in finally) to keep
// the bundled @sparticuz/chromium stable — it crashes after many contexts in
// one process. Inside a block, use `t.check(name, cond, detail)` to record
// cases. Blocks run sequentially; results aggregate into a coverage table at
// the end. Exit code is non-zero if any case FAILed (CI/local can gate on it),
// but blocks are isolated so one failure does not abort the rest.
//
// ── Chunked / partial execution (BLOCKS env var) ────────────────────────────
// Each block name starts with a token such as "RT-A" (suite prefix + letter).
// Select which blocks to run with the BLOCKS environment variable:
//
//   npm run test:e2e -w sites/al-ta                 # all suites, all blocks
//   BLOCKS=MK npm run test:e2e -w sites/al-ta       # every block whose token starts with MK
//   BLOCKS=MK-B,RT-A npm run test:e2e -w sites/al-ta  # exact tokens
//   BLOCKS=mk npm run test:e2e -w sites/al-ta       # case-insensitive
//
// Suite prefixes: RT (routes / footer / 404), QZ (chapter drill flow),
// FG (figures), MK (mock exam / random pages / review), UX (dark mode / a11y).
//
// If a selection matches no known block in a suite, that suite exits non-zero
// with the list of valid keys (guards against typos silently passing). run-all.mjs
// sets BLOCKS_SKIP_EMPTY=1 when it runs every suite with a BLOCKS filter, so suites
// that simply have no selected block are skipped instead of failing.

import { launchBrowser } from './helpers.mjs'

const results = [] // { block, name, ok, detail }

export function makeChecker(blockName) {
  return {
    block: blockName,
    check(name, cond, detail = '') {
      results.push({ block: blockName, name, ok: !!cond, detail: cond ? '' : detail })
      const tag = cond ? 'PASS' : 'FAIL'
      process.stdout.write(`  [${tag}] ${name}${cond ? '' : '  -- ' + detail}\n`)
    },
    info(msg) {
      process.stdout.write(`  · ${msg}\n`)
    },
  }
}

const blocks = []

export function block(name, fn) {
  blocks.push({ name, fn })
}

// Extract the leading token of a block name, up to the first space or dot.
// Handles both single-letter keys ("C. Answer flow" → "C") and multi-char
// prefixes used by the QA suites ("RR-A. Exact totals" → "RR-A").
function blockToken(name) {
  const s = String(name).trim().toUpperCase()
  const i = s.search(/[\s.]/)
  return i === -1 ? s : s.slice(0, i)
}

// Does a block token match any wanted prefix? "RR" matches token "RR-A";
// "RR-A" matches exactly; single letter "A" matches token "A" but not "RR-A".
function tokenMatches(token, want) {
  for (const p of want) {
    if (token === p || token.startsWith(p + '-')) return true
  }
  return false
}

// Parse the BLOCKS env var into a Set of upper-case prefixes. Supports comma
// lists, inclusive single-letter ranges ("A-D,O,W"), and multi-char prefixes
// ("RR", "RR-A", "SC-B"). Returns null when unset/empty → "run everything".
function parseBlockSelection(raw) {
  if (!raw || !raw.trim()) return null
  const want = new Set()
  for (const part of raw.split(',')) {
    const seg = part.trim().toUpperCase()
    if (!seg) continue
    const range = seg.match(/^([A-Z])\s*-\s*([A-Z])$/)
    if (range) {
      let [a, b] = [range[1].charCodeAt(0), range[2].charCodeAt(0)]
      if (a > b) [a, b] = [b, a]
      for (let c = a; c <= b; c++) want.add(String.fromCharCode(c))
    } else {
      // single letter OR a multi-char prefix like RR / RR-A / SC-B
      want.add(seg)
    }
  }
  return want
}

export async function run() {
  const selection = parseBlockSelection(process.env.BLOCKS)
  const allKeys = blocks.map((b) => blockToken(b.name))

  let toRun = blocks
  if (selection) {
    toRun = blocks.filter((b) => tokenMatches(blockToken(b.name), selection))
    if (toRun.length === 0) {
      if (process.env.BLOCKS_SKIP_EMPTY) {
        process.stdout.write(`\n[runner] BLOCKS="${process.env.BLOCKS}" selects nothing in this suite; skipped.\n`)
        return
      }
      process.stderr.write(
        `\n[runner] BLOCKS="${process.env.BLOCKS}" matched no blocks.\n` +
          `         Valid block keys: ${allKeys.join(', ')}\n`,
      )
      process.exitCode = 1
      return
    }
    process.stdout.write(
      `\n[runner] Selected blocks (${toRun.length}/${blocks.length}): ` +
        `${toRun.map((b) => blockToken(b.name)).join(', ')}\n`,
    )
  }

  for (const b of toRun) {
    process.stdout.write(`\n=== ${b.name} ===\n`)
    const t = makeChecker(b.name)
    const startedAt = Date.now()
    let browser
    try {
      browser = await launchBrowser()
      await b.fn({ t, browser })
    } catch (err) {
      results.push({
        block: b.name,
        name: '(block crashed)',
        ok: false,
        detail: String(err && err.stack ? err.stack : err),
      })
      process.stdout.write(`  [FAIL] (block crashed) -- ${err && err.message}\n`)
    } finally {
      if (browser) {
        try { await browser.close() } catch {}
      }
      process.stdout.write(`  (${((Date.now() - startedAt) / 1000).toFixed(1)}s)\n`)
    }
  }

  // Summary
  const total = results.length
  const failed = results.filter((r) => !r.ok)
  process.stdout.write('\n\n========== SUMMARY ==========\n')
  if (selection) {
    process.stdout.write(`Block selection: BLOCKS=${process.env.BLOCKS} → [${toRun.map((b) => blockToken(b.name)).join(', ')}]\n`)
  }
  process.stdout.write(`Total cases: ${total}\n`)
  process.stdout.write(`Passed: ${total - failed.length}\n`)
  process.stdout.write(`Failed: ${failed.length}\n`)
  if (failed.length) {
    process.stdout.write('\n--- FAILURES ---\n')
    for (const f of failed) {
      process.stdout.write(`  [${f.block}] ${f.name}\n      ${f.detail}\n`)
    }
  }

  // Per-block table
  process.stdout.write('\n--- PER-BLOCK ---\n')
  const byBlock = new Map()
  for (const r of results) {
    if (!byBlock.has(r.block)) byBlock.set(r.block, { pass: 0, fail: 0 })
    const e = byBlock.get(r.block)
    if (r.ok) e.pass++; else e.fail++
  }
  for (const [name, e] of byBlock) {
    process.stdout.write(`  ${e.fail === 0 ? 'OK ' : 'XX '} ${name}: ${e.pass} pass / ${e.fail} fail\n`)
  }

  process.exitCode = failed.length > 0 ? 1 : 0
}
