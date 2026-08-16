#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { HunkIndex } from "../src/schema/types.ts";
import { writeCoveringDocument } from "../src/test/covering-document.ts";
import { createExampleRepo } from "../src/test/example-repo.ts";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const roots: string[] = [];

try {
  await run();
} finally {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
}

async function run(): Promise<void> {
  const packDir = await mkdtemp(join(tmpdir(), "comprehende-pack-"));
  roots.push(packDir);
  execFileSync("pnpm", ["pack", "--pack-destination", packDir], { cwd: repoRoot, stdio: "inherit" });

  const pkg = JSON.parse(await readFile(join(repoRoot, "package.json"), "utf8")) as { version: string };
  const tarball = join(packDir, `comprehende-${pkg.version}.tgz`);
  assert.equal(existsSync(tarball), true, `expected ${tarball}`);

  const listing = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" }).split("\n");
  for (const required of ["package/dist/cli/main.js", "package/dist/ui/index.html", "package/skills/comprehende/SKILL.md"]) {
    assert.equal(listing.includes(required), true, `tarball missing ${required}`);
  }

  const packedPkg = JSON.parse(execFileSync("tar", ["-xOf", tarball, "package/package.json"], { encoding: "utf8" })) as {
    dependencies?: Record<string, string>;
  };
  assert.deepEqual(packedPkg.dependencies ?? {}, {}, "packed tarball must not pull UI libraries");

  const installDir = await mkdtemp(join(tmpdir(), "comprehende-install-"));
  roots.push(installDir);
  await writeFile(join(installDir, "package.json"), `${JSON.stringify({ name: "pack-smoke-consumer", private: true }, null, 2)}\n`);
  execFileSync("npm", ["install", tarball, "--omit=dev"], { cwd: installDir, stdio: "inherit" });

  const bin = join(installDir, "node_modules/.bin/comprehende");
  assert.equal(existsSync(bin), true, "installed package must expose the comprehende bin");
  assert.equal(
    existsSync(join(installDir, "node_modules/comprehende/node_modules/@pierre")),
    false,
    "npx install must not pull @pierre/diffs",
  );

  const versionOut = execFileSync(bin, ["--version"], { encoding: "utf8" });
  assert.equal(versionOut.trim(), pkg.version, `packed bin --version: ${JSON.stringify(versionOut)}`);

  const work = await mkdtemp(join(tmpdir(), "comprehende-cwd-"));
  roots.push(work);
  const repo = await createExampleRepo(work);
  const dataPath = join(work, "review.json");

  const indexRaw = execFileSync(bin, ["index", "--base", repo.base, "--head", repo.head], {
    cwd: repo.root,
    encoding: "utf8",
  });
  const index = JSON.parse(indexRaw) as HunkIndex;
  assert.ok(index.hunks.length > 0, "index from packed bin returned no hunks");
  await writeCoveringDocument(dataPath, index);

  const validateOut = execFileSync(bin, ["validate", "--data", dataPath], {
    cwd: repo.root,
    encoding: "utf8",
  });
  assert.match(validateOut, /^ok\s/);

  const child = spawn(bin, ["serve", "--data", dataPath, "--port", "0"], {
    cwd: repo.root,
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    const url = await waitForLocalhost(child);
    const health = await fetch(`${url}/api/health`);
    assert.equal(health.status, 200);
    const page = await fetch(url);
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, /<div id="root">/);
  } finally {
    child.kill("SIGTERM");
    await waitForExit(child);
  }

  console.log("pack-smoke ok");
}

function waitForLocalhost(child: ReturnType<typeof spawn>): Promise<string> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      reject(new Error(`serve timed out\nstdout:\n${stdout}\nstderr:\n${stderr}`));
    }, 15_000);
    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
      const match = stdout.match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match?.[0] !== undefined) {
        clearTimeout(timer);
        resolve(match[0]);
      }
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        clearTimeout(timer);
        reject(new Error(`serve exited ${code}\nstdout:\n${stdout}\nstderr:\n${stderr}`));
      }
    });
  });
}

function waitForExit(child: ReturnType<typeof spawn>): Promise<void> {
  if (child.exitCode !== null) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    child.once("exit", () => resolve());
  });
}
