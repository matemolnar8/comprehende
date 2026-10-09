import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Load KEY=VALUE lines from <packageRoot>/.env. Real environment wins. Missing file is fine. */
export async function loadDotEnv(packageRoot: string): Promise<void> {
  let text: string;
  try {
    text = await readFile(join(packageRoot, ".env"), "utf8");
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
