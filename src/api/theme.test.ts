import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "vite-plus/test";
import { findPackageRoot } from "../package-root.ts";
import { parseThemeJson, THEME_TOKENS } from "../schema/theme.ts";
import { loadTheme } from "./theme.ts";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function folders() {
  const root = await mkdtemp(join(tmpdir(), "comprehende-theme-"));
  roots.push(root);
  const repo = join(root, "repo");
  const home = join(root, "home");
  await Promise.all([
    mkdir(join(repo, ".comprehende"), { recursive: true }),
    mkdir(join(home, ".comprehende"), { recursive: true }),
  ]);
  return { repo, home };
}

describe("loadTheme", () => {
  it("prefers the repository file over the home file, whole", async () => {
    const { repo, home } = await folders();
    await writeFile(
      join(home, ".comprehende/theme.json"),
      '{"radius":"1rem","dark":{"ring":"#fff"}}',
    );
    await writeFile(join(repo, ".comprehende/theme.json"), '{"dark":{"primary":"#fbbf24"}}');

    const loaded = await loadTheme(repo, home);

    assert.equal(loaded?.path, join(repo, ".comprehende/theme.json"));
    assert.deepEqual(loaded?.theme, { dark: { primary: "#fbbf24" } });
  });

  it("falls back to the home file, and to nothing", async () => {
    const { repo, home } = await folders();
    assert.equal(await loadTheme(repo, home), undefined);

    await writeFile(
      join(home, ".comprehende/theme.json"),
      '{"light":{"primary":"oklch(0.67 0.16 58)"}}',
    );
    assert.equal((await loadTheme(repo, home))?.path, join(home, ".comprehende/theme.json"));
  });

  it("names the file and the field when the theme is invalid", async () => {
    const { repo, home } = await folders();
    await writeFile(join(repo, ".comprehende/theme.json"), '{"dark":{"primry":"#fff"}}');

    await assert.rejects(() => loadTheme(repo, home), /invalid theme .*theme\.json[\s\S]*primry/);
  });
});

describe("parseThemeJson", () => {
  it("accepts hex and colour functions", () => {
    const parsed = parseThemeJson(
      JSON.stringify({
        light: { primary: "#d97706", border: "rgb(226 232 240 / 80%)", ring: "oklch(0.7 0.15 70)" },
      }),
    );
    assert.equal(parsed.ok, true);
  });

  it("rejects values that are not a literal colour", () => {
    for (const value of [
      "red; } body { display: none",
      "var(--color-amber-400)",
      "url(x)",
      "amber",
      "#12345",
      "oklch(nope)",
      "rgb()",
    ]) {
      const parsed = parseThemeJson(JSON.stringify({ dark: { primary: value } }));
      assert.equal(parsed.ok, false, value);
    }
  });
});

describe("THEME_TOKENS", () => {
  it("names a variable that styles.css sets", async () => {
    const css = await readFile(join(findPackageRoot(), "src/ui/styles.css"), "utf8");
    const start = css.indexOf("\n:root {");
    const root = css.slice(start, css.indexOf("\n}", start));
    assert.deepEqual(
      THEME_TOKENS.filter((token) => !root.includes(`--${token}:`)),
      [],
    );
  });
});
