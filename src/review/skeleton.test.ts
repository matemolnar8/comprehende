import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { cmdIndex, cmdReview, cmdValidate } from "../cli/commands.ts";
import { toHunkRef } from "../git/diff.ts";
import { createExampleRepo } from "../test/example-repo.ts";
import { skeletonDocument } from "./skeleton.ts";

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("skeletonDocument", () => {
  it("covers every index hunk and leaves interpretation empty", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-skeleton-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const index = await cmdIndex(repo.root, repo.base, repo.head);
    const document = skeletonDocument(index);

    assert.ok(index.hunks.length > 0);
    assert.deepEqual(document.source, index.source);
    assert.equal(document.groups.length, 1);
    assert.deepEqual(document.groups[0]?.hunkRefs, index.hunks.map(toHunkRef));
    assert.equal(document.title, "Untitled");
    assert.equal(document.summary, "Fill this review.");
    assert.equal(document.why, undefined);
    assert.deepEqual(document.lookFor, []);
    assert.deepEqual(document.sources, []);
    assert.deepEqual(document.parts, []);
    assert.equal(document.groups[0]?.id, "ungrouped");
    assert.equal(document.groups[0]?.summary, "");
    assert.equal(document.groups[0]?.part, undefined);
    assert.deepEqual(document.groups[0]?.lookFor, []);
    assert.deepEqual(document.groups[0]?.dependsOn, []);
    assert.deepEqual(document.groups[0]?.sources, []);
    assert.doesNotMatch(JSON.stringify(document), /All changes/);
  });
});

describe("cmdReview", () => {
  it("writes a covering skeleton that validate accepts", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-review-cmd-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const dataPath = join(root, "out", "review.json");
    const index = await cmdIndex(repo.root, repo.base, repo.head);
    const { document } = await cmdReview(repo.root, dataPath, repo.base, repo.head);
    const raw: unknown = JSON.parse(await readFile(dataPath, "utf8"));
    const validated = await cmdValidate(repo.root, dataPath);

    assert.ok(isRecord(raw));
    assert.equal(raw.title, "Untitled");
    assert.equal(raw.why, undefined);
    assert.deepEqual(raw.lookFor, []);
    assert.deepEqual(raw.sources, []);
    assert.deepEqual(raw.parts, []);
    const group = document.groups[0];
    assert.deepEqual(group?.lookFor, []);
    assert.deepEqual(group?.dependsOn, []);
    assert.deepEqual(group?.sources, []);
    assert.deepEqual(document.groups[0]?.hunkRefs, index.hunks.map(toHunkRef));
    assert.equal(document.groups[0]?.hunkRefs.length, index.hunks.length);
    assert.deepEqual(validated.document, document);
  });
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
