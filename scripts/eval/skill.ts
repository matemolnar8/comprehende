import { cp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { replaceCliPin } from "../../src/schema/cli-pin.ts";
import { skillPaths } from "../../src/schema/skill-paths.ts";

export async function copySkillForEval(
  packageRoot: string,
  dest: string,
  cliPath: string,
): Promise<void> {
  const { nextSkill } = skillPaths(packageRoot);
  await cp(nextSkill, dest, { recursive: true });
  const skillMd = join(dest, "SKILL.md");
  const original = await readFile(skillMd, "utf8");
  const rewritten = replaceCliPin(original, `node ${cliPath}`);
  if (rewritten === original) {
    throw new Error("SKILL.md has no npx comprehende@ pin to rewrite");
  }
  await writeFile(skillMd, rewritten);
}
