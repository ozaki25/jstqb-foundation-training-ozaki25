import { execFileSync } from "node:child_process";
import { basename, dirname } from "node:path";

// VitePress 標準の lastUpdated は `git log -1 -- <file>` で取るため、
// ファイルを移動すると全ページが「移動した日」になる。
// リネームをたどり（--follow）、移動だけのコミット（R）を除いて（--diff-filter=AM）
// 本文を最後に変えた日時を返す。取れないときは undefined（VitePress の値をそのまま使う）。
/**
 * @param {string} absPath
 * @returns {number | undefined}
 */
export function gitLastUpdated(absPath) {
  try {
    const out = execFileSync(
      "git",
      ["log", "--follow", "--diff-filter=AM", "-1", "--format=%at", "--", basename(absPath)],
      { cwd: dirname(absPath), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    return out ? Number(out) * 1000 : undefined;
  } catch {
    return undefined;
  }
}
