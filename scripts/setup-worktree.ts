/**
 * Worktree setup: `node scripts/setup-worktree.ts`. The t3.json "Setup Worktree" action runs it
 * with T3CODE_PROJECT_ROOT set; without it, the main checkout is the project root. Plain Node
 * keeps one command working in every shell (zsh, bash, fish, PowerShell): it installs
 * dependencies, then links the main checkout's gitignored env files into this worktree.
 */
import * as NodeChildProcess from "node:child_process";
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";

const ENV_FILES = [".env"];

/** The main checkout is the first entry of `git worktree list`, also when run from a linked worktree. */
export function mainCheckout(cwd: string): string {
  const list = NodeChildProcess.execFileSync("git", ["worktree", "list", "--porcelain"], {
    cwd,
    encoding: "utf8",
  });
  const first = list.split("\n")[0];
  if (first === undefined || !first.startsWith("worktree ")) {
    throw new Error(`Unexpected git worktree list output in ${cwd}`);
  }
  return first.slice("worktree ".length);
}

if (import.meta.main) {
  const worktree = NodePath.dirname(import.meta.dirname);
  const projectRoot = process.env.T3CODE_PROJECT_ROOT || mainCheckout(worktree);

  // `shell` resolves `vp` through PATH, including Windows command shims.
  const install = NodeChildProcess.spawnSync("vp i", {
    cwd: worktree,
    shell: true,
    stdio: "inherit",
  });
  if (install.status !== 0) process.exit(install.status ?? 1);

  // Env files live as real files in the main checkout; worktrees only get
  // symlinks to them. Only a symlink is ever replaced, so a real env file is
  // never deleted, including when this runs in the main checkout itself.
  for (const file of ENV_FILES) {
    const source = NodePath.join(projectRoot, file);
    const sourceStat = NodeFS.lstatSync(source, { throwIfNoEntry: false });
    if (!sourceStat) continue;
    if (!sourceStat.isFile()) {
      process.stderr.write(`Skipping ${file}: ${source} is not a regular file.\n`);
      continue;
    }
    const target = NodePath.join(worktree, file);
    const existing = NodeFS.lstatSync(target, { throwIfNoEntry: false });
    if (existing && !existing.isSymbolicLink()) continue;
    if (existing) NodeFS.rmSync(target);
    NodeFS.symlinkSync(source, target);
  }
}
