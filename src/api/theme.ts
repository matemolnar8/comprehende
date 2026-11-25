import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { parseThemeJson, type Theme } from "../schema/theme.ts";

export const THEME_FILE = join(".comprehende", "theme.json");

/** `project` is the repository's theme file, `user` the one in the home folder. */
export type ThemeSource = "project" | "user";

export type LoadedTheme = { source: ThemeSource; path: string; theme: Theme };

/** The project's theme first, then the user's. The UI starts on the first and can switch to the other; the two never merge. */
export async function loadThemes(repoRoot: string, home = homedir()): Promise<LoadedTheme[]> {
  const project = join(repoRoot, THEME_FILE);
  const user = join(home, THEME_FILE);
  const loaded = await Promise.all([
    loadTheme("project", project),
    // A repository at the home folder has one theme file, not two.
    user === project ? undefined : loadTheme("user", user),
  ]);
  return loaded.filter((theme) => theme !== undefined);
}

async function loadTheme(source: ThemeSource, path: string): Promise<LoadedTheme | undefined> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
  const parsed = parseThemeJson(text);
  if (!parsed.ok) {
    throw new Error(`invalid theme ${path}:\n${parsed.error}`);
  }
  return { source, path, theme: parsed.theme };
}
