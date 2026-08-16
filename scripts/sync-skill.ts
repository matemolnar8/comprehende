#!/usr/bin/env node

import { cp, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { applyCliPin, cliPin, cliPinErrors } from "../src/schema/cli-pin.ts";
import { skillPaths } from "../src/schema/skill-paths.ts";
import { readPackageVersion } from "../src/package-root.ts";

const paths = skillPaths();
const version = readPackageVersion();
const skillFile = join(paths.publishedSkill, "SKILL.md");

await mkdir(dirname(paths.publishedSchema), { recursive: true });
await copyFile(paths.canonicalSchema, paths.publishedSchema);

const original = await readFile(skillFile, "utf8");
const pinned = applyCliPin(original, version);
const pinProblems = cliPinErrors(pinned, version);
if (pinProblems.length > 0) {
  throw new Error(pinProblems.join("\n"));
}
if (pinned !== original) {
  await writeFile(skillFile, pinned);
}

await rm(paths.installedSkill, { recursive: true, force: true });
await cp(paths.publishedSkill, paths.installedSkill, { recursive: true });
console.log(`copied ${paths.canonicalSchema} -> ${paths.publishedSchema}`);
console.log(`pinned ${cliPin(version)} in ${skillFile}`);
console.log(`copied ${paths.publishedSkill} -> ${paths.installedSkill}`);
