import { useSSRContext, resolveComponent, unref } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { a as allQuizzes } from "./index.DzALd8Wj.js";
const __pageData = JSON.parse('{"title":"ドリル — ランダム出題（全問）","description":"","frontmatter":{"title":"ドリル — ランダム出題（全問）","prev":false,"next":false},"headers":[],"relativePath":"quiz/random/index.md","filePath":"quiz/random/index.md","lastUpdated":1783394397000}');
const __default__ = { name: "quiz/random/index.md" };
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_QuizPage = resolveComponent("QuizPage");
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="ランダム出題-全問" tabindex="-1">ランダム出題（全問） <a class="header-anchor" href="#ランダム出題-全問" aria-label="Permalink to &quot;ランダム出題（全問）&quot;">​</a></h1><p>全 ${ssrInterpolate(unref(allQuizzes).length)} 問からランダムに出題します。毎回順番が変わるので、繰り返し解いても慣れが出にくくなります。キーボード（1-4 で選択肢）でも操作できます。</p>`);
      _push(ssrRenderComponent(_component_QuizPage, {
        quizzes: unref(allQuizzes),
        title: `ランダム出題（全 ${unref(allQuizzes).length} 問）`,
        shuffle: true
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("quiz/random/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  __pageData,
  _sfc_main as default
};
