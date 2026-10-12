import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { withPwa } from "@vite-pwa/vitepress";
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";
import cjkFriendly from "markdown-it-cjk-friendly";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { gitLastUpdated } from "@jstqb/shared/vitepress/git-last-updated.mjs";
import { chapterDefs, lessonId } from "./lessons.mts";

const SITE_TITLE = "JSTQB Advanced Level テストアナリスト 学習コンテンツ";
const BRAND_COLOR = "#6d28d9";

const lessonSidebar = chapterDefs.map((ch) => ({
  text: `第${ch.id}章 ${ch.title}`,
  collapsed: ch.id !== 1,
  items: ch.lessons.map((l) => ({
    text: `${lessonId(l.n)}: ${l.title}`,
    link: `/lessons/${lessonId(l.n)}/`,
  })),
}));

const quizChapterItems = chapterDefs.map((ch) => ({
  text: `${ch.id}章 ${ch.title}`,
  link: `/quiz/chapter${ch.id}/`,
}));

export default withPwa(
  withMermaid(
    defineConfig({
      title: SITE_TITLE,
      description:
        "JSTQB Advanced Level テストアナリスト（CTAL-TA V4.0）の合格を目指す非公式の学習コンテンツ。シラバス V4.0 に沿った全5章30レッスンと、本番形式のドリルで段階的に学べます。",
      lang: "ja",
      lastUpdated: true,
      cleanUrls: true,
      transformPageData(pageData, { siteConfig }) {
        const ts = gitLastUpdated(join(siteConfig.srcDir, pageData.relativePath));
        if (ts) pageData.lastUpdated = ts;
      },
      vite: {
        resolve: {
          // 共通ドリル部品（packages/shared）がこのサイトの問題データを読むための入口
          alias: { "@quiz": fileURLToPath(new URL("../quiz", import.meta.url)) },
        },
      },
      head: [
        ["link", { rel: "icon", href: "/favicon.ico", sizes: "48x48" }],
        ["link", { rel: "icon", href: "/logo.svg", type: "image/svg+xml" }],
        ["link", { rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png" }],
        ["meta", { name: "robots", content: "noindex, nofollow" }],
        ["meta", { name: "googlebot", content: "noindex, nofollow" }],
        ["meta", { name: "theme-color", content: BRAND_COLOR }],
        ["meta", { name: "author", content: "ozaki25" }],
        ["meta", { property: "og:type", content: "website" }],
        ["meta", { property: "og:locale", content: "ja_JP" }],
        ["meta", { property: "og:site_name", content: SITE_TITLE }],
        ["meta", { property: "og:title", content: SITE_TITLE }],
        [
          "meta",
          {
            property: "og:description",
            content:
              "JSTQB Advanced Level テストアナリスト（CTAL-TA V4.0）の合格を目指す非公式の学習コンテンツ。全5章30レッスンと本番形式のドリルで学べます。",
          },
        ],
        ["meta", { property: "og:image", content: "/ogp.png" }],
        ["meta", { name: "twitter:card", content: "summary_large_image" }],
        ["meta", { name: "twitter:title", content: SITE_TITLE }],
        [
          "meta",
          {
            name: "twitter:description",
            content: "JSTQB Advanced Level テストアナリストの非公式学習コンテンツ。30レッスン+ドリル付き。",
          },
        ],
        ["meta", { name: "twitter:image", content: "/ogp.png" }],
      ],
      mermaid: {
        theme: "default",
        themeVariables: {
          primaryColor: "#ede9fe",
          primaryTextColor: "#1e293b",
          primaryBorderColor: BRAND_COLOR,
          lineColor: "#475569",
          // subgraph の背景（既定の黄色は本文の配色と合わないため淡い灰色にする）
          clusterBkg: "#f8fafc",
          clusterBorder: "#94a3b8",
          fontFamily: "sans-serif",
        },
        // useMaxWidth を無効化し、図を固有サイズ（読める大きさ）で描画する。
        // 有効（既定）だと狭い画面でコンテナ幅まで縮小されて文字が読めなくなるため、
        // custom.css で図を横スクロール可能なコンテナに入れ、縮小ではなくスクロールで見せる。
        flowchart: { useMaxWidth: false },
        state: { useMaxWidth: false },
        // HTMLラベル(デフォルト)を使い、CJK文字の高さ計算はブラウザに委ねる。
        // SVG textで描く `htmlLabels: false` では `\n` を超える折り返しが
        // rect の高さに反映されず最終行が切れることがあるため、custom.cssで
        // foreignObject の overflow を visible にして補完する。
      },
      markdown: {
        config(md) {
          md.use(tabsMarkdownPlugin);
          // 日本語の太字（**…**）で、閉じ ** の直前が全角閉じ括弧（）」など）の
          // 場合に強調が描画されない CJK flanking 問題を解消する。
          md.use(cjkFriendly);
        },
      },
      themeConfig: {
        // ナビゲーションバーに表示する短縮タイトル（<title>やSEOには上の title を使う）。
        // 長い正式名称のままだと狭い画面で検索・ハンバーガーが押し出され横スクロールが出る。
        siteTitle: "JSTQB AL-TA 学習コンテンツ",
        // ナビゲーションにサイトのロゴを出し、FL（JSTQB）と AL-TA（TA）をひと目で見分けられるようにする。
        // サイト名の文字が並ぶので、ロゴの alt は空にする（装飾扱い）。
        logo: { src: "/logo.svg", alt: "" },
        nav: [
          { text: "ホーム", link: "/" },
          { text: "ドリル", link: "/quiz/" },
          { text: "出典・免責", link: "/about/" },
        ],
        sidebar: {
          "/lessons/": [
            {
              text: "ナビゲーション",
              items: [
                { text: "ホーム", link: "/" },
                { text: "ドリル", link: "/quiz/" },
                { text: "用語集", link: "/glossary/" },
              ],
            },
            ...lessonSidebar,
          ],
          "/quiz/": [
            {
              text: "ナビゲーション",
              items: [
                { text: "ホーム", link: "/" },
                { text: "レッスン", link: "/lessons/lesson01/" },
                { text: "用語集", link: "/glossary/" },
              ],
            },
            {
              text: "ドリル",
              link: "/quiz/",
              items: [
                { text: "一覧", link: "/quiz/" },
                ...quizChapterItems,
                { text: "ランダム 5 問", link: "/quiz/random-5/" },
                { text: "ランダム 10 問", link: "/quiz/random-10/" },
                { text: "模擬試験（45問）", link: "/quiz/random-45/" },
                { text: "ランダム出題（全問）", link: "/quiz/random/" },
                { text: "間違えた問題を復習", link: "/quiz/review/" },
              ],
            },
          ],
        },
        outline: {
          label: "目次",
        },
        docFooter: {
          prev: "前のレッスン",
          next: "次のレッスン",
        },
        footer: {
          message:
            '本教材は JSTQB Advanced Level シラバス テストアナリスト（Version 4.0.J01）を参考に作成した非公式・非公認の学習コンテンツです。シラバスの著作権は ISTQB® に、日本語翻訳版の著作権は JSTQB®（Translation Copyright © 2005-2026 JSTQB®, all rights reserved）に帰属します。<a href="/about/">出典・免責について</a>',
          copyright: "Content © 2026 / Syllabus © ISTQB®, JSTQB®",
        },
        search: {
          provider: "local",
          options: {
            translations: {
              button: { buttonText: "検索" },
              modal: {
                noResultsText: "見つかりませんでした",
                resetButtonTitle: "リセット",
              },
            },
          },
        },
      },
      pwa: {
        registerType: "autoUpdate",
        manifest: {
          name: SITE_TITLE,
          short_name: "JSTQB AL-TA",
          description: "JSTQB Advanced Level テストアナリストの非公式学習コンテンツ",
          theme_color: BRAND_COLOR,
          background_color: "#ffffff",
          lang: "ja",
          display: "standalone",
          start_url: "/",
          icons: [
            { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
            { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
            {
              src: "maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          // HTML は precache（CacheFirst）に含めない。含めると SW が古い HTML を
          // 返し続け、デプロイ後もハードリロードしないと最新版が出ない。
          // hashed な JS/CSS/画像等はファイル名が変わるので従来どおり precache する。
          globPatterns: ["**/*.{js,css,woff2,png,svg,ico,webp,json}"],
          navigateFallback: null,
          // ナビゲーション（HTML）は NetworkFirst。ネットワークを 5 秒待ち、
          // 取れなければキャッシュにフォールバック（オフライン耐性は維持）。
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "jstqb-al-ta-html",
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      },
    }),
  ),
);
