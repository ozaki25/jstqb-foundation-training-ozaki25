import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ドリル","description":"","frontmatter":{"title":"ドリル","prev":false,"next":false},"headers":[],"relativePath":"quiz/index.md","filePath":"quiz/index.md","lastUpdated":1783394397000}');
const _sfc_main = { name: "quiz/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_QuizTop = resolveComponent("QuizTop");
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="ドリル" tabindex="-1">ドリル <a class="header-anchor" href="#ドリル" aria-label="Permalink to &quot;ドリル&quot;">​</a></h1><p>各章のレッスン内容を 4 択問題で確認できます。回答履歴はブラウザに保存されるので、ページを閉じても続きから再開できます。問題はレッスンの公開に合わせて順次追加します。</p>`);
  _push(ssrRenderComponent(_component_QuizTop, null, null, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("quiz/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
