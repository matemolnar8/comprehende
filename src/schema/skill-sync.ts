import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { cliPinErrors } from "./cli-pin.ts";
import { skillPaths } from "./skill-paths.ts";
import { findPackageRoot, readPackageVersion } from "../package-root.ts";

export type SkillSyncInput = {
  version: string;
  canonicalSchema: string;
  publishedSchema: string;
  installedSchema: string;
  publishedSkillMd: string;
  publishedFiles: Map<string, string>;
  installedFiles: Map<string, string>;
};

export function skillSyncErrors(input: SkillSyncInput): string[] {
  const errors: string[] = [];
  if (input.publishedSchema !== input.canonicalSchema) {
    errors.push("skills/comprehende/references/review.schema.json drifted. Run: pnpm sync:skill");
  }
  if (input.installedSchema !== input.canonicalSchema) {
    errors.push(".agents/skills/comprehende/references/review.schema.json drifted. Run: pnpm sync:skill");
  }
  errors.push(...cliPinErrors(input.publishedSkillMd, input.version));

  const publishedKeys = [...input.publishedFiles.keys()].sort();
  const installedKeys = [...input.installedFiles.keys()].sort();
  if (publishedKeys.join("\n") !== installedKeys.join("\n")) {
    errors.push(".agents/skills/comprehende is not a copy of skills/comprehende. Run: pnpm sync:skill");
    return errors;
  }
  for (const rel of publishedKeys) {
    if (input.publishedFiles.get(rel) !== input.installedFiles.get(rel)) {
      errors.push(`${rel} differs between skills/ and .agents/. Run: pnpm sync:skill`);
    }
  }
  return errors;
}

export async function loadWorkingTreeSkillSync(root = findPackageRoot()): Promise<SkillSyncInput> {
  const paths = skillPaths(root);
  const publishedFiles = await readTree(paths.publishedSkill);
  const installedFiles = await readTree(paths.installedSkill);
  return {
    version: readPackageVersion(),
    canonicalSchema: await readFile(paths.canonicalSchema, "utf8"),
    publishedSchema: await readFile(paths.publishedSchema, "utf8"),
    installedSchema: await readFile(paths.installedSchema, "utf8"),
    publishedSkillMd: publishedFiles.get("SKILL.md") ?? "",
    publishedFiles,
    installedFiles,
  };
}

export function loadStagedSkillSync(root = findPackageRoot()): SkillSyncInput {
  const publishedFiles = gitStagedTree(root, "skills/comprehende");
  const installedFiles = gitStagedTree(root, ".agents/skills/comprehende");
  const pkg = JSON.parse(gitShowStaged(root, "package.json")) as { version: string };
  return {
    version: pkg.version,
    canonicalSchema: gitShowStaged(root, "src/schema/review.schema.json"),
    publishedSchema: gitShowStaged(root, "skills/comprehende/references/review.schema.json"),
    installedSchema: gitShowStaged(root, ".agents/skills/comprehende/references/review.schema.json"),
    publishedSkillMd: publishedFiles.get("SKILL.md") ?? "",
    publishedFiles,
    installedFiles,
  };
}

async function readTree(dir: string): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const walk = async (current: string): Promise<void> => {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      out.set(relative(dir, full), await readFile(full, "utf8"));
    }
  };
  await walk(dir);
  return out;
}

function gitStagedTree(root: string, prefix: string): Map<string, string> {
  const listing = execFileSync("git", ["ls-files", "-z", "--", prefix], {
    cwd: root,
    encoding: "utf8",
  });
  const out = new Map<string, string>();
  for (const full of listing.split("\0").filter(Boolean)) {
    out.set(relative(prefix, full), gitShowStaged(root, full));
  }
  return out;
}

function gitShowStaged(root: string, path: string): string {
  try {
    return execFileSync("git", ["show", `:${path}`], { cwd: root, encoding: "utf8" });
  } catch {
    throw new Error(`staged file missing: ${path}`);
  }
}
