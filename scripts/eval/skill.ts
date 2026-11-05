import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { git } from "../../src/git/exec.ts";
import { replaceCliPin } from "../../src/schema/cli-pin.ts";

/**
 * Copy the skill once per run so edits to the source during the run never reach a case.
 * Returns the git tree hash of the copy, before the CLI pin is rewritten. For a clean
 * committed skill it equals `git rev-parse HEAD:<skill dir>`.
 */
export async function snapshotSkill(
  source: string,
  dest: string,
  cliPath: string,
): Promise<string> {
  await cp(source, dest, { recursive: true });
  const tree = await treeHash(dest);
  const skillMd = join(dest, "SKILL.md");
  const original = await readFile(skillMd, "utf8");
  const rewritten = replaceCliPin(original, `node ${cliPath}`);
  if (rewritten === original) {
    throw new Error(`${join(source, "SKILL.md")} has no npx comprehende@ pin to rewrite`);
  }
  await writeFile(skillMd, rewritten);
  return tree;
}

async function treeHash(dir: string): Promise<string> {
  const gitDir = await mkdtemp(join(tmpdir(), "comprehende-skill-tree-"));
  try {
    const opts = ["--git-dir", gitDir, "--work-tree", dir];
    await git(dir, ["init", "--bare", "--quiet", gitDir]);
    await git(dir, [...opts, "add", "--all", "."]);
    return (await git(dir, [...opts, "write-tree"])).trim();
  } finally {
    await rm(gitDir, { recursive: true, force: true });
  }
}
