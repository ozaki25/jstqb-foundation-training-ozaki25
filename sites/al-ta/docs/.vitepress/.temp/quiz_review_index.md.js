import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ドリル — 間違えた問題を復習","description":"","frontmatter":{"title":"ドリル — 間違えた問題を復習","prev":false,"next":false},"headers":[],"relativePath":"quiz/review/index.md","filePath":"quiz/review/index.md","lastUpdated":1783394397000}');
const _sfc_main = { name: "quiz/review/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_QuizReview = resolveComponent("QuizReview");
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="間違えた問題を復習" tabindex="-1">間違えた問題を復習 <a class="header-anchor" href="#間違えた問題を復習" aria-label="Permalink to &quot;間違えた問題を復習&quot;">​</a></h1><p>過去に間違えた問題を集めて出題します。正解できたらその問題は次回の復習から外れます。</p>`);
  _push(ssrRenderComponent(_component_QuizReview, null, null, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("quiz/review/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
