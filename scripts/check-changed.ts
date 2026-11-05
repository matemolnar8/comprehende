/**
 * `pnpm check:changed [vp check flags]`: runs `vp check` on files changed since the merge-base
 * with origin/main, plus untracked files. `--no-error-on-unmatched-pattern` keeps a list with
 * only markdown or other files the linter skips from failing with "No files found to lint".
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const BASE = "origin/main";

function gitLines(args: string[]): string[] {
  return execFileSync("git", args, { encoding: "utf8" }).split("\n").filter(Boolean);
}

const mergeBase = gitLines(["merge-base", BASE, "HEAD"])[0];
if (mergeBase === undefined) {
  throw new Error(`No merge-base with ${BASE}. Run git fetch origin main.`);
}
const files = [
  ...new Set([
    ...gitLines(["diff", "--name-only", "--diff-filter=d", mergeBase]),
    ...gitLines(["ls-files", "--others", "--exclude-standard"]),
  ]),
].filter((file) => existsSync(file));

if (files.length === 0) {
  console.log(`No files changed against ${BASE}.`);
} else {
  const check = spawnSync(
    "vp",
    ["check", "--no-error-on-unmatched-pattern", ...process.argv.slice(2), ...files],
    { stdio: "inherit", shell: process.platform === "win32" },
  );
  process.exitCode = check.status ?? 1;
}
