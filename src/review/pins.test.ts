import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import { cmdIndex, cmdValidate } from "../cli/commands.ts";
import { writeCoveringDocument } from "../test/covering-document.ts";
import { createExampleRepo } from "../test/example-repo.ts";
import { commentPinErrors, staleCommentPins } from "./pins.ts";

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("stale comment pins", () => {
  it("accepts a line that exists and flags a line that does not", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-pins-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const live = await staleCommentPins(
      repo.root,
      {
        version: 1,
        source: { baseRef: repo.base, headRef: repo.head },
        size: "small",
        title: "Pins",
        summary: "Comment pins.",
        sources: [
          {
            id: "ok",
            kind: "pr-comment",
            label: "alice",
            author: "alice",
            body: "Looks good.",
            path: "src/app.ts",
            side: "new",
            line: 1,
          },
          {
            id: "gone",
            kind: "pr-comment",
            label: "bob",
            author: "bob",
            body: "This line is gone.",
            path: "src/app.ts",
            side: "new",
            line: 9999,
          },
          {
            id: "missing-file",
            kind: "pr-comment",
            label: "cara",
            author: "cara",
            body: "Wrong path.",
            path: "nope.ts",
            side: "new",
            line: 1,
          },
        ],
        groups: [],
      },
      { baseSha: repo.base, headSha: repo.head },
    );
    assert.deepEqual(
      live.map((pin) => pin.id).sort(),
      ["gone", "missing-file"],
    );
    assert.match(commentPinErrors(live).join("\n"), /gone src\/app.ts new:9999/);
  });

  it("fails validate on an unknown source citation", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-cite-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const dataPath = join(root, "review.json");
    const index = await cmdIndex(repo.root, repo.base, repo.head);
    const document = await writeCoveringDocument(dataPath, index);
    document.why = "See [#24](source:s1).";
    await writeFile(dataPath, `${JSON.stringify(document, null, 2)}\n`);
    await assert.rejects(() => cmdValidate(repo.root, dataPath), /unknown id "s1"/);
  });
});
