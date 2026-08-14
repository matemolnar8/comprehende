#!/usr/bin/env node

import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cmdGenerate } from "../src/cli/commands.ts";
import { createExampleRepo } from "../src/test/example-repo.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../fixtures/repo");
await rm(root, { recursive: true, force: true });
await mkdir(root, { recursive: true });
const repo = await createExampleRepo(root);
const dataPath = join(dirname(fileURLToPath(import.meta.url)), "../fixtures/example/review.json");
await mkdir(dirname(dataPath), { recursive: true });
await cmdGenerate(repo.root, dataPath, repo.base, repo.head);
console.log(`fixture repo: ${repo.root}`);
console.log(`base: ${repo.base}`);
console.log(`head: ${repo.head}`);
console.log(`review: ${dataPath}`);
console.log(`serve with cwd=${repo.root}:`);
console.log(`  node dist/cli/main.js serve --data ${dataPath} --port 4567`);
