import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { git } from "./exec.ts";
import { readDiff } from "./diff.ts";
import { initEmptyRepo } from "../test/init-repo.ts";

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

const BLOCK = [
  "export function movedBlock(): number {",
  "  const value = 42;",
  '  const label = "relocated-body-text";',
  "  return value + label.length;",
  "}",
].join("\n");

describe("markMovedLines", () => {
  it("marks the same blocks git --color-moved marks, and keeps rename and copy", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-moved-"));
    roots.push(root);
    await initEmptyRepo(root);
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(join(root, "src/alpha.ts"), `export const stay = 1;\n${BLOCK}\nexport const tail = 1;\n`, "utf8");
    await writeFile(join(root, "src/beta.ts"), "export const other = 1;\n", "utf8");
    await writeFile(join(root, "src/keep.ts"), "export const kept = 1;\nexport const still = 2;\n", "utf8");
    await writeFile(
      join(root, "src/util.ts"),
      'export const label = "util";\nexport function help(): number {\n  return 1;\n}\n',
      "utf8",
    );
    await git(root, ["add", "."]);
    await git(root, ["commit", "-m", "base"]);

    await mkdir(join(root, "lib"), { recursive: true });
    await git(root, ["mv", "src/keep.ts", "lib/keep.ts"]);
    await writeFile(join(root, "src/alpha.ts"), "export const stay = 1;\nexport const tail = 1;\n", "utf8");
    await writeFile(
      join(root, "src/beta.ts"),
      `export const other = 1;\n${BLOCK}\nexport const added = true;\n`,
      "utf8",
    );
    await git(root, ["mv", "src/util.ts", "src/helpers.ts"]);
    await writeFile(
      join(root, "src/helpers.ts"),
      'export const label = "helpers";\nexport function help(): number {\n  return 1;\n}\n',
      "utf8",
    );
    await writeFile(join(root, "src/beta.copy.ts"), "export const other = 1;\n", "utf8");
    await git(root, ["add", "-A"]);
    await git(root, ["commit", "-m", "head"]);

    const base = (await git(root, ["rev-parse", "HEAD~1"])).trim();
    const head = (await git(root, ["rev-parse", "HEAD"])).trim();
    const files = await readDiff(root, base, head);

    const keep = files.find((file) => file.path === "lib/keep.ts");
    assert.ok(keep);
    assert.deepEqual(keep.relocation, { kind: "rename", similarity: 100 });
    assert.equal(keep.oldPath, "src/keep.ts");
    assert.equal(keep.hunks[0]?.header, "relocation");
    assert.equal(keep.hunks[0]?.lines.length, 0);

    const copy = files.find((file) => file.path === "src/beta.copy.ts");
    assert.ok(copy);
    assert.equal(copy.relocation?.kind, "copy");
    assert.equal(copy.relocation?.similarity, 100);
    assert.equal(copy.oldPath, "src/beta.ts");

    const helpers = files.find((file) => file.path === "src/helpers.ts");
    assert.ok(helpers);
    assert.equal(helpers.relocation?.kind, "rename");
    assert.ok((helpers.relocation?.similarity ?? 0) >= 50);
    assert.ok((helpers.hunks[0]?.lines.length ?? 0) > 0);

    const ours = movedKeys(files);
    const colored = await git(root, [
      "-c",
      "color.diff.oldMoved=magenta",
      "-c",
      "color.diff.newMoved=cyan",
      "diff",
      "--find-renames",
      "--find-copies",
      "--color-moved=plain",
      "--color=always",
      `${base}...${head}`,
    ]);
    assert.deepEqual(ours, movedKeysFromColor(colored));

    const beta = files.find((file) => file.path === "src/beta.ts");
    assert.ok(beta);
    const fromAlpha = beta.hunks.flatMap((hunk) => hunk.lines).find((line) => line.moved !== undefined);
    assert.equal(fromAlpha?.moved?.path, "src/alpha.ts");
    const realAdd = beta.hunks.flatMap((hunk) => hunk.lines).find((line) => line.text.includes("added = true"));
    assert.equal(realAdd?.moved, undefined);
  });
});

function movedKeys(files: { path: string; hunks: { lines: { kind: string; text: string; moved?: unknown }[] }[] }[]): string[] {
  const keys: string[] = [];
  for (const file of files) {
    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (line.moved !== undefined && (line.kind === "add" || line.kind === "del")) {
          keys.push(`${file.path}\0${line.kind}\0${line.text}`);
        }
      }
    }
  }
  return keys.sort();
}

function movedKeysFromColor(stdout: string): string[] {
  const keys: string[] = [];
  let path = "";
  for (const line of stdout.split("\n")) {
    const header = /^diff --git a\/(.+) b\/(.+)$/.exec(stripAnsi(line));
    if (header?.[2] !== undefined) {
      path = header[2];
      continue;
    }
    const added = /^(?:\x1b\[36m\+\x1b\[m\x1b\[36m|\x1b\[36m\+)(.*)\x1b\[m$/.exec(line);
    if (added?.[1] !== undefined && !added[1].startsWith("@")) {
      keys.push(`${path}\0add\0${added[1]}`);
      continue;
    }
    const deleted = /^(?:\x1b\[35m-\x1b\[m\x1b\[35m|\x1b\[35m-)(.*)\x1b\[m$/.exec(line);
    if (deleted?.[1] !== undefined) {
      keys.push(`${path}\0del\0${deleted[1]}`);
    }
  }
  return keys.sort();
}

function stripAnsi(line: string): string {
  return line.replaceAll(/\x1b\[[0-9;]*m/g, "");
}
