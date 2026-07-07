// レッスンの h1 が `# lessonNN: テーマ — サブタイトル` の形式かを検査する。
// ファイル名の lessonNN と h1 の番号がずれていないか、手順の記憶に頼らず
// 機械チェックで必ず気づけるようにする。
// 使い方: node .claude/hooks/check-lesson-title.js <ファイル>
// 例:     node .claude/hooks/check-lesson-title.js docs/lessons/lesson07/index.md
// 形式どおりなら exit 0、崩れていれば理由を出力して exit 1。
const fs = require("fs");
const path = require("path");

const [, , file] = process.argv;
if (!file) {
  console.log("usage: node check-lesson-title.js <file>");
  process.exit(2);
}

// ファイルパスから lessonNN（NN はゼロ埋め2桁）を取り出す。
// 例: docs/lessons/lesson07/index.md -> "07"
const dirName = path.basename(path.dirname(path.resolve(file)));
const m = dirName.match(/^lesson(\d{2})$/);
if (!m) {
  console.log(
    `ファイルパスから lessonNN を特定できません: ${file}\n` +
      `  期待するディレクトリ名: lessonNN（NN はゼロ埋め2桁。例: lesson07）\n` +
      `  実際: ${dirName}`
  );
  process.exit(2);
}
const lessonNo = m[1];

let firstLine;
try {
  firstLine = fs.readFileSync(file, "utf8").split("\n")[0].trim();
} catch (e) {
  console.log(`ファイルを読めません: ${file}`);
  process.exit(2);
}

// 期待する形式: "# lessonNN: <非空のタイトル>"
const expected = new RegExp(`^# lesson${lessonNo}: \\S`);
if (!expected.test(firstLine)) {
  console.log(
    `h1 が期待する形式ではありません。\n` +
      `  期待: # lesson${lessonNo}: <テーマ名> — <サブタイトル>\n` +
      `  実際: ${firstLine || "(空)"}`
  );
  process.exit(1);
}
process.exit(0);
