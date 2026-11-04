#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type Page } from "playwright";
import { loadDocument } from "../src/review/load.ts";
import { startServer } from "../src/server/http.ts";
import { THEME_STORAGE_KEY, type ResolvedTheme } from "../src/ui/lib/theme.ts";
import { loadEvalCase } from "./eval/case.ts";
import { addDetachedWorktree, CASE_BUNDLE, cloneCaseBundle } from "./eval/clone.ts";

// A real pull request from an eval case, with the review a model wrote for it during an eval run.
const CASE_ID = "cigster-99";
const REVIEW_FILE = "ui-screenshots.review.json";

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;

type Scene = {
  name: string;
  hash: string;
  viewport: keyof typeof VIEWPORTS;
  theme: ResolvedTheme;
  act?: (page: Page) => Promise<void>;
};

const group = (id: string) => `#group/${encodeURIComponent(id)}`;

const SCENES: readonly Scene[] = [
  { name: "1-overview", hash: "#overview", viewport: "desktop", theme: "light" },
  { name: "2-group", hash: group("living-room"), viewport: "desktop", theme: "dark" },
  { name: "3-group-many-files", hash: group("harness"), viewport: "desktop", theme: "light" },
  {
    name: "4-inspector-blame",
    hash: group("qr-fix"),
    viewport: "desktop",
    theme: "dark",
    act: async (page) => {
      await page
        .getByRole("button", { name: /open file/i })
        .first()
        .click();
      await page.getByRole("button", { name: "Blame", exact: true }).click();
    },
  },
  {
    name: "5-images",
    hash: group("visual-adoption"),
    viewport: "desktop",
    theme: "light",
    act: async (page) => {
      await page.getByRole("button", { name: /\.png/ }).first().click();
    },
  },
  { name: "6-mobile-group", hash: group("living-room"), viewport: "mobile", theme: "dark" },
];

async function settle(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.locator('[aria-busy="false"]').first().waitFor();
  // Strings, because scripts/ compiles without the DOM lib.
  await page.evaluate("document.fonts.ready");
  // Pierre paints diffs a few frames after the payload lands.
  await page.evaluate("new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))");
  await page.waitForTimeout(400);
}

async function shoot(opts: {
  browser: Browser;
  baseUrl: string;
  file: string;
  scene: Scene;
}): Promise<void> {
  const { scene } = opts;
  const context = await opts.browser.newContext({
    viewport: VIEWPORTS[scene.viewport],
    deviceScaleFactor: scene.viewport === "mobile" ? 2 : 1,
    colorScheme: scene.theme,
    reducedMotion: "reduce",
  });
  await context.addInitScript(([key, value]) => localStorage.setItem(key, value), [
    THEME_STORAGE_KEY,
    scene.theme,
  ] as const);
  const page = await context.newPage();
  try {
    await page.goto(`${opts.baseUrl}/${scene.hash}`);
    await settle(page);
    if (scene.act !== undefined) {
      await scene.act(page);
      await settle(page);
    }
    await page.screenshot({ path: opts.file });
  } finally {
    await context.close();
  }
}

async function buildRepo(
  packageRoot: string,
  root: string,
): Promise<{ cwd: string; dataPath: string }> {
  const caseDir = join(packageRoot, "eval/cases", CASE_ID);
  const spec = await loadEvalCase(caseDir);
  const bare = join(root, "repo.git");
  await cloneCaseBundle({
    bundle: join(caseDir, CASE_BUNDLE),
    dest: bare,
    base: spec.base,
    repoUrl: spec.repo,
  });
  const cwd = join(root, "repo");
  await addDetachedWorktree(bare, cwd, spec.head);
  const dataPath = join(root, "review.json");
  await copyFile(join(packageRoot, "scripts", REVIEW_FILE), dataPath);
  // Fail early when the saved review no longer parses under the current schema.
  await loadDocument(dataPath);
  return { cwd, dataPath };
}

export async function runUiScreenshots(opts: {
  packageRoot: string;
  outDir: string;
}): Promise<string[]> {
  execFileSync("pnpm", ["build"], { cwd: opts.packageRoot, stdio: "inherit" });
  const reposRoot = join(opts.packageRoot, "fixtures/screenshot-repos");
  await rm(reposRoot, { recursive: true, force: true });
  await rm(opts.outDir, { recursive: true, force: true });
  await mkdir(opts.outDir, { recursive: true });

  const built = await buildRepo(opts.packageRoot, reposRoot);
  const running = await startServer({ cwd: built.cwd, dataPath: built.dataPath, port: 0 });
  const written: string[] = [];
  try {
    const browser = await chromium.launch();
    try {
      for (const scene of SCENES) {
        const file = join(opts.outDir, `${scene.name}.${scene.theme}.png`);
        await shoot({ browser, baseUrl: running.url, file, scene });
        console.log(file);
        written.push(file);
      }
      return written;
    } finally {
      await browser.close();
    }
  } finally {
    running.server.close();
  }
}

const entry = process.argv[1]?.replaceAll("\\", "/");
if (entry !== undefined && /(?:^|\/)ui-screenshots\.(ts|js)$/.test(entry)) {
  const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const { values } = parseArgs({
    options: { out: { type: "string" } },
  });
  try {
    await runUiScreenshots({
      packageRoot,
      outDir: values.out ?? join(packageRoot, "fixtures/screenshots"),
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
