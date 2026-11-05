import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { git } from "../../src/git/exec.ts";
import { initEmptyRepo } from "../../src/test/init-repo.ts";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "vite-plus/test";
import { loadDotEnv } from "./env.ts";

const KEYS = [
  "COMPREHENDE_EVAL_DOTENV_A",
  "COMPREHENDE_EVAL_DOTENV_B",
  "COMPREHENDE_EVAL_DOTENV_C",
] as const;

function save(): Map<string, string | undefined> {
  return new Map(KEYS.map((key) => [key, process.env[key]]));
}

function restore(saved: Map<string, string | undefined>): void {
  for (const [key, value] of saved) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

describe("loadDotEnv", () => {
  it("loads keys, strips quotes, skips comments, and leaves real env alone", async () => {
    const saved = save();
    try {
      const dir = await mkdtemp(join(tmpdir(), "comprehende-dotenv-"));
      await writeFile(
        join(dir, ".env"),
        [
          "# comment",
          "",
          "COMPREHENDE_EVAL_DOTENV_A=abc",
          'COMPREHENDE_EVAL_DOTENV_B="x y"',
          "COMPREHENDE_EVAL_DOTENV_C=from-file",
          "NOEQUALS",
        ].join("\n"),
      );
      process.env.COMPREHENDE_EVAL_DOTENV_C = "real-env";
      await loadDotEnv(dir);
      assert.equal(process.env.COMPREHENDE_EVAL_DOTENV_A, "abc");
      assert.equal(process.env.COMPREHENDE_EVAL_DOTENV_B, "x y");
      assert.equal(process.env.COMPREHENDE_EVAL_DOTENV_C, "real-env");
    } finally {
      restore(saved);
    }
  });

  it("ignores a missing file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "comprehende-dotenv-empty-"));
    await loadDotEnv(dir);
  });

  it("falls back to the main checkout's .env in a worktree", async () => {
    const saved = save();
    try {
      const root = await mkdtemp(join(tmpdir(), "comprehende-dotenv-worktree-"));
      const main = join(root, "main");
      await initEmptyRepo(main);
      await git(main, ["commit", "--allow-empty", "-m", "init"]);
      const worktree = join(root, "wt");
      await git(main, ["worktree", "add", "--detach", worktree]);
      await writeFile(
        join(main, ".env"),
        "COMPREHENDE_EVAL_DOTENV_A=main\nCOMPREHENDE_EVAL_DOTENV_B=main\n",
      );
      await writeFile(join(worktree, ".env"), "COMPREHENDE_EVAL_DOTENV_A=worktree\n");
      await loadDotEnv(worktree);
      assert.equal(process.env.COMPREHENDE_EVAL_DOTENV_A, "worktree");
      assert.equal(process.env.COMPREHENDE_EVAL_DOTENV_B, "main");
    } finally {
      restore(saved);
    }
  });
});
