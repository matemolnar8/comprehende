import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseNameStatus, parseNumstat } from "./name-status.ts";

describe("parseNameStatus", () => {
  it("reads git --name-status -z including renames", () => {
    const stdout = "A\0new.txt\0M\0package-lock.json\0R100\0old.txt\0renamed.txt\0";
    assert.deepEqual(parseNameStatus(stdout), [
      { status: "added", path: "new.txt" },
      { status: "modified", path: "package-lock.json" },
      { status: "renamed", path: "renamed.txt", oldPath: "old.txt" },
    ]);
  });
});

describe("parseNumstat", () => {
  it("reads git --numstat -z including renames", () => {
    const stdout = ["1\t0\tnew.txt", "1\t1\tpackage-lock.json", "0\t0\t", "old.txt", "renamed.txt", ""].join("\0");
    const stats = parseNumstat(stdout);
    assert.deepEqual(stats.get("new.txt"), { path: "new.txt", added: 1, removed: 0 });
    assert.deepEqual(stats.get("package-lock.json"), { path: "package-lock.json", added: 1, removed: 1 });
    assert.deepEqual(stats.get("renamed.txt"), {
      path: "renamed.txt",
      oldPath: "old.txt",
      added: 0,
      removed: 0,
    });
  });

  it("treats binary counts as null", () => {
    const stats = parseNumstat("-\t-\tbun.lockb\0");
    assert.deepEqual(stats.get("bun.lockb"), { path: "bun.lockb", added: null, removed: null });
  });
});
