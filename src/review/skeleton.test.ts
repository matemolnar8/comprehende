import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { cmdIndex, cmdReview, cmdValidate } from "../cli/commands.ts";
import { createExampleRepo } from "../test/example-repo.ts";
import { coverReview } from "./coverage.ts";
import { skeletonDocument, skeletonPaths } from "./skeleton.ts";

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
    const paths = skeletonPaths(index);
    assert.deepEqual(document.groups[0]?.hunkRefs, paths);
    assert.ok(paths.length < index.hunks.length);
    for (const hunk of index.hunks) {
      assert.ok(paths.includes(hunk.path));
    }
    assert.equal(document.title, "Untitled");
    assert.equal(document.summary, "Fill this review.");
    assert.equal("why" in document, false);
    assert.equal("lookFor" in document, false);
    assert.equal("sources" in document, false);
    assert.equal("parts" in document, false);
    assert.equal(document.groups[0]?.id, "ungrouped");
    assert.equal(document.groups[0]?.summary, "");
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
    assert.equal(raw.lookFor, undefined);
    assert.equal(raw.sources, undefined);
    assert.equal(raw.parts, undefined);
    const paths = skeletonPaths(index);
    assert.ok(Array.isArray(raw.groups));
    const writtenGroup = raw.groups[0];
    assert.ok(isRecord(writtenGroup));
    assert.deepEqual(writtenGroup.hunkRefs, paths);
    assert.ok(paths.every((path) => typeof path === "string"));
    assert.deepEqual(
      document.groups[0]?.hunkRefs,
      paths.map((path) => ({ path })),
    );
    assert.deepEqual(validated.document, document);
    assert.equal(validated.assignedHunks, index.hunks.length);
    const { coverage } = await coverReview(repo.root, document);
    assert.equal(coverage.unassigned.length, 0);
    assert.equal(coverage.stale.length, 0);
    assert.equal(coverage.assignedHunks, index.hunks.length);
    const app = coverage.groups[0]?.hunks.filter((hunk) => hunk.path === "src/app.ts") ?? [];
    assert.equal(app.length, index.hunks.filter((hunk) => hunk.path === "src/app.ts").length);
    assert.ok(app.length >= 2);
  });
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
