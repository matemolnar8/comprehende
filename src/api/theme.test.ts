import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "vite-plus/test";
import { findPackageRoot } from "../package-root.ts";
import { parseThemeJson, THEME_TOKENS } from "../schema/theme.ts";
import { loadThemes } from "./theme.ts";

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

describe("loadThemes", () => {
  it("loads the repository file, then the home file, each whole", async () => {
    const { repo, home } = await folders();
    await writeFile(
      join(home, ".comprehende/theme.json"),
      '{"radius":"1rem","dark":{"ring":"#fff"}}',
    );
    await writeFile(join(repo, ".comprehende/theme.json"), '{"dark":{"primary":"#fbbf24"}}');

    assert.deepEqual(await loadThemes(repo, home), [
      {
        source: "project",
        path: join(repo, ".comprehende/theme.json"),
        theme: { dark: { primary: "#fbbf24" } },
      },
      {
        source: "user",
        path: join(home, ".comprehende/theme.json"),
        theme: { radius: "1rem", dark: { ring: "#fff" } },
      },
    ]);
  });

  it("loads the files that exist", async () => {
    const { repo, home } = await folders();
    assert.deepEqual(await loadThemes(repo, home), []);

    await writeFile(
      join(home, ".comprehende/theme.json"),
      '{"light":{"primary":"oklch(0.67 0.16 58)"}}',
    );
    assert.deepEqual(
      (await loadThemes(repo, home)).map((theme) => theme.source),
      ["user"],
    );
  });

  it("loads a repository at the home folder once", async () => {
    const { repo } = await folders();
    await writeFile(join(repo, ".comprehende/theme.json"), "{}");

    assert.deepEqual(
      (await loadThemes(repo, repo)).map((theme) => theme.source),
      ["project"],
    );
  });

  it("names the file and the field when a theme is invalid", async () => {
    const { repo, home } = await folders();
    await writeFile(join(home, ".comprehende/theme.json"), '{"dark":{"primry":"#fff"}}');

    await assert.rejects(() => loadThemes(repo, home), /invalid theme .*theme\.json[\s\S]*primry/);
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
