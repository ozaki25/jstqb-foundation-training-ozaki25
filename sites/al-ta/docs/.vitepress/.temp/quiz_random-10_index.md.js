import { useSSRContext, resolveComponent, unref } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { a as allQuizzes } from "./index.DzALd8Wj.js";
const __pageData = JSON.parse('{"title":"ドリル — ランダム 10 問","description":"","frontmatter":{"title":"ドリル — ランダム 10 問","prev":false,"next":false},"headers":[],"relativePath":"quiz/random-10/index.md","filePath":"quiz/random-10/index.md","lastUpdated":1783394397000}');
const __default__ = { name: "quiz/random-10/index.md" };
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_QuizPage = resolveComponent("QuizPage");
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="ランダム-10-問" tabindex="-1">ランダム 10 問 <a class="header-anchor" href="#ランダム-10-問" aria-label="Permalink to &quot;ランダム 10 問&quot;">​</a></h1><p>全 5 章・全難易度からランダムに 10 問出題します。<strong>特定の章で力試しをしたい場合は、左サイドバーの「N 章 〇〇」のドリルから選んでください</strong>。</p>`);
      _push(ssrRenderComponent(_component_QuizPage, {
        quizzes: unref(allQuizzes),
        "random-sample": 10,
        title: "ランダム 10 問"
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("quiz/random-10/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  __pageData,
  _sfc_main as default
};
