#!/usr/bin/env node

import { existsSync } from "node:fs";
import { cp, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { findPackageRoot } from "../src/package-root.ts";
import { replaceCliPin } from "../src/schema/cli-pin.ts";
import { skillPaths } from "../src/schema/skill-paths.ts";

// Installs skills-next/comprehende as the global skill so that running
// comprehende from another folder uses the next skill with the locally
// built CLI. Re-run after `pnpm build` or `npx skills update` (which restores
// the published skill).
const root = findPackageRoot();
const { nextSkill } = skillPaths(root);
const cliPath = join(root, "dist/cli/main.js");
if (!existsSync(cliPath)) {
  throw new Error(`missing ${cliPath}. Run: pnpm build`);
}

const dest = process.argv[2] ?? join(process.env.HOME ?? homedir(), ".agents/skills/comprehende");
await rm(dest, { recursive: true, force: true });
await cp(nextSkill, dest, { recursive: true });

const skillMd = join(dest, "SKILL.md");
const original = await readFile(skillMd, "utf8");
const rewritten = replaceCliPin(original, `node ${cliPath}`);
if (rewritten === original) {
  throw new Error("SKILL.md has no npx comprehende@ pin to rewrite");
}
const updateHint =
  "Show `npx skills update` as an option they can run. Do not run that command. Wait for them to continue with this pin, or to update and start this skill again.";
if (!rewritten.includes(updateHint)) {
  throw new Error("SKILL.md update hint changed; adjust install-local-skill.ts");
}
await writeFile(
  skillMd,
  rewritten.replace(
    updateHint,
    "Do not run `npx skills update`; that replaces this local install with the published skill. Wait for them to continue with this pin.",
  ),
);

console.log(`copied ${nextSkill} -> ${dest}`);
console.log(`rewrote CLI pin to node ${cliPath}`);
