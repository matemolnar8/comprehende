import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { parseThemeJson, type Theme } from "../schema/theme.ts";

export const THEME_FILE = join(".comprehende", "theme.json");

export type LoadedTheme = { path: string; theme: Theme };

/** The project's theme file wins over the user's, whole: the two never merge. */
export async function loadTheme(
  repoRoot: string,
  home = homedir(),
): Promise<LoadedTheme | undefined> {
  for (const path of [join(repoRoot, THEME_FILE), join(home, THEME_FILE)]) {
    let text: string;
    try {
      text = await readFile(path, "utf8");
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        continue;
      }
      throw error;
    }
    const parsed = parseThemeJson(text);
    if (!parsed.ok) {
      throw new Error(`invalid theme ${path}:\n${parsed.error}`);
    }
    return { path, theme: parsed.theme };
  }
  return undefined;
}
