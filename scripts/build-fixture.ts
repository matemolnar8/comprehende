#!/usr/bin/env node

import { mkdir, rm } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_PORT } from "../src/cli/args.ts";
import { cmdIndex } from "../src/cli/commands.ts";
import { writeMixedCoveringDocument } from "../src/test/covering-document.ts";
import { createExampleRepo, type ExampleRepo } from "../src/test/example-repo.ts";

export type BuiltFixture = {
  repo: ExampleRepo;
  dataPath: string;
};

export function fixtureCommands(opts: {
  cwd: string;
  packageRoot: string;
  dataPath: string;
  port?: number;
}): { serve: string; export: string } {
  const cli = relative(opts.cwd, join(opts.packageRoot, "dist/cli/main.js"));
  const data = relative(opts.cwd, opts.dataPath);
  const out = relative(opts.cwd, join(opts.packageRoot, "fixtures/site"));
  const port = opts.port ?? DEFAULT_PORT;
  return {
    serve: `node ${cli} serve --data ${data} --port ${port}`,
    export: `node ${cli} export --data ${data} --out ${out}`,
  };
}

export async function buildExampleFixture(packageRoot: string): Promise<BuiltFixture> {
  const root = join(packageRoot, "fixtures/repo");
  await rm(root, { recursive: true, force: true });
  await mkdir(root, { recursive: true });
  const repo = await createExampleRepo(root);
  const dataPath = join(packageRoot, "fixtures/example/review.json");
  await mkdir(dirname(dataPath), { recursive: true });
  const index = await cmdIndex(repo.root, repo.base, repo.head);
  await writeMixedCoveringDocument(dataPath, index);
  return { repo, dataPath };
}

function parseFixtureArgv(argv: string[]): void {
  for (const arg of argv) {
    if (arg === "--mixed") {
      continue;
    }
    throw new Error(`unknown argument: ${arg}\n\nUsage: pnpm fixture [--mixed]`);
  }
}

function printFixture(packageRoot: string, built: BuiltFixture): void {
  const printed = fixtureCommands({
    cwd: built.repo.root,
    packageRoot,
    dataPath: built.dataPath,
  });
  console.log(`fixture repo: ${built.repo.root}`);
  console.log(`base: ${built.repo.base}`);
  console.log(`head: ${built.repo.head}`);
  console.log(`review: ${built.dataPath}`);
  console.log(`serve with cwd=${built.repo.root}:`);
  console.log(`  ${printed.serve}`);
  console.log(`export with cwd=${built.repo.root}:`);
  console.log(`  ${printed.export}`);
}

const thisFile = fileURLToPath(import.meta.url);
const entry = process.argv[1]?.replaceAll("\\", "/");
if (entry !== undefined && /(?:^|\/)build-fixture\.(ts|js)$/.test(entry)) {
  parseFixtureArgv(process.argv.slice(2));
  const packageRoot = join(dirname(thisFile), "..");
  const built = await buildExampleFixture(packageRoot);
  printFixture(packageRoot, built);
}
