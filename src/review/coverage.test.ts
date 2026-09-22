import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import { readHunkIndex } from "../git/diff.ts";
import { coverReview, joinCoverage } from "./coverage.ts";
import { cmdValidate } from "../cli/commands.ts";
import { reviewFileBody, writeCoveringDocument } from "../test/covering-document.ts";
import { createExampleRepo, SECRET_ADD, SECRET_DEL } from "../test/example-repo.ts";
import type { LiveHunk, ReviewDocument, ReviewHunkRef } from "../schema/types.ts";

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
              { path: "a.ts", oldStart: 1, newStart: 1 },
              { path: "missing.ts", oldStart: 4, newStart: 4 },
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
            hunkRefs: [{ path: "package-lock.json" }],
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

  it("expands a path to every live hunk of that file and drops none", () => {
    const live = [hunk("a.ts", 1, 1), hunk("a.ts", 20, 30), hunk("b.ts", 4, 4)];
    const coverage = joinCoverage(doc([{ path: "a.ts" }]), live);
    assert.equal(coverage.assignedHunks, 2);
    assert.equal(coverage.unassigned.length, 1);
    assert.equal(coverage.unassigned[0]?.path, "b.ts");
    assert.equal(coverage.stale.length, 0);
    assert.deepEqual(
      coverage.groups[0]?.hunks.map((item) => item.oldStart),
      [1, 20],
    );
  });

  it("matches one compact hunk, including a rename, and flags a stale path", () => {
    const renamed = hunk("src/helpers.ts", 4, 4, { oldPath: "src/util.ts" });
    const live = [hunk("a.ts", 1, 10, { oldLines: 8, newLines: 24 }), renamed];
    const hit = joinCoverage(
      doc([
        { path: "a.ts", oldStart: 1, newStart: 10 },
        { path: "src/helpers.ts", oldPath: "src/util.ts", oldStart: 4, newStart: 4 },
      ]),
      live,
    );
    assert.equal(hit.assignedHunks, 2);
    assert.equal(hit.stale.length, 0);
    assert.equal(hit.unassigned.length, 0);

    const missed = joinCoverage(doc([{ path: "missing.ts" }, { path: "a.ts", oldStart: 9, newStart: 9 }]), live);
    assert.equal(missed.assignedHunks, 0);
    assert.equal(missed.stale.length, 2);
    assert.equal(missed.unassigned.length, 2);
    assert.deepEqual(missed.stale, [{ path: "missing.ts" }, { path: "a.ts", oldStart: 9, newStart: 9 }]);
  });

  it("ignores a lockfile path string", () => {
    const coverage = joinCoverage(doc([{ path: "pnpm-lock.yaml" }]), []);
    assert.equal(coverage.stale.length, 0);
    assert.equal(coverage.assignedHunks, 0);
  });

  it("does not list the same hunk twice when a path and a compact ref overlap", () => {
    const live = [hunk("a.ts", 1, 1), hunk("a.ts", 8, 8)];
    const coverage = joinCoverage(doc([{ path: "a.ts" }, { path: "a.ts", oldStart: 1, newStart: 1 }]), live);
    assert.equal(coverage.groups[0]?.hunks.length, 2);
    assert.equal(coverage.assignedHunks, 2);
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
    first.hunkRefs.push({ path: "nope.ts" });
    const brokenPath = join(root, "broken.json");
    await writeFile(brokenPath, reviewFileBody(broken));
    await assert.rejects(() => cmdValidate(repo.root, brokenPath), /stale/);

    const missing = structuredClone(document);
    missing.groups = missing.groups.map((group) => ({ ...group, hunkRefs: [] }));
    const missingPath = join(root, "missing.json");
    await writeFile(missingPath, `${JSON.stringify(missing, null, 2)}\n`);
    await assert.rejects(() => cmdValidate(repo.root, missingPath), /coverage/);

    const paths = [...new Set(index.hunks.map((item) => item.path))];
    const byPath = join(root, "by-path.json");
    await writeFile(byPath, `${JSON.stringify(withRefs(document, paths), null, 2)}\n`);
    const pathCheck = await cmdValidate(repo.root, byPath);
    assert.equal(pathCheck.assignedHunks, index.hunks.length);
    const loaded = JSON.parse(await readFile(byPath, "utf8")) as { groups: { hunkRefs: unknown[] }[] };
    assert.ok(loaded.groups[0]?.hunkRefs.every((ref) => typeof ref === "string"));

    const appRefs = appHunks.map((item) =>
      item.oldPath !== undefined
        ? `${item.oldPath} -> ${item.path}@${item.oldStart}+${item.newStart}`
        : `${item.path}@${item.oldStart}+${item.newStart}`,
    );
    const others = paths.filter((path) => path !== "src/app.ts");
    const splitPath = join(root, "split.json");
    await writeFile(splitPath, `${JSON.stringify(withRefs(document, [...appRefs, ...others]), null, 2)}\n`);
    const splitCheck = await cmdValidate(repo.root, splitPath);
    assert.equal(splitCheck.assignedHunks, index.hunks.length);

    const dropped = join(root, "dropped.json");
    await writeFile(dropped, `${JSON.stringify(withRefs(document, [...appRefs.slice(1), ...others]), null, 2)}\n`);
    await assert.rejects(() => cmdValidate(repo.root, dropped), /coverage/);
  });
});

function hunk(path: string, oldStart: number, newStart: number, extra?: Partial<LiveHunk>): LiveHunk {
  return {
    path,
    oldStart,
    oldLines: 1,
    newStart,
    newLines: 1,
    header: `@@ -${oldStart},1 +${newStart},1 @@`,
    lines: [],
    patch: "",
    ...extra,
  };
}

function doc(hunkRefs: ReviewHunkRef[]): ReviewDocument {
  return {
    version: 1,
    source: { baseRef: "a", headRef: "b" },
    size: "small",
    title: "Coverage join",
    summary: "Joins live hunks to refs.",
    groups: [{ id: "g", title: "G", why: "Joins live hunks to refs.", summary: "", suggestedOrder: 0, hunkRefs }],
  };
}

function withRefs(document: ReviewDocument, refs: readonly string[]): unknown {
  const group = document.groups[0];
  if (group === undefined) {
    throw new Error("missing group");
  }
  return {
    ...document,
    groups: [{ ...group, hunkRefs: [...refs] }, ...document.groups.slice(1)],
  };
}
