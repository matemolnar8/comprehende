import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import { readHunkIndex } from "../git/diff.ts";
import { coverReview, joinCoverage } from "./coverage.ts";
import { cmdValidate } from "../cli/commands.ts";
import { writeCoveringDocument } from "../test/covering-document.ts";
import { createExampleRepo, SECRET_ADD, SECRET_DEL } from "../test/example-repo.ts";
import type { LiveHunk } from "../schema/types.ts";

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("coverage join", () => {
  it("reports unassigned and stale refs without inventing hunks", () => {
    const live: LiveHunk[] = [
      {
        path: "a.ts",
        oldStart: 1,
        oldLines: 1,
        newStart: 1,
        newLines: 2,
        header: "@@ -1,1 +1,2 @@",
        lines: [{ kind: "add", oldNumber: null, newNumber: 1, text: "x" }],
        patch: "@@ -1,1 +1,2 @@\n+x\n",
      },
    ];
    const coverage = joinCoverage(
      {
        version: 1,
        source: { baseRef: "a", headRef: "b" },
        size: "small",
        title: "Coverage join",
        summary: "Joins live hunks to refs.",
        groups: [
          {
            id: "g",
            title: "G",
            why: "Joins live hunks to refs.",
            summary: "",
            suggestedOrder: 0,
            hunkRefs: [
              { path: "a.ts", oldStart: 1, oldLines: 1, newStart: 1, newLines: 2 },
              { path: "missing.ts", oldStart: 4, oldLines: 1, newStart: 4, newLines: 1 },
            ],
          },
        ],
      },
      live,
    );
    assert.equal(coverage.assignedHunks, 1);
    assert.equal(coverage.stale.length, 1);
    assert.equal(coverage.unassigned.length, 0);

    const uncovered = joinCoverage(
      {
        version: 1,
        source: { baseRef: "a", headRef: "b" },
        size: "small",
        title: "Coverage join",
        summary: "Joins live hunks to refs.",
        groups: [{ id: "g", title: "G", why: "Joins live hunks to refs.", summary: "", suggestedOrder: 0, hunkRefs: [] }],
      },
      live,
    );
    assert.equal(uncovered.unassigned.length, 1);
    assert.equal(uncovered.unassigned[0]?.path, "a.ts");
  });

  it("ignores lockfile hunk refs; lockfiles are not coverage hunks", () => {
    const coverage = joinCoverage(
      {
        version: 1,
        source: { baseRef: "a", headRef: "b" },
        size: "small",
        title: "Lockfiles skipped",
        summary: "Lockfiles are not coverage hunks.",
        groups: [
          {
            id: "g",
            title: "G",
            why: "Lockfiles stay in skipped.",
            summary: "",
            suggestedOrder: 0,
            hunkRefs: [
              { path: "package-lock.json", oldStart: 12, oldLines: 40, newStart: 12, newLines: 44 },
              { path: "package-lock.json", oldStart: 0, oldLines: 0, newStart: 0, newLines: 0 },
            ],
          },
        ],
      },
      [],
    );
    assert.equal(coverage.stale.length, 0);
    assert.equal(coverage.unassigned.length, 0);
    assert.equal(coverage.assignedHunks, 0);
    assert.equal(coverage.groups[0]?.hunks.length, 0);
  });
});

describe("example repo index/validate", () => {
  it("indexes refs without patch text, coverage fails on extra or missing refs", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const index = await readHunkIndex(repo.root, repo.base, repo.head);
    const encoded = JSON.stringify(index);
    assert.equal(encoded.includes(SECRET_ADD), false);
    assert.equal(encoded.includes(SECRET_DEL), false);
    assert.ok(index.hunks.length >= 4);
    assert.ok(index.skipped.some((item) => item.path === "assets/dot.bin"));
    assert.equal(index.hunks.filter((hunk) => hunk.path === "src/app.ts").length, 2);
    const appHunks = index.hunks.filter((hunk) => hunk.path === "src/app.ts");
    const appFirst = appHunks[0];
    const appSecond = appHunks[1];
    assert.ok(appFirst);
    assert.ok(appSecond);
    const gap = appSecond.newStart - (appFirst.newStart + appFirst.newLines);
    assert.ok(gap > 10, `expected a collapsed gap over 10 lines, got ${gap}`);
    assert.ok(index.hunks.some((hunk) => hunk.path === "src/helpers.ts" && hunk.oldPath === "src/util.ts"));

    const dataPath = join(root, "review.json");
    const document = await writeCoveringDocument(dataPath, index);
    await cmdValidate(repo.root, dataPath);
    const { coverage } = await coverReview(repo.root, document);
    assert.equal(coverage.unassigned.length, 0);
    assert.equal(coverage.stale.length, 0);
    assert.equal(document.groups[0]?.hunkRefs.length, index.hunks.length);

    const broken = structuredClone(document);
    const first = broken.groups[0];
    assert.ok(first);
    first.hunkRefs.push({ path: "nope.ts", oldStart: 1, oldLines: 1, newStart: 1, newLines: 1 });
    const brokenPath = join(root, "broken.json");
    await writeFile(brokenPath, `${JSON.stringify(broken, null, 2)}\n`);
    await assert.rejects(() => cmdValidate(repo.root, brokenPath), /stale/);

    const missing = structuredClone(document);
    missing.groups = missing.groups.map((group) => ({ ...group, hunkRefs: [] }));
    const missingPath = join(root, "missing.json");
    await writeFile(missingPath, `${JSON.stringify(missing, null, 2)}\n`);
    await assert.rejects(() => cmdValidate(repo.root, missingPath), /coverage/);
  });
});
