import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, it } from "vite-plus/test";
import { openReview } from "../../src/api/live.ts";
import { coveringDocument } from "../../src/test/covering-document.ts";
import { createExampleRepo } from "../../src/test/example-repo.ts";
import { cmdIndex } from "../../src/cli/commands.ts";
import { git } from "../../src/git/exec.ts";
import { gradingPacket, writeGradingPacket } from "./packet.ts";

const roots: string[] = [];
afterAll(() => {
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
    const packet = gradingPacket(ctx, [{ html_url: "https://example.test/pr/1" }], ctx.commits);
    assert.match(packet, /Frozen sources/);
    assert.match(packet, /src\/app\.ts/);
    assert.match(packet, /UNIQUE_ADDED_LINE_CONTENT_7f3a/);
  });

  it("lists the commits of the change, not the commits only the base has", async () => {
    const root = await mkdtemp(join(tmpdir(), "eval-packet-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const headSubject = (await git(root, ["log", "-1", "--format=%s", repo.head])).trim();
    await git(root, ["checkout", "--quiet", "-b", "base-moved-on", repo.base]);
    await writeFile(join(root, "base-only.txt"), "base\n", "utf8");
    await git(root, ["add", "."]);
    await git(root, ["commit", "-m", "BASE_SIDE_ONLY_SUBJECT"]);
    const base = (await git(root, ["rev-parse", "HEAD"])).trim();
    const document = coveringDocument(await cmdIndex(root, base, repo.head));
    const ctx = await openReview(root, document);
    const packet = await writeGradingPacket(ctx, [], join(root, "packet.md"));
    assert.ok(packet.includes(headSubject));
    assert.ok(!packet.includes("BASE_SIDE_ONLY_SUBJECT"));
  });
});
