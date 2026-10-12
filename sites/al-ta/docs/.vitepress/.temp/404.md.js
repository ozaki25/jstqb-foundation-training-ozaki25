import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ページが見つかりません","description":"","frontmatter":{"title":"ページが見つかりません","layout":"page","sidebar":false,"editLink":false},"headers":[],"relativePath":"404.md","filePath":"404.md","lastUpdated":1783394397000}');
const _sfc_main = { name: "404.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="_404-—-ページが見つかりません" tabindex="-1">404 — ページが見つかりません <a class="header-anchor" href="#_404-—-ページが見つかりません" aria-label="Permalink to &quot;404 — ページが見つかりません&quot;">​</a></h1><p>お探しのページは見つかりませんでした。</p><p>URL が変更された、または削除された可能性があります。下のリンクから学習を続けてください。</p><h2 id="こちらから探してください" tabindex="-1">こちらから探してください <a class="header-anchor" href="#こちらから探してください" aria-label="Permalink to &quot;こちらから探してください&quot;">​</a></h2><ul><li><a href="/">ホームへ戻る</a></li><li><a href="/lessons/lesson01/">lesson01: SDLC におけるテストアナリストの関わり</a> — 最初のレッスンから始める</li><li><a href="/quiz/">ドリルに挑戦</a> — 4 択問題で理解度を確認</li></ul><p>ヘッダー右上の検索からも、レッスン本文を検索できます。</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("404.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _404 = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  _404 as default
};
