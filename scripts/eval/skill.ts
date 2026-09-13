import { cp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { replaceCliPin } from "../../src/schema/cli-pin.ts";
import { skillPaths } from "../../src/schema/skill-paths.ts";

export async function copySkillForEval(packageRoot: string, dest: string, cliPath: string): Promise<void> {
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

export function skillSection(markdown: string, heading: string): string {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line === `## ${heading}`);
  if (start === -1) {
    throw new Error(`SKILL.md missing ## ${heading}`);
  }
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line !== undefined && line.startsWith("## ")) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n").trim();
}

export async function readNextSkillMd(packageRoot: string): Promise<string> {
  return readFile(join(skillPaths(packageRoot).nextSkill, "SKILL.md"), "utf8");
}
