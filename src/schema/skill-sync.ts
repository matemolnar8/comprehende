import { execFileSync } from "node:child_process";
import { cp, copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { applyCliPin, cliPinErrors, listedCliPins } from "./cli-pin.ts";
import { skillPaths } from "./skill-paths.ts";
import { findPackageRoot } from "../package-root.ts";
import { gitEnv } from "../git/exec.ts";

export type SkillSyncInput = {
  version: string;
  canonicalSchema: string;
  nextSchema: string;
  nextSkillMd: string;
  nextFiles: Map<string, string>;
  installedFiles: Map<string, string>;
  publishedSkillMd: string;
};

export function skillSyncErrors(input: SkillSyncInput): string[] {
  const errors: string[] = [];
  if (input.nextSchema !== input.canonicalSchema) {
    errors.push("skills-next/comprehende/references/review.schema.json drifted. Run: pnpm sync:skill");
  }
  errors.push(
    ...cliPinErrors(input.nextSkillMd, input.version).map((error) => `skills-next/comprehende/${error}`),
  );
  if (listedCliPins(input.publishedSkillMd).length === 0) {
    errors.push("skills/comprehende/SKILL.md must pin npx comprehende@<version>");
  }

  const nextKeys = [...input.nextFiles.keys()].sort();
  const installedKeys = [...input.installedFiles.keys()].sort();
  if (nextKeys.join("\n") !== installedKeys.join("\n")) {
    errors.push(".agents/skills/comprehende is not a copy of skills-next/comprehende. Run: pnpm sync:skill");
    return errors;
  }
  for (const rel of nextKeys) {
    if (input.nextFiles.get(rel) !== input.installedFiles.get(rel)) {
      errors.push(`${rel} differs between skills-next/ and .agents/. Run: pnpm sync:skill`);
    }
  }
  return errors;
}

export async function loadWorkingTreeSkillSync(root = findPackageRoot()): Promise<SkillSyncInput> {
  const paths = skillPaths(root);
  const nextFiles = await readTree(paths.nextSkill);
  const installedFiles = await readTree(paths.installedSkill);
  return {
    version: await readVersion(root),
    canonicalSchema: await readFile(paths.canonicalSchema, "utf8"),
    nextSchema: nextFiles.get("references/review.schema.json") ?? "",
    nextSkillMd: nextFiles.get("SKILL.md") ?? "",
    nextFiles,
    installedFiles,
    publishedSkillMd: await readFile(join(paths.publishedSkill, "SKILL.md"), "utf8"),
  };
}

export function loadStagedSkillSync(root = findPackageRoot()): SkillSyncInput {
  const nextFiles = gitStagedTree(root, "skills-next/comprehende");
  const installedFiles = gitStagedTree(root, ".agents/skills/comprehende");
  const pkg = JSON.parse(gitShowStaged(root, "package.json")) as { version: string };
  return {
    version: pkg.version,
    canonicalSchema: gitShowStaged(root, "src/schema/review.schema.json"),
    nextSchema: nextFiles.get("references/review.schema.json") ?? "",
    nextSkillMd: nextFiles.get("SKILL.md") ?? "",
    nextFiles,
    installedFiles,
    publishedSkillMd: gitShowStaged(root, "skills/comprehende/SKILL.md"),
  };
}

export async function syncNextSkill(options?: { root?: string; release?: boolean }): Promise<string[]> {
  const root = options?.root ?? findPackageRoot();
  const release = options?.release === true;
  const paths = skillPaths(root);
  const version = await readVersion(root);
  const skillFile = join(paths.nextSkill, "SKILL.md");

  await mkdir(dirname(paths.nextSchema), { recursive: true });
  await copyFile(paths.canonicalSchema, paths.nextSchema);

  const original = await readFile(skillFile, "utf8");
  const pinned = applyCliPin(original, version);
  const pinProblems = cliPinErrors(pinned, version);
  if (pinProblems.length > 0) {
    throw new Error(pinProblems.join("\n"));
  }
  if (pinned !== original) {
    await writeFile(skillFile, pinned);
  }

  await replaceDir(paths.nextSkill, paths.installedSkill);
  const logs = [
    `copied ${paths.canonicalSchema} -> ${paths.nextSchema}`,
    `pinned npx comprehende@${version} in ${skillFile}`,
    `copied ${paths.nextSkill} -> ${paths.installedSkill}`,
  ];

  if (release) {
    await replaceDir(paths.nextSkill, paths.publishedSkill);
    logs.push(`copied ${paths.nextSkill} -> ${paths.publishedSkill}`);
  }
  return logs;
}

async function readVersion(root: string): Promise<string> {
  const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as { version: string };
  return pkg.version;
}

async function replaceDir(from: string, to: string): Promise<void> {
  await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true });
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
    env: gitEnv(),
  });
  const out = new Map<string, string>();
  for (const full of listing.split("\0").filter(Boolean)) {
    out.set(relative(prefix, full), gitShowStaged(root, full));
  }
  return out;
}

function gitShowStaged(root: string, path: string): string {
  try {
    return execFileSync("git", ["show", `:${path}`], { cwd: root, encoding: "utf8", env: gitEnv() });
  } catch {
    throw new Error(`staged file missing: ${path}`);
  }
}
