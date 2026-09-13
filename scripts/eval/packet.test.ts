import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { openReview } from "../../src/api/live.ts";
import { coveringDocument } from "../../src/test/covering-document.ts";
import { createExampleRepo } from "../../src/test/example-repo.ts";
import { cmdIndex } from "../../src/cli/commands.ts";
import { gradingPacket } from "./packet.ts";

const roots: string[] = [];
after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("grading packet", () => {
  it("includes live patch text for a group", async () => {
    const root = await mkdtemp(join(tmpdir(), "eval-packet-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const index = await cmdIndex(root, repo.base, repo.head);
    const document = coveringDocument(index);
    const ctx = await openReview(root, document);
    const packet = gradingPacket(ctx, [{ html_url: "https://example.test/pr/1" }]);
    assert.match(packet, /Frozen sources/);
    assert.match(packet, /src\/app\.ts/);
    assert.match(packet, /UNIQUE_ADDED_LINE_CONTENT_7f3a/);
  });
});
