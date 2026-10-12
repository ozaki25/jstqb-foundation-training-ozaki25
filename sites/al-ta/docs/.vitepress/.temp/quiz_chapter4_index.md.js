import { useSSRContext, resolveComponent, unref } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { q as quizzesByChapter } from "./index.DzALd8Wj.js";
const __pageData = JSON.parse('{"title":"ドリル — 4章 品質特性のテスト","description":"","frontmatter":{"title":"ドリル — 4章 品質特性のテスト","prev":false,"next":false},"headers":[],"relativePath":"quiz/chapter4/index.md","filePath":"quiz/chapter4/index.md","lastUpdated":1791732482000}');
const __default__ = { name: "quiz/chapter4/index.md" };
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __ssrInlineRender: true,
  setup(__props) {
    const quizzes = quizzesByChapter[4];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_QuizPage = resolveComponent("QuizPage");
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="_4章-品質特性のテスト" tabindex="-1">4章 品質特性のテスト <a class="header-anchor" href="#_4章-品質特性のテスト" aria-label="Permalink to &quot;4章 品質特性のテスト&quot;">​</a></h1>`);
      _push(ssrRenderComponent(_component_QuizPage, {
        quizzes: unref(quizzes),
        chapter: 4,
        title: "4章 品質特性のテスト"
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("quiz/chapter4/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  __pageData,
  _sfc_main as default
};
