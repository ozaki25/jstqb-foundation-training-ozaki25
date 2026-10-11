<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, useId } from 'vue'
import type { QuizFigure } from '../../quiz/types'

const props = defineProps<{ figure: QuizFigure }>()

// Mermaid 部品（vitepress-plugin-mermaid がグローバル登録）は id と URI エンコードしたコードを受け取る。
// 同じ問題が複数回描画されても id が衝突しないよう useId で一意にする。
const uid = useId()
const mermaidId = computed(() => `quiz-mermaid-${uid.replace(/[^a-zA-Z0-9_-]/g, '')}`)
const mermaidGraph = computed(() =>
  props.figure.type === 'mermaid' ? encodeURIComponent(props.figure.code) : '',
)

// `` `foo` `` → <code>foo</code>（クイズデータは固定値なので v-html で安全）
function renderText(s: string): string {
  const escaped = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return escaped.replace(/`([^`]+)`/g, '<code>$1</code>')
}

// 表・図が横にはみ出しているときだけ「横にスクロールできます」を出す。
// SSR では判定できないので false で描画し、マウント後・リサイズ時・（Mermaid は）描画完了時に測る。
const scroller = ref<HTMLElement | null>(null) // 表のスクロール領域
const mermaidBox = ref<HTMLElement | null>(null) // Mermaid 図の外枠
const overflowing = ref(false)
let resizeObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null
// Mermaid の流れ図は中央寄せで描かれるため、はみ出すときは最初に中央を見せる（1 回だけ）
let centered = false

// 横スクロールする要素。Mermaid は部品の中の .mermaid（custom.css で横スクロール指定済み）。
function scrollTarget(): HTMLElement | null {
  if (props.figure.type === 'table') return scroller.value
  if (props.figure.type === 'mermaid') return mermaidBox.value?.querySelector<HTMLElement>('.mermaid') ?? null
  return null
}

function measure() {
  const el = scrollTarget()
  overflowing.value = !!el && el.scrollWidth > el.clientWidth + 1
  if (el && props.figure.type === 'mermaid') {
    // 図の内容は sr-only の説明文で伝えるので、SVG の文字列は読み上げ対象から外す。
    // はみ出すときはキーボードでもスクロールできるようにする。
    el.setAttribute('aria-hidden', 'true')
    if (overflowing.value) el.setAttribute('tabindex', '0')
    else el.removeAttribute('tabindex')
    if (overflowing.value && !centered && el.querySelector('svg')) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
      centered = true
    }
  }
}

onMounted(() => {
  const root = props.figure.type === 'table' ? scroller.value : props.figure.type === 'mermaid' ? mermaidBox.value : null
  if (!root) return
  measure()
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(root)
  }
  if (props.figure.type === 'mermaid') {
    // Mermaid は非同期で SVG を差し込む（テーマ切替でも描き直す）ので、そのたびに測り直す
    mutationObserver = new MutationObserver(measure)
    mutationObserver.observe(root, { childList: true, subtree: true })
  }
})
onUnmounted(() => {
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
})
</script>

<template>
  <figure class="quiz-figure" :data-type="figure.type">
    <template v-if="figure.type === 'table'">
      <p v-if="overflowing" class="scroll-hint" aria-hidden="true">表は横にスクロールできます</p>
      <!-- はみ出す表はキーボードでもスクロールできるよう tabindex を付けたスクロール領域にする -->
      <div
        ref="scroller"
        class="table-scroll"
        :tabindex="overflowing ? 0 : undefined"
        :role="overflowing ? 'region' : undefined"
        :aria-label="overflowing ? figure.caption : undefined"
      >
        <table :class="{ 'has-row-header': figure.rowHeader }">
          <caption v-html="renderText(figure.caption)" />
          <thead>
            <tr>
              <th v-for="(h, i) in figure.headers" :key="i" scope="col" v-html="renderText(h)" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, r) in figure.rows" :key="r">
              <template v-for="(cell, c) in row" :key="c">
                <th v-if="figure.rowHeader && c === 0" scope="row" v-html="renderText(cell)" />
                <td v-else v-html="renderText(cell)" />
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-else-if="figure.type === 'mermaid'">
      <p v-if="overflowing" class="scroll-hint" aria-hidden="true">図は横にスクロールできます</p>
      <p class="sr-only">{{ figure.alt }}</p>
      <div ref="mermaidBox" class="mermaid-box">
        <ClientOnly>
          <Mermaid :id="mermaidId" :graph="mermaidGraph" />
        </ClientOnly>
      </div>
      <figcaption v-if="figure.caption">
        <span v-html="renderText(figure.caption)" />
      </figcaption>
    </template>

    <template v-else-if="figure.type === 'image'">
      <img :src="figure.src" :alt="figure.alt" loading="lazy" decoding="async" />
      <figcaption>
        <span v-if="figure.caption" v-html="renderText(figure.caption)" />
        <a class="open-full" :href="figure.src" target="_blank" rel="noopener">図を拡大して開く</a>
      </figcaption>
    </template>

    <template v-else-if="figure.type === 'pre'">
      <figcaption v-if="figure.caption" class="pre-caption" v-html="renderText(figure.caption)" />
      <pre><code>{{ figure.text }}</code></pre>
    </template>
  </figure>
</template>

<style scoped>
.quiz-figure {
  margin: 0 0 1rem;
  min-width: 0;
}

/* ---- 表 ---- */
.scroll-hint {
  margin: 0 0 0.25rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.scroll-hint::before {
  content: '↔ ';
}

.table-scroll {
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
}
.table-scroll:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

/* VitePress の .vp-doc table のスタイルが及ばないよう、ここで完結させる */
.quiz-figure table {
  display: table;
  width: auto;
  min-width: 100%;
  margin: 0;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.85rem;
  line-height: 1.4;
}
.quiz-figure caption {
  caption-side: top;
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}
.quiz-figure th,
.quiz-figure td {
  padding: 0.4rem 0.6rem;
  border: none;
  border-bottom: 1px solid var(--vp-c-divider);
  border-right: 1px solid var(--vp-c-divider);
  text-align: center;
  white-space: nowrap;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
}
.quiz-figure tr > :last-child {
  border-right: none;
}
.quiz-figure tbody tr:last-child > * {
  border-bottom: none;
}
.quiz-figure thead th {
  font-weight: 700;
  background: var(--vp-c-bg-soft);
}

/* 行見出し（条件名・アクション名など）は左寄せ・折り返し可にし、横スクロール中も固定する */
.quiz-figure .has-row-header tbody th,
.quiz-figure .has-row-header thead th:first-child {
  position: sticky;
  left: 0;
  z-index: 1;
  text-align: left;
  white-space: normal;
  min-width: 7.5rem;
  max-width: 12rem;
  font-weight: 600;
  background: var(--vp-c-bg-soft);
  box-shadow: 1px 0 0 var(--vp-c-divider);
}

/* ---- Mermaid 図 ---- */
/* 図の大きさと横スクロールは custom.css の .vp-doc .mermaid（レッスンの図と共通）に任せる */
.mermaid-box {
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
}

.mermaid-box :deep(.mermaid:focus-visible) {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

/* 読み上げ専用（画面には出さない） */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ---- 画像 ---- */
.quiz-figure[data-type='image'] img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
}
.quiz-figure figcaption {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.25rem 1rem;
  margin-top: 0.35rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}
.open-full {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 2px;
  /* スマホで押しやすい高さを確保する */
  display: inline-flex;
  align-items: center;
  min-height: 32px;
}

/* ---- 整形済みテキスト ---- */
.pre-caption {
  margin: 0 0 0.25rem;
}
.quiz-figure pre {
  margin: 0;
  padding: 0.75rem 0.9rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  /* スマホで横スクロールさせないよう折り返す（スクリプトの 1 行が長い場合も読める） */
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.quiz-figure pre code {
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 0.85rem;
  line-height: 1.6;
  background: none;
  padding: 0;
  color: var(--vp-c-text-1);
}

/* v-html で挿入される <code> */
.quiz-figure :deep(td code),
.quiz-figure :deep(th code),
.quiz-figure :deep(caption code),
.quiz-figure :deep(figcaption code) {
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 0.9em;
  background: var(--vp-c-bg-mute);
  padding: 0.1em 0.3em;
  border-radius: 3px;
}

@media (max-width: 640px) {
  .quiz-figure table {
    font-size: 0.8rem;
  }
  .quiz-figure th,
  .quiz-figure td {
    padding: 0.35rem 0.45rem;
  }
  .quiz-figure .has-row-header tbody th,
  .quiz-figure .has-row-header thead th:first-child {
    min-width: 6rem;
    max-width: 8.5rem;
  }
}
</style>
