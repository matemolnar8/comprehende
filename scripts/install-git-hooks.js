import { execFileSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GIT_DIR_VARS = new Set([
  "GIT_DIR",
  "GIT_WORK_TREE",
  "GIT_INDEX_FILE",
  "GIT_OBJECT_DIRECTORY",
  "GIT_ALTERNATE_OBJECT_DIRECTORIES",
  "GIT_COMMON_DIR",
  "GIT_PREFIX",
]);

function gitEnv() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (GIT_DIR_VARS.has(key.toUpperCase())) {
      delete env[key];
    }
  }
  return env;
}

export function installGitHooks(root) {
  if (!existsSync(join(root, ".git"))) {
    return false;
  }
  try {
    execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
      cwd: root,
      encoding: "utf8",
      env: gitEnv(),
    });
    return true;
  } catch {
    return false;
  }
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] !== undefined) {
  try {
    if (realpathSync(thisFile) === realpathSync(process.argv[1])) {
      installGitHooks(join(dirname(thisFile), ".."));
    }
  } catch {
    installGitHooks(join(dirname(thisFile), ".."));
  }
}
