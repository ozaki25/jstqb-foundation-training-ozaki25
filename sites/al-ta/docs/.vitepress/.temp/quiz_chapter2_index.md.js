import { useSSRContext, resolveComponent, unref } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { q as quizzesByChapter } from "./index.DzALd8Wj.js";
const __pageData = JSON.parse('{"title":"ドリル — 2章 リスクベースドテストにおけるテストアナリストのタスク","description":"","frontmatter":{"title":"ドリル — 2章 リスクベースドテストにおけるテストアナリストのタスク","prev":false,"next":false},"headers":[],"relativePath":"quiz/chapter2/index.md","filePath":"quiz/chapter2/index.md","lastUpdated":1791732482000}');
const __default__ = { name: "quiz/chapter2/index.md" };
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __ssrInlineRender: true,
  setup(__props) {
    const quizzes = quizzesByChapter[2];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_QuizPage = resolveComponent("QuizPage");
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="_2章-リスクベースドテストにおけるテストアナリストのタスク" tabindex="-1">2章 リスクベースドテストにおけるテストアナリストのタスク <a class="header-anchor" href="#_2章-リスクベースドテストにおけるテストアナリストのタスク" aria-label="Permalink to &quot;2章 リスクベースドテストにおけるテストアナリストのタスク&quot;">​</a></h1>`);
      _push(ssrRenderComponent(_component_QuizPage, {
        quizzes: unref(quizzes),
        chapter: 2,
        title: "2章 リスクベースドテストにおけるテストアナリストのタスク"
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("quiz/chapter2/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  __pageData,
  _sfc_main as default
};
