import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { withPwa } from "@vite-pwa/vitepress";
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";
import cjkFriendly from "markdown-it-cjk-friendly";

export default withPwa(
  withMermaid(
    defineConfig({
      title: "JSTQB Foundation Level 学習コンテンツ",
      description:
        "JSTQB Foundation Level（テスト技術者資格）の合格を目指す非公式の学習コンテンツ。シラバス V4.0 に沿った全6章30レッスンと、本番形式のドリルで段階的に学べます。",
      lang: "ja",
      lastUpdated: true,
      cleanUrls: true,
      head: [
        ["link", { rel: "icon", href: "/favicon.ico", sizes: "48x48" }],
        ["link", { rel: "icon", href: "/logo.svg", type: "image/svg+xml" }],
        ["link", { rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png" }],
        ["meta", { name: "robots", content: "noindex, nofollow" }],
        ["meta", { name: "googlebot", content: "noindex, nofollow" }],
        ["meta", { name: "theme-color", content: "#0b5c9c" }],
        ["meta", { name: "author", content: "ozaki25" }],
        ["meta", { property: "og:type", content: "website" }],
        ["meta", { property: "og:locale", content: "ja_JP" }],
        ["meta", { property: "og:site_name", content: "JSTQB Foundation Level 学習コンテンツ" }],
        ["meta", { property: "og:title", content: "JSTQB Foundation Level 学習コンテンツ" }],
        [
          "meta",
          {
            property: "og:description",
            content:
              "JSTQB Foundation Level の合格を目指す非公式の学習コンテンツ。シラバス V4.0 準拠、全6章30レッスンと本番形式のドリルで学べます。",
          },
        ],
        ["meta", { property: "og:image", content: "/ogp.png" }],
        ["meta", { name: "twitter:card", content: "summary_large_image" }],
        ["meta", { name: "twitter:title", content: "JSTQB Foundation Level 学習コンテンツ" }],
        [
          "meta",
          {
            name: "twitter:description",
            content: "JSTQB Foundation Level の合格を目指す非公式の学習コンテンツ。30レッスン+ドリル付き。",
          },
        ],
        ["meta", { name: "twitter:image", content: "/ogp.png" }],
      ],
      mermaid: {
        theme: "default",
        themeVariables: {
          primaryColor: "#e3f0fa",
          primaryTextColor: "#1e293b",
          primaryBorderColor: "#0b5c9c",
          lineColor: "#475569",
          fontFamily: "sans-serif",
        },
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
        siteTitle: "JSTQB FL 学習コンテンツ",
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
            {
              text: "第1章 テストの基礎",
              collapsed: false,
              items: [
                { text: "lesson01: テストとは何か", link: "/lessons/lesson01/" },
                { text: "lesson02: なぜテストが必要か", link: "/lessons/lesson02/" },
                { text: "lesson03: テストの7原則", link: "/lessons/lesson03/" },
                { text: "lesson04: テストプロセス", link: "/lessons/lesson04/" },
                { text: "lesson05: テストに必要なスキルとチーム", link: "/lessons/lesson05/" },
              ],
            },
            {
              text: "第2章 SDLC全体を通してのテスト",
              collapsed: true,
              items: [
                { text: "lesson06: 開発ライフサイクルとテスト", link: "/lessons/lesson06/" },
                { text: "lesson07: DevOps・シフトレフト・ふりかえり", link: "/lessons/lesson07/" },
                { text: "lesson08: テストレベル", link: "/lessons/lesson08/" },
                { text: "lesson09: テストタイプと確認・リグレッションテスト", link: "/lessons/lesson09/" },
                { text: "lesson10: メンテナンステスト", link: "/lessons/lesson10/" },
              ],
            },
            {
              text: "第3章 静的テスト",
              collapsed: true,
              items: [
                { text: "lesson11: 静的テストの基礎", link: "/lessons/lesson11/" },
                { text: "lesson12: レビュープロセス", link: "/lessons/lesson12/" },
                { text: "lesson13: レビュー種別と成功要因", link: "/lessons/lesson13/" },
              ],
            },
            {
              text: "第4章 テスト分析と設計",
              collapsed: true,
              items: [
                { text: "lesson14: テスト技法の種類", link: "/lessons/lesson14/" },
                { text: "lesson15: 同値分割法", link: "/lessons/lesson15/" },
                { text: "lesson16: 境界値分析", link: "/lessons/lesson16/" },
                { text: "lesson17: デシジョンテーブルテスト", link: "/lessons/lesson17/" },
                { text: "lesson18: 状態遷移テスト", link: "/lessons/lesson18/" },
                { text: "lesson19: ホワイトボックステスト", link: "/lessons/lesson19/" },
                { text: "lesson20: 経験ベースのテスト技法", link: "/lessons/lesson20/" },
                { text: "lesson21: 協働的テストアプローチ", link: "/lessons/lesson21/" },
              ],
            },
            {
              text: "第5章 テスト活動のマネジメント",
              collapsed: true,
              items: [
                { text: "lesson22: テスト計画", link: "/lessons/lesson22/" },
                { text: "lesson23: 開始基準・終了基準と見積り", link: "/lessons/lesson23/" },
                { text: "lesson24: 優先順位付けとテストピラミッド", link: "/lessons/lesson24/" },
                { text: "lesson25: リスクベースドテスト", link: "/lessons/lesson25/" },
                { text: "lesson26: テストのモニタリングとコントロール", link: "/lessons/lesson26/" },
                { text: "lesson27: 構成管理", link: "/lessons/lesson27/" },
                { text: "lesson28: 欠陥マネジメント", link: "/lessons/lesson28/" },
              ],
            },
            {
              text: "第6章 テストツール",
              collapsed: true,
              items: [
                { text: "lesson29: テストツールの種類と支援", link: "/lessons/lesson29/" },
                { text: "lesson30: テスト自動化の利点とリスク", link: "/lessons/lesson30/" },
              ],
            },
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
                { text: "1章 テストの基礎", link: "/quiz/chapter1/" },
                { text: "2章 SDLC全体を通してのテスト", link: "/quiz/chapter2/" },
                { text: "3章 静的テスト", link: "/quiz/chapter3/" },
                { text: "4章 テスト分析と設計", link: "/quiz/chapter4/" },
                { text: "5章 テスト活動のマネジメント", link: "/quiz/chapter5/" },
                { text: "6章 テストツール", link: "/quiz/chapter6/" },
                { text: "ランダム 5 問", link: "/quiz/random-5/" },
                { text: "ランダム 10 問", link: "/quiz/random-10/" },
                { text: "模擬試験（40問）", link: "/quiz/random-40/" },
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
            '本教材は JSTQB Foundation Level シラバス（Version 2023 V4.0.J02）を参考に作成した非公式・非公認の学習コンテンツです。シラバスの著作権は ISTQB® に、日本語翻訳版の著作権は JSTQB®（Translation Copyright © 2005-2023 JSTQB®, all rights reserved）に帰属します。<a href="/about/">出典・免責について</a>',
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
          name: "JSTQB Foundation Level 学習コンテンツ",
          short_name: "JSTQB FL",
          description: "JSTQB Foundation Level の非公式学習コンテンツ",
          theme_color: "#0b5c9c",
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
                cacheName: "jstqb-fl-html",
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
