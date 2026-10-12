import { useSSRContext, resolveComponent, unref } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { a as allQuizzes } from "./index.DzALd8Wj.js";
import { a as MOCK_EXAM_QUOTA } from "./types.BxVFEtXO.js";
const __pageData = JSON.parse('{"title":"ドリル — 模擬試験（45問）","description":"","frontmatter":{"title":"ドリル — 模擬試験（45問）","prev":false,"next":false},"headers":[],"relativePath":"quiz/random-45/index.md","filePath":"quiz/random-45/index.md","lastUpdated":1791734588000}');
const __default__ = { name: "quiz/random-45/index.md" };
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_QuizPage = resolveComponent("QuizPage");
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="模擬試験-45問" tabindex="-1">模擬試験（45問） <a class="header-anchor" href="#模擬試験-45問" aria-label="Permalink to &quot;模擬試験（45問）&quot;">​</a></h1><p>ISTQB の V4.0 試験と同じ <strong>45 問</strong>を、本番と同じ配分（章ごとに 8 問・3 問・22 問・4 問・8 問。学習目標ごとの問題数も本番に合わせる）で、各レッスンからランダムに出題します。ISTQB 基準の試験時間は 120 分（非母語の受験者は 150 分）、合格ラインは 78 点満点中 51 点です。時間を計って解くと本番のペース感覚をつかめます。</p><div class="info custom-block"><p class="custom-block-title">本番との違い</p><p>問題数の配分は ISTQB の出題表に合わせていますが、問題そのものはこの教材のオリジナルです。実際の試験は K2 を 1 点、K3 を 2 点、K4 を 3 点で採点しますが、この模擬試験は正答数と正答率で結果を表示します。日本の V4.0 試験の正式な形式（問題数・合格点など）は未発表のため、数値は ISTQB の基準です。</p></div>`);
      _push(ssrRenderComponent(_component_QuizPage, {
        quizzes: unref(allQuizzes),
        "random-sample": 45,
        "quota-groups": unref(MOCK_EXAM_QUOTA),
        title: "模擬試験（45問）"
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("quiz/random-45/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  __pageData,
  _sfc_main as default
};
