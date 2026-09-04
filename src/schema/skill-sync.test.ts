import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { applyCliPin, cliPinErrors } from "./cli-pin.ts";
import { loadWorkingTreeSkillSync, skillSyncErrors, syncNextSkill } from "./skill-sync.ts";
import { skillPaths } from "./skill-paths.ts";
import { findPackageRoot } from "../package-root.ts";

describe("skill schema sync", () => {
  it("keeps the next-skill prose and paths", async () => {
    const { nextSkillMd } = await loadWorkingTreeSkillSync();
    assert.match(nextSkillMd, /npm view comprehende version/);
    assert.match(nextSkillMd, /npx skills update/);
    assert.match(nextSkillMd, /Do not run that command/);
    const root = findPackageRoot();
    const paths = skillPaths(root);
    assert.equal(paths.nextSkill, join(root, "skills-next/comprehende"));
    assert.equal(paths.publishedSkill, join(root, "skills/comprehende"));
  });

  it("allows the published skill to lag the package version", () => {
    const nextMd = "run npx comprehende@0.4.0 index";
    const nextFiles = fileMap({
      "SKILL.md": nextMd,
      "references/review.schema.json": "schema-v2",
    });
    assert.deepEqual(
      skillSyncErrors({
        version: "0.4.0",
        canonicalSchema: "schema-v2",
        nextSchema: "schema-v2",
        nextSkillMd: nextMd,
        nextFiles,
        installedFiles: fileMap(nextFiles),
        publishedSkillMd: "run npx comprehende@0.3.0 index",
      }),
      [],
    );
  });

  it("fails when the next schema drifts from the CLI contract", () => {
    const nextMd = "run npx comprehende@0.4.0 index";
    const nextFiles = fileMap({
      "SKILL.md": nextMd,
      "references/review.schema.json": "schema-v1",
    });
    assert.deepEqual(
      skillSyncErrors({
        version: "0.4.0",
        canonicalSchema: "schema-v2",
        nextSchema: "schema-v1",
        nextSkillMd: nextMd,
        nextFiles,
        installedFiles: fileMap(nextFiles),
        publishedSkillMd: nextMd,
      }),
      ["skills-next/comprehende/references/review.schema.json drifted. Run: pnpm sync:skill"],
    );
  });

  it("fails when the next pin does not match package.json", () => {
    const nextMd = "run npx comprehende@0.3.0 index";
    const nextFiles = fileMap({
      "SKILL.md": nextMd,
      "references/review.schema.json": "schema-v2",
    });
    assert.deepEqual(
      skillSyncErrors({
        version: "0.4.0",
        canonicalSchema: "schema-v2",
        nextSchema: "schema-v2",
        nextSkillMd: nextMd,
        nextFiles,
        installedFiles: fileMap(nextFiles),
        publishedSkillMd: nextMd,
      }),
      ["skills-next/comprehende/SKILL.md pins npx comprehende@0.3.0, package.json version is 0.4.0"],
    );
  });

  it("fails when the installed copy is not the next skill", () => {
    const nextMd = "run npx comprehende@0.4.0 index";
    const nextFiles = fileMap({
      "SKILL.md": nextMd,
      "references/review.schema.json": "schema-v2",
    });
    assert.deepEqual(
      skillSyncErrors({
        version: "0.4.0",
        canonicalSchema: "schema-v2",
        nextSchema: "schema-v2",
        nextSkillMd: nextMd,
        nextFiles,
        installedFiles: fileMap({
          "SKILL.md": "run npx comprehende@0.3.0 index",
          "references/review.schema.json": "schema-v2",
        }),
        publishedSkillMd: "run npx comprehende@0.3.0 index",
      }),
      ["SKILL.md differs between skills-next/ and .agents/. Run: pnpm sync:skill"],
    );
  });

  it("fails when the published skill has no CLI pin", () => {
    const nextMd = "run npx comprehende@0.4.0 index";
    const nextFiles = fileMap({
      "SKILL.md": nextMd,
      "references/review.schema.json": "schema-v2",
    });
    assert.deepEqual(
      skillSyncErrors({
        version: "0.4.0",
        canonicalSchema: "schema-v2",
        nextSchema: "schema-v2",
        nextSkillMd: nextMd,
        nextFiles,
        installedFiles: fileMap(nextFiles),
        publishedSkillMd: "run the CLI",
      }),
      ["skills/comprehende/SKILL.md must pin npx comprehende@<version>"],
    );
  });
});

describe("sync next skill", () => {
  it("updates next and .agents without publishing, then copies next on release", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-skill-sync-"));
    try {
      await writeFixture(root, {
        version: "0.4.0",
        canonicalSchema: "schema-v2\n",
        nextSkillMd: "use npx comprehende@0.3.0 index\n",
        nextSchema: "schema-v1\n",
        publishedSkillMd: "use npx comprehende@0.3.0 index\n",
        publishedSchema: "schema-v1\n",
        installedSkillMd: "stale\n",
        installedSchema: "stale\n",
      });

      await syncNextSkill({ root });

      assert.equal(await readFile(join(root, "skills-next/comprehende/SKILL.md"), "utf8"), "use npx comprehende@0.4.0 index\n");
      assert.equal(await readFile(join(root, "skills-next/comprehende/references/review.schema.json"), "utf8"), "schema-v2\n");
      assert.equal(await readFile(join(root, ".agents/skills/comprehende/SKILL.md"), "utf8"), "use npx comprehende@0.4.0 index\n");
      assert.equal(await readFile(join(root, "skills/comprehende/SKILL.md"), "utf8"), "use npx comprehende@0.3.0 index\n");
      assert.equal(await readFile(join(root, "skills/comprehende/references/review.schema.json"), "utf8"), "schema-v1\n");
      assert.deepEqual(skillSyncErrors(await loadWorkingTreeSkillSync(root)), []);

      await syncNextSkill({ root, release: true });

      assert.equal(await readFile(join(root, "skills/comprehende/SKILL.md"), "utf8"), "use npx comprehende@0.4.0 index\n");
      assert.equal(await readFile(join(root, "skills/comprehende/references/review.schema.json"), "utf8"), "schema-v2\n");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("cli pin rewrite", () => {
  it("rewrites every npx comprehende@ pin to the given version", () => {
    const markdown = ["npx comprehende@0.0.1 index", "`npx comprehende@9.9.9`", "npx comprehende@0.1.0 serve"].join(
      "\n",
    );
    const updated = applyCliPin(markdown, "1.2.3");
    assert.equal(updated.includes("npx comprehende@1.2.3"), true);
    assert.equal(updated.includes("npx comprehende@0.0.1"), false);
    assert.equal(updated.includes("npx comprehende@9.9.9"), false);
    assert.deepEqual(cliPinErrors(updated, "1.2.3"), []);
  });

  it("fails when the skill has no pin", () => {
    assert.deepEqual(cliPinErrors("run comprehende index", "0.1.0"), ["SKILL.md must pin npx comprehende@0.1.0"]);
  });

  it("fails when a pin does not match package.json", () => {
    assert.deepEqual(cliPinErrors("npx comprehende@0.2.0 index", "0.1.0"), [
      "SKILL.md pins npx comprehende@0.2.0, package.json version is 0.1.0",
    ]);
  });
});

function fileMap(files: Record<string, string> | Map<string, string>): Map<string, string> {
  return files instanceof Map ? new Map(files) : new Map(Object.entries(files));
}

async function writeFixture(
  root: string,
  files: {
    version: string;
    canonicalSchema: string;
    nextSkillMd: string;
    nextSchema: string;
    publishedSkillMd: string;
    publishedSchema: string;
    installedSkillMd: string;
    installedSchema: string;
  },
): Promise<void> {
  await writeFile(join(root, "package.json"), `${JSON.stringify({ name: "comprehende", version: files.version })}\n`);
  await mkdir(join(root, "src/schema"), { recursive: true });
  await mkdir(join(root, "skills-next/comprehende/references"), { recursive: true });
  await mkdir(join(root, "skills/comprehende/references"), { recursive: true });
  await mkdir(join(root, ".agents/skills/comprehende/references"), { recursive: true });
  await writeFile(join(root, "src/schema/review.schema.json"), files.canonicalSchema);
  await writeFile(join(root, "skills-next/comprehende/SKILL.md"), files.nextSkillMd);
  await writeFile(join(root, "skills-next/comprehende/references/review.schema.json"), files.nextSchema);
  await writeFile(join(root, "skills/comprehende/SKILL.md"), files.publishedSkillMd);
  await writeFile(join(root, "skills/comprehende/references/review.schema.json"), files.publishedSchema);
  await writeFile(join(root, ".agents/skills/comprehende/SKILL.md"), files.installedSkillMd);
  await writeFile(join(root, ".agents/skills/comprehende/references/review.schema.json"), files.installedSchema);
}