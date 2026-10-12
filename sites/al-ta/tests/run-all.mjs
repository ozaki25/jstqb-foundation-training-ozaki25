// Runs every AL-TA E2E suite, each in its own process (the bundled @sparticuz/chromium
// needs a fresh browser per block, and isolating suites in separate processes keeps it
// stable). Aggregates exit codes and fails if any suite fails.
//
//   node tests/run-all.mjs                       # all suites
//   node tests/run-all.mjs figures.e2e.mjs       # only the named suite(s)
//   BLOCKS=MK node tests/run-all.mjs             # chunk: forwarded to each suite (suites with no
//                                                #   matching block are skipped)
//
// A preview server for the built site must be live (default http://localhost:4174, override
// with E2E_BASE):
//   npm run docs:build -w sites/al-ta && npm run docs:preview -w sites/al-ta -- --port 4174
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const ALL = [
  'routes.e2e.mjs',   // RT: all routes load cleanly, footer attribution, 404
  'quiz.e2e.mjs',     // QZ: chapter drills (answer flow, finish, resume, shuffle correctness, top page)
  'figures.e2e.mjs',  // FG: figure questions (table / mermaid / pre), mobile overflow
  'mock.e2e.mjs',     // MK: mock exam draw (random-45), random pages, review page
  'ux.e2e.mjs',       // UX: dark mode, accessibility sampling
]
const named = process.argv.slice(2)
const suites = named.length ? named : ALL
const env = { ...process.env }
if (!named.length && env.BLOCKS) env.BLOCKS_SKIP_EMPTY = '1'

const started = Date.now()
const failed = []
for (const s of suites) {
  process.stdout.write(`\n############################## ${s} ##############################\n`)
  const r = spawnSync(process.execPath, [resolve(here, s)], { stdio: 'inherit', env })
  if (r.status !== 0) failed.push(s)
}

const secs = ((Date.now() - started) / 1000).toFixed(0)
process.stdout.write(`\n================ E2E ALL: ${suites.length - failed.length}/${suites.length} suites passed (${secs}s) ================\n`)
if (failed.length) {
  process.stdout.write(`FAILED suites: ${failed.join(', ')}\n`)
  process.exit(1)
}
