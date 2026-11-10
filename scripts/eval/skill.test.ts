import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, it } from "vite-plus/test";
import { git } from "../../src/git/exec.ts";
import { findPackageRoot } from "../../src/package-root.ts";
import { initEmptyRepo } from "../../src/test/init-repo.ts";
import { skillPaths } from "../../src/schema/skill-paths.ts";
import { snapshotSkill } from "./skill.ts";

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("next skill workflow", () => {
  it("keeps the step-2 batch and the write block, with no forge or schema names", async () => {
    const md = await readFile(join(skillPaths(findPackageRoot()).nextSkill, "SKILL.md"), "utf8");
    assert.match(md, /<<'EOF'\n   <the document>\n   EOF\n   npx comprehende@[\d.]+ validate/);
    assert.doesNotMatch(md, /github|gitlab|bitbucket/i);
    assert.doesNotMatch(md, /review\.schema\.json/);
    const shells = [...md.matchAll(/```sh\n([\s\S]*?)```/g)].map((match) => match[1] ?? "");
    const batch = shells.find(
      (block) => block.includes("rev-parse") && block.includes("pregroup --base"),
    );
    assert.ok(batch);
    assert.match(
      batch,
      /git rev-parse --verify --end-of-options "<base>\^\{commit\}" && git rev-parse --verify --end-of-options "<head>\^\{commit\}" &&/,
    );
    assert.match(batch, /npm view comprehende version/);
    assert.match(batch, /digest --base <base> --head <head>/);
    assert.match(batch, /git log --format=/);
    assert.doesNotMatch(batch, /git diff --stat/);
    assert.doesNotMatch(md, /:\(exclude\)<path>/);
    assert.doesNotMatch(md, /pnpm-lock\.yaml/);
    assert.doesNotMatch(md, /package-lock\.json/);
    assert.doesNotMatch(md, /yarn\.lock/);
    assert.doesNotMatch(md, /Cargo\.lock/);
    assert.doesNotMatch(md, /poetry\.lock/);
    assert.doesNotMatch(md, /go\.sum/);
    assert.match(md, /path@oldStart\+newStart/);
    const example = await readFile(
      join(findPackageRoot(), "skills-next/comprehende/references/example.md"),
      "utf8",
    );
    assert.doesNotMatch(example, /review\.schema\.json/);
  });
});

describe("eval skill snapshot", () => {
  it("rewrites the pin and records the tree of what it copied", async () => {
    const root = await mkdtemp(join(tmpdir(), "eval-skill-"));
    roots.push(root);
    const repo = join(root, "repo");
    await initEmptyRepo(repo);
    await cp(skillPaths(findPackageRoot()).nextSkill, join(repo, "skill"), { recursive: true });
    await git(repo, ["add", "."]);
    await git(repo, ["commit", "-m", "skill"]);
    const committed = (await git(repo, ["rev-parse", "HEAD:skill"])).trim();

    const clean = await snapshotSkill(
      join(repo, "skill"),
      join(root, "a"),
      "/tmp/dist/cli/main.js",
    );
    assert.equal(clean, committed);
    const md = await readFile(join(root, "a/SKILL.md"), "utf8");
    assert.match(md, /node \/tmp\/dist\/cli\/main\.js/);
    assert.doesNotMatch(md, /npx comprehende@/);

    await writeFile(join(repo, "skill/extra.md"), "uncommitted\n");
    const dirty = await snapshotSkill(
      join(repo, "skill"),
      join(root, "b"),
      "/tmp/dist/cli/main.js",
    );
    assert.notEqual(dirty, committed);
  });
});
