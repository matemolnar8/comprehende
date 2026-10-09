import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDigest, formatDigest } from "./digest.ts";
import type { DiffFile, LiveHunk } from "../schema/types.ts";

function hunk(
  path: string,
  oldStart: number,
  newStart: number,
  lines: LiveHunk["lines"],
): LiveHunk {
  return {
    path,
    oldStart,
    oldLines: lines.length,
    newStart,
    newLines: lines.length,
    header: "x",
    lines,
    patch: "",
  };
}

function add(text: string, n = 1): LiveHunk["lines"][number] {
  return { kind: "add", oldNumber: null, newNumber: n, text };
}

function del(text: string, n = 1): LiveHunk["lines"][number] {
  return { kind: "del", oldNumber: n, newNumber: null, text };
}

function file(path: string, hunks: LiveHunk[], extra: Partial<DiffFile> = {}): DiffFile {
  return {
    path,
    status: "modified",
    binary: false,
    image: false,
    headerPatch: "",
    patch: "",
    hunks,
    ...extra,
  };
}

describe("buildDigest", () => {
  it("classifies test, docs, and logic files and pairs tests", () => {
    const digest = buildDigest([
      file("src/auth/session.ts", [
        hunk("src/auth/session.ts", 1, 1, [add("export function setSessionCookie() {}")]),
      ]),
      file("src/auth/session.test.ts", [hunk("src/auth/session.test.ts", 0, 1, [add("test()")])]),
      file("README.md", [hunk("README.md", 1, 1, [add("docs")])]),
    ]);
    assert.equal(digest.totalHunks, 3);
    assert.equal(digest.files[0]?.kind, "logic");
    assert.deepEqual(digest.files[0]?.hunks[0]?.symbols, ["setSessionCookie"]);
    assert.equal(digest.files[1]?.kind, "test");
    assert.equal(digest.files[1]?.pairsWith, "src/auth/session");
    assert.equal(digest.files[2]?.kind, "docs");
  });

  it("marks pure moves and identical copies", () => {
    const moved = hunk("b.ts", 1, 5, [
      { ...del("const value = 42;", 1), moved: { path: "a.ts", line: 9 } },
      { ...add("const value = 42;", 5), moved: { path: "a.ts", line: 9 } },
    ]);
    const digest = buildDigest([
      file("a.ts", [hunk("a.ts", 9, 9, [del("const value = 42;", 9)])]),
      file("b.ts", [moved]),
      file("x/SKILL.md", [hunk("x/SKILL.md", 1, 1, [add("same")])]),
      file("y/SKILL.md", [hunk("y/SKILL.md", 1, 1, [add("same")])]),
    ]);
    assert.equal(digest.files[1]?.kind, "move");
    assert.equal(digest.files[3]?.mirrorOf, "x/SKILL.md");
    assert.equal(digest.files[2]?.mirrorOf, undefined);
  });

  it("prefers rename over test and skips binaries", () => {
    const digest = buildDigest([
      file("a.test.ts", [], {
        oldPath: "b.test.ts",
        status: "renamed",
        relocation: { kind: "rename" },
      }),
      file("dot.bin", [], { binary: true }),
    ]);
    assert.equal(digest.files.length, 1);
    assert.equal(digest.files[0]?.kind, "rename");
  });

  it("prints one line per file with no patch text", () => {
    const secret = "SECRET_LINE_BODY";
    const text = formatDigest(
      buildDigest([file("a.ts", [hunk("a.ts", 3, 4, [add(secret), del("old")])])]),
      "base...head",
    );
    assert.match(text, /# Digest base\.\.\.head — 1 file, 1 hunk/);
    assert.match(text, /- a\.ts · modified \+1\/-1 · logic/);
    assert.equal(text.includes(secret), false);
  });
});
