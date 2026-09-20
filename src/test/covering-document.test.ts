import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import { cmdIndex, cmdValidate } from "../cli/commands.ts";
import { parseReviewDocument } from "../schema/parse.ts";
import {
  MIXED_GROUP_APP,
  MIXED_GROUP_APP_TEST,
  MIXED_PART_APP,
  MIXED_PART_DOCS,
  MIXED_PART_LIB,
  coveringDocument,
  mixedCoveringDocument,
} from "./covering-document.ts";
import { createExampleRepo } from "./example-repo.ts";
import type { ReviewDocument } from "../schema/types.ts";

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("covering documents", () => {
  it("keeps the unlabeled covering document as one group", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-cover-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const index = await cmdIndex(repo.root, repo.base, repo.head);
    const document = coveringDocument(index);
    assert.equal(document.groups.length, 1);
    assert.equal(document.parts, undefined);
    assert.equal(document.groups[0]?.part, undefined);
  });

  it("writes a mixed covering document with parts, dependsOn, lookFor, and sources", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-mixed-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const index = await cmdIndex(repo.root, repo.base, repo.head);
    const document = mixedCoveringDocument(index);
    const parsed = parseReviewDocument(document);
    assert.equal(parsed.ok, true, parsed.ok ? "" : parsed.errors.join("\n"));
    await cmdValidate(repo.root, await writeTemp(root, document));

    assert.ok((document.parts?.length ?? 0) >= 2);
    assert.deepEqual(
      document.parts?.map((part) => part.name),
      [MIXED_PART_APP, MIXED_PART_LIB, MIXED_PART_DOCS],
    );
    assert.ok(document.parts?.every((part) => part.summary.trim() !== ""));
    assert.ok((document.lookFor?.length ?? 0) >= 2);
    assert.ok((document.sources?.length ?? 0) >= 2);
    const partNames = new Set(document.groups.map((group) => group.part));
    assert.equal(partNames.size, 3);

    const appTest = document.groups.find((group) => group.id === MIXED_GROUP_APP_TEST);
    assert.deepEqual(appTest?.dependsOn, [MIXED_GROUP_APP]);
    assert.equal(appTest?.part, MIXED_PART_APP);
    const app = document.groups.find((group) => group.id === MIXED_GROUP_APP);
    assert.ok((app?.lookFor?.length ?? 0) > 0);
    assert.equal(
      document.groups.reduce((sum, group) => sum + group.hunkRefs.length, 0),
      index.hunks.length,
    );
  });
});

async function writeTemp(root: string, document: ReviewDocument): Promise<string> {
  const dataPath = join(root, "review.json");
  await writeFile(dataPath, `${JSON.stringify(document, null, 2)}\n`);
  return dataPath;
}
