import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readingCounts, readingStatus, reviewReadingPaths, skippedBinaryNote } from "./reading-progress.ts";

describe("reading progress", () => {
  it("counts unique paths and ignores marks outside the list", () => {
    assert.deepEqual(readingCounts(["a.ts", "b.ts", "a.ts"], new Set(["b.ts", "gone.ts"])), {
      total: 2,
      viewed: 1,
      left: 1,
    });
  });

  it("names files still to read, and a list the reader finished", () => {
    const none = readingStatus(["a.ts", "b.ts"], new Set());
    assert.equal(none?.label, "2 left");
    assert.equal(none?.filesLabel, "2 files left");

    const one = readingStatus(["a.ts"], new Set());
    assert.equal(one?.label, "1 left");
    assert.equal(one?.filesLabel, "1 file left");

    const done = readingStatus(["a.ts"], new Set(["a.ts"]));
    assert.equal(done?.left, 0);
    assert.equal(done?.label, "Viewed");
    assert.equal(done?.filesLabel, "All files viewed");
  });

  it("has no mark when there are no files", () => {
    assert.equal(readingStatus([], new Set(["a.ts"])), null);
    assert.deepEqual(readingCounts([], new Set()), { total: 0, viewed: 0, left: 0 });
  });

  it("unions group, unassigned, and lockfile paths once", () => {
    assert.deepEqual(
      reviewReadingPaths({
        groups: [{ files: ["a.ts", "b.ts"] }, { files: ["b.ts"] }],
        unassigned: { files: ["c.ts"] },
        lockfiles: { files: ["package-lock.json", "a.ts"] },
      }),
      ["a.ts", "b.ts", "c.ts", "package-lock.json"],
    );
  });

  it("names skipped binaries and ignores other skip reasons", () => {
    assert.equal(
      skippedBinaryNote([
        { path: "assets/dot.bin", reason: "binary" },
        { path: "pnpm-lock.yaml", reason: "lockfile" },
      ]),
      "assets/dot.bin",
    );
    assert.equal(skippedBinaryNote([{ path: "pnpm-lock.yaml", reason: "lockfile" }]), null);
  });
});
