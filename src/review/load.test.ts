import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, it } from "vite-plus/test";
import { loadDocument } from "./load.ts";

const roots: string[] = [];

afterAll(async () => {
  await Promise.all(roots.map((root) => rm(root, { recursive: true, force: true })));
});

const text = JSON.stringify({
  version: 1,
  source: { baseRef: "main", headRef: "HEAD" },
  size: "small",
  title: "Review command",
  summary: "Adds a review command.",
  groups: [
    {
      id: "g1",
      title: "CLI",
      why: "The command is how an agent starts a review.",
      summary: "Adds a command.",
      suggestedOrder: 0,
      hunkRefs: ["src/cli/main.ts"],
    },
  ],
});

describe("loadDocument", () => {
  it("reads the encodings PowerShell writes", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-load-"));
    roots.push(root);
    const files = {
      utf8: Buffer.from(text, "utf8"),
      utf8Bom: Buffer.from(`﻿${text}`, "utf8"),
      utf16Bom: Buffer.from(`﻿${text}`, "utf16le"),
    };
    for (const [name, bytes] of Object.entries(files)) {
      const path = join(root, `${name}.json`);
      await writeFile(path, bytes);
      const document = await loadDocument(path);
      assert.equal(document.title, "Review command", name);
    }
  });
});
