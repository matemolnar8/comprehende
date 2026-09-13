import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { findPackageRoot } from "../../src/package-root.ts";
import { copySkillForEval, skillSection } from "./skill.ts";

const roots: string[] = [];
after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("eval skill copy", () => {
  it("rewrites the pin and extracts grouping rules", async () => {
    const root = findPackageRoot();
    const dest = await mkdtemp(join(tmpdir(), "eval-skill-"));
    roots.push(dest);
    await copySkillForEval(root, dest, "/tmp/dist/cli/main.js");
    const md = await readFile(join(dest, "SKILL.md"), "utf8");
    assert.match(md, /node \/tmp\/dist\/cli\/main\.js/);
    assert.doesNotMatch(md, /npx comprehende@/);
    const grouping = skillSection(md, "Grouping rules");
    assert.match(grouping, /Group by review concern/);
    assert.doesNotMatch(grouping, /^## /m);
  });
});
