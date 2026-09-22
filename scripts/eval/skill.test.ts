import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { findPackageRoot } from "../../src/package-root.ts";
import { copySkillForEval, readNextSkillMd, skillSection } from "./skill.ts";

const roots: string[] = [];
after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("next skill workflow", () => {
  it("batches commands, names validate checks, and drops the schema pointer", async () => {
    const md = await readNextSkillMd(findPackageRoot());
    const grouping = skillSection(md, "Grouping rules");
    assert.match(md, /Each step is one tool call where the step says so/);
    assert.match(md, /One shell call: version check, covering skeleton, log, and stat/);
    assert.match(md, /Write the whole `review\.json` in one write/);
    assert.match(
      md,
      /every live hunk sits in a group, every ref matches live git, every `source:` id exists in `sources`/,
    );
    assert.match(md, /references\/example\.md/);
    assert.doesNotMatch(md, /review\.schema\.json/);
    assert.match(md, /From the `--stat` in step 2/);
    assert.match(md, /:\(exclude\)<path>/);
    assert.doesNotMatch(md, /:\(exclude\)pnpm-lock\.yaml/);
    assert.doesNotMatch(md, /:\(exclude\)package-lock\.json/);
    assert.doesNotMatch(md, /:\(exclude\)yarn\.lock/);
    assert.doesNotMatch(md, /:\(exclude\)Cargo\.lock/);
    assert.doesNotMatch(md, /:\(exclude\)go\.sum/);
    assert.match(grouping, /Lockfiles have no hunk refs/);
    assert.doesNotMatch(grouping, /Lockfiles stay in `skipped`/);
    const example = await readFile(join(findPackageRoot(), "skills-next/comprehende/references/example.md"), "utf8");
    assert.doesNotMatch(example, /review\.schema\.json/);
  });
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
