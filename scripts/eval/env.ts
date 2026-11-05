import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { mainCheckoutDir } from "./checkout.ts";

/**
 * Load KEY=VALUE lines from <packageRoot>/.env, then from the main checkout's .env so a worktree
 * needs no copy. The first value set wins: real environment, then the worktree, then main.
 * Missing files are fine.
 */
export async function loadDotEnv(packageRoot: string): Promise<void> {
  const main = await mainCheckoutDir(packageRoot);
  await loadDotEnvFile(join(packageRoot, ".env"));
  if (main !== undefined) {
    await loadDotEnvFile(join(main, ".env"));
  }
}

async function loadDotEnvFile(path: string): Promise<void> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch {
    return;
  }
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }
    const assignment = trimmed.startsWith("export ")
      ? trimmed.slice("export ".length).trim()
      : trimmed;
    const eq = assignment.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = assignment.slice(0, eq).trim();
    if (key === "" || process.env[key] !== undefined) {
      continue;
    }
    process.env[key] = unquote(assignment.slice(eq + 1).trim());
  }
}

function unquote(value: string): string {
  if (value.length >= 2) {
    const first = value.at(0);
    if ((first === '"' || first === "'") && value.endsWith(first)) {
      return value.slice(1, -1);
    }
  }
  return value;
}
