import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"出典・免責について","description":"","frontmatter":{"title":"出典・免責について"},"headers":[],"relativePath":"about/index.md","filePath":"about/index.md","lastUpdated":1783394397000}');
const _sfc_main = { name: "about/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="出典・免責について" tabindex="-1">出典・免責について <a class="header-anchor" href="#出典・免責について" aria-label="Permalink to &quot;出典・免責について&quot;">​</a></h1><h2 id="本教材の位置づけ" tabindex="-1">本教材の位置づけ <a class="header-anchor" href="#本教材の位置づけ" aria-label="Permalink to &quot;本教材の位置づけ&quot;">​</a></h2><p>本教材は、JSTQB Advanced Level シラバス テストアナリスト（Version 4.0.J01）を参考に作成した<strong>非公式</strong>の学習コンテンツです。ソフトウェアテスト技術者資格 Advanced Level テストアナリスト（CTAL-TA）の学習を支援する目的で、個人が制作しています。</p><p>本教材は ISTQB®／JSTQB® が承認・公認したものではありません。試験の正確な出題範囲・用語・定義は、必ず公式シラバスをご確認ください。</p><h2 id="出典・著作権" tabindex="-1">出典・著作権 <a class="header-anchor" href="#出典・著作権" aria-label="Permalink to &quot;出典・著作権&quot;">​</a></h2><p>本教材はシラバスの構成（章立て・学習目標）を学習の枠組みとして参照しています。シラバスに関する著作権は次のとおりです。</p><ul><li>シラバス（原著）の著作権は International Software Testing Qualifications Board（ISTQB®）に帰属します。</li><li>日本語翻訳版の著作権は Japan Software Testing Qualifications Board（JSTQB®）に帰属します。 <ul><li>Translation Copyright © 2005-2026, Japan Software Testing Qualifications Board (JSTQB®), all rights reserved.</li></ul></li></ul><p>シラバスは、著作者および ISTQB® を出典・著作権の保有者として明記する限りにおいて、記事・書籍・その他の派生著作物の基礎として利用できるとされています。本教材はこの条件に従い、出典と著作権保有者を明記しています。</p><ul><li>公式シラバス・試験情報: <a href="https://www.jstqb.jp/syllabus/" target="_blank" rel="noreferrer">https://www.jstqb.jp/syllabus/</a></li></ul><h2 id="istqb-用語集" tabindex="-1">ISTQB 用語集 <a class="header-anchor" href="#istqb-用語集" aria-label="Permalink to &quot;ISTQB 用語集&quot;">​</a></h2><p>シラバスの各章冒頭に挙がるキーワードは、ISTQB 用語集（ISTQB® Glossary）の用語を指します。ISTQB 用語集は <a href="https://creativecommons.org/licenses/by/4.0/deed.ja" target="_blank" rel="noreferrer">クリエイティブ・コモンズ 表示 4.0 国際（CC BY 4.0）</a> のもとで公開されています。</p><p>本教材の用語集ページは、ISTQB 用語集とシラバスを参照し、出典を明記したうえで、学習しやすい言葉に整えた説明を載せます。</p><ul><li>ISTQB 用語集: <a href="https://glossary.istqb.org/" target="_blank" rel="noreferrer">https://glossary.istqb.org/</a></li></ul><h2 id="制作方針" tabindex="-1">制作方針 <a class="header-anchor" href="#制作方針" aria-label="Permalink to &quot;制作方針&quot;">​</a></h2><ul><li>シラバス本文（条文・図・表現）をそのまま転載していません。事実・概念を理解した上で、本教材独自の言葉と図で書き直しています。</li><li>用語・定義はシラバスの表記を正としています。誤りにお気づきの場合はご指摘ください。</li><li>対象は V4.0 のみです。旧版（3.1.1J03）の内容は扱いません。</li><li>日本の V4.0 試験の形式（問題数・合格点など）は未発表です。本教材では ISTQB の基準（45 問・78 点満点・合格 51 点・120 分）を、その旨を明記して使います。</li></ul><h2 id="免責" tabindex="-1">免責 <a class="header-anchor" href="#免責" aria-label="Permalink to &quot;免責&quot;">​</a></h2><p>本教材の内容の正確性・完全性・最新性について保証するものではありません。本教材を利用したことによって生じたいかなる損害についても、制作者は責任を負いません。学習の最終的な拠りどころは公式シラバスおよび公式情報です。</p><h2 id="商標" tabindex="-1">商標 <a class="header-anchor" href="#商標" aria-label="Permalink to &quot;商標&quot;">​</a></h2><p>ISTQB® は International Software Testing Qualifications Board の登録商標です。JSTQB® は Japan Software Testing Qualifications Board の登録商標です。その他、記載されている会社名・製品名・サービス名は各社の商標または登録商標です。</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("about/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
