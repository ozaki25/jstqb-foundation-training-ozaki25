#!/usr/bin/env node
import { readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// 使い方: node packages/shared/scripts/quiz-validate.mjs <サイトのディレクトリ>
// 例:     node packages/shared/scripts/quiz-validate.mjs sites/fl
// 省略時はカレントディレクトリをサイトとみなす。
const siteDir = resolve(process.argv[2] ?? process.cwd());
const lessonsDir = resolve(siteDir, "docs/lessons");
const dataDir = resolve(siteDir, "docs/quiz/data");

const publicDir = resolve(siteDir, "docs/public");

const validDifficulties = new Set(["easy", "normal", "hard"]);

const nonEmpty = (s) => typeof s === "string" && s.trim().length > 0;

// 図表の形式チェック。表は caption 必須・各行のセル数が見出しと一致、
// 画像は意味の伝わる alt 必須・docs/public に実在、整形済みテキストは本文必須。
function validateFigure(f, at) {
  if (!f || typeof f !== "object") {
    errors.push(`${at} must be an object`);
    return;
  }
  if (f.type === "table") {
    if (!nonEmpty(f.caption)) errors.push(`${at} table caption is empty`);
    if (!Array.isArray(f.headers) || f.headers.length === 0) {
      errors.push(`${at} table headers must be a non-empty array`);
      return;
    }
    if (!Array.isArray(f.rows) || f.rows.length === 0) {
      errors.push(`${at} table rows must be a non-empty array`);
      return;
    }
    f.rows.forEach((row, r) => {
      if (!Array.isArray(row) || row.length !== f.headers.length) {
        errors.push(`${at} row ${r} has ${row?.length ?? "?"} cells (headers: ${f.headers.length})`);
      } else if (row.some((c) => typeof c !== "string")) {
        errors.push(`${at} row ${r} contains a non-string cell`);
      }
    });
  } else if (f.type === "mermaid") {
    if (!nonEmpty(f.code)) errors.push(`${at} mermaid code is empty`);
    else if (/<br\s*\/?>/i.test(f.code)) errors.push(`${at} mermaid labels must use \\n for line breaks, not <br/>`);
    if (!nonEmpty(f.alt) || /^(図|画像|image|figure)$/i.test(f.alt.trim())) {
      errors.push(`${at} mermaid alt must describe the figure (got ${JSON.stringify(f.alt)})`);
    }
  } else if (f.type === "image") {
    if (!nonEmpty(f.alt) || /^(図|画像|image|figure)$/i.test(f.alt.trim())) {
      errors.push(`${at} image alt must describe the figure (got ${JSON.stringify(f.alt)})`);
    }
    if (!nonEmpty(f.src) || !f.src.startsWith("/")) {
      errors.push(`${at} image src must be an absolute path under docs/public (got ${JSON.stringify(f.src)})`);
    } else if (!existsSync(resolve(publicDir, "." + f.src))) {
      errors.push(`${at} image file not found: docs/public${f.src}`);
    }
  } else if (f.type === "pre") {
    if (!nonEmpty(f.text)) errors.push(`${at} pre text is empty`);
  } else {
    errors.push(`${at} unknown figure type: ${JSON.stringify(f.type)}`);
  }
}
const idPattern = /^q\d{3,4}$/;

const lessonDirs = new Set(
  readdirSync(lessonsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^lesson\d+$/.test(e.name))
    .map((e) => e.name),
);

const errors = [];
const seenIds = new Map();
let totalCount = 0;
const perChapter = {};
const perDifficulty = { easy: 0, normal: 0, hard: 0 };

// docs/quiz/data/chapterN.ts を章番号順に検証する（章数はサイトごとに異なる）
const chapterNums = readdirSync(dataDir)
  .map((f) => /^chapter(\d+)\.ts$/.exec(f)?.[1])
  .filter(Boolean)
  .map(Number)
  .sort((a, b) => a - b);
if (chapterNums.length === 0) {
  errors.push(`no chapterN.ts found in ${dataDir}`);
}
chapterNums.forEach((n, i) => {
  if (n !== i + 1) errors.push(`chapter files are not contiguous from 1 (found chapter${n}.ts at position ${i + 1})`);
});

for (const ch of chapterNums) {
  const file = resolve(dataDir, `chapter${ch}.ts`);
  if (!existsSync(file)) {
    errors.push(`[chapter${ch}] file missing: ${file}`);
    continue;
  }

  const mod = await import(file);
  const quizzes = mod[`chapter${ch}`];

  if (!Array.isArray(quizzes)) {
    errors.push(`[chapter${ch}] export 'chapter${ch}' is not an array`);
    continue;
  }

  perChapter[ch] = quizzes.length;
  totalCount += quizzes.length;

  for (const [i, q] of quizzes.entries()) {
    const at = `[chapter${ch}#${i}]`;

    if (typeof q.id !== "string" || !idPattern.test(q.id)) {
      errors.push(`${at} invalid id: ${JSON.stringify(q.id)}`);
    } else if (seenIds.has(q.id)) {
      errors.push(`${at} duplicate id '${q.id}' (also in ${seenIds.get(q.id)})`);
    } else {
      seenIds.set(q.id, `chapter${ch}#${i}`);
    }

    if (typeof q.lesson !== "string" || !lessonDirs.has(q.lesson)) {
      errors.push(`${at} lesson '${q.lesson}' does not exist in docs/lessons/`);
    }

    if (!validDifficulties.has(q.difficulty)) {
      errors.push(`${at} invalid difficulty: ${JSON.stringify(q.difficulty)}`);
    } else {
      perDifficulty[q.difficulty]++;
    }

    if (typeof q.question !== "string" || q.question.trim().length === 0) {
      errors.push(`${at} question is empty`);
    }

    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      errors.push(`${at} choices must have exactly 4 items (got ${q.choices?.length ?? "?"})`);
    } else {
      const distinct = new Set(q.choices.map((c) => c.trim()));
      if (distinct.size !== 4) {
        errors.push(`${at} choices contain duplicates`);
      }
      for (const [j, c] of q.choices.entries()) {
        if (typeof c !== "string" || c.trim().length === 0) {
          errors.push(`${at} choice[${j}] is empty`);
        }
      }
    }

    if (![0, 1, 2, 3].includes(q.answer)) {
      errors.push(`${at} answer must be 0-3 (got ${q.answer})`);
    }

    if (typeof q.explanation !== "string" || q.explanation.trim().length === 0) {
      errors.push(`${at} explanation is empty`);
    }

    for (const key of ["figures", "explanationFigures"]) {
      if (q[key] === undefined) continue;
      if (!Array.isArray(q[key])) {
        errors.push(`${at} ${key} must be an array`);
        continue;
      }
      q[key].forEach((f, k) => validateFigure(f, `${at} ${key}[${k}]`));
    }
  }
}

console.log("=== Quiz validation ===");
console.log(`Total: ${totalCount} questions`);
for (const ch of chapterNums) {
  console.log(`  chapter${ch}: ${perChapter[ch] ?? 0}`);
}
console.log(
  `Difficulty: easy=${perDifficulty.easy} normal=${perDifficulty.normal} hard=${perDifficulty.hard}`,
);

if (errors.length > 0) {
  console.error(`\n✗ ${errors.length} error(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

console.log("\n✓ All quizzes valid.");
