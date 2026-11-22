#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { git } from "../../src/git/exec.ts";
import { findPackageRoot } from "../../src/package-root.ts";
import { loadDocument } from "../../src/review/load.ts";
import { shortSha } from "../../src/schema/types.ts";
import { loadEvalCase } from "../eval/case.ts";
import { evalCacheDir } from "../eval/checkout.ts";
import { cachePath } from "../eval/clone.ts";
import type { RunSummary } from "../eval/result.ts";
import { duelCards, type DuelCard, type Side } from "./cards.ts";

const USAGE = `Usage: pnpm taste:cards -- <run dir> <run dir>

Cut the reviews two eval runs wrote for the same cases into duel cards for the Taste Lab page. Each run dir is an eval/runs/<stamp> folder. A card shows one piece (a summary, a why, a group, a note) from each run. The label of a side is its producer model and skill tree, so the same command compares two models or two skills. Prints a JSON array to stdout.
`;

const CODE_LINES_AROUND = 2;

type CodeLine = [line: number, text: string];
type LoadedCard = Omit<DuelCard, "anchor"> & { code?: { on: number; lines: CodeLine[] } };

type Run = { dir: string; label: string };

async function loadRun(dir: string): Promise<Run> {
  // The eval runner wrote this file, so its shape is trusted.
  const summary = JSON.parse(await readFile(join(dir, "summary.json"), "utf8")) as RunSummary;
  const effort = summary.producerEffort === undefined ? "" : ` ${summary.producerEffort}`;
  return { dir, label: `${summary.producerModel}${effort} @ ${shortSha(summary.skillTree)}` };
}

async function reviewFolders(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && existsSync(join(dir, entry.name, "review.json")))
    .map((entry) => entry.name);
}

async function loadSide(run: Run, folder: string): Promise<Side | undefined> {
  try {
    return { label: run.label, document: await loadDocument(join(run.dir, folder, "review.json")) };
  } catch (error) {
    console.error(
      `skip ${folder} in ${run.dir}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return undefined;
  }
}

type CaseClone = { repoDir: string; head: string };

/** Undefined when the run holds a case this checkout no longer has. */
async function caseClone(caseDir: string, cacheDir: string): Promise<CaseClone | undefined> {
  if (!existsSync(join(caseDir, "case.json"))) {
    return undefined;
  }
  const spec = await loadEvalCase(caseDir);
  return { repoDir: cachePath(cacheDir, spec.repo), head: spec.head };
}

/** A line note needs its code. Without the cached clone the card is dropped. */
async function withCode(
  card: DuelCard,
  clone: CaseClone | undefined,
): Promise<LoadedCard | undefined> {
  const { anchor, ...rest } = card;
  if (anchor === undefined) {
    return rest;
  }
  if (clone === undefined) {
    return undefined;
  }
  const file = await git(clone.repoDir, ["show", `${clone.head}:${anchor.path}`], {
    allowFail: true,
  });
  const all = file.split("\n");
  if (file === "" || all.length < anchor.line) {
    return undefined;
  }
  const start = Math.max(1, anchor.line - CODE_LINES_AROUND);
  const picked = all.slice(start - 1, anchor.line + CODE_LINES_AROUND);
  const indent = Math.min(
    ...picked.filter((line) => line.trim() !== "").map((line) => line.search(/\S/)),
  );
  const lines = picked.map((line, index): CodeLine => [
    start + index,
    line.slice(indent).replaceAll("\t", "  "),
  ]);
  return { ...rest, code: { on: anchor.line, lines } };
}

async function main(argv: string[]): Promise<number> {
  const dirs = argv.filter((arg) => arg !== "--");
  const [first, second] = dirs;
  if (first === undefined || second === undefined || dirs.length !== 2 || first.startsWith("-")) {
    console.error(USAGE);
    return dirs.includes("--help") || dirs.includes("-h") ? 0 : 1;
  }
  const packageRoot = findPackageRoot();
  const cacheDir = await evalCacheDir(packageRoot);
  const [x, y] = await Promise.all([loadRun(resolve(first)), loadRun(resolve(second))]);
  const shared = new Set(await reviewFolders(y.dir));
  const folders = (await reviewFolders(x.dir)).filter((folder) => shared.has(folder)).sort();

  const cards: LoadedCard[] = [];
  for (const folder of folders) {
    const [left, right] = await Promise.all([loadSide(x, folder), loadSide(y, folder)]);
    if (left === undefined || right === undefined) {
      continue;
    }
    // A repeated run names its folders <case>.t<n>.
    const caseId = folder.replace(/\.t\d+$/, "");
    const clone = await caseClone(join(packageRoot, "eval/cases", caseId), cacheDir);
    for (const card of duelCards(folder, left, right)) {
      const loaded = await withCode(card, clone);
      if (loaded !== undefined) {
        cards.push(loaded);
      }
    }
  }
  console.error(
    `${cards.length} cards from ${folders.length} shared reviews: ${x.label} vs ${y.label}`,
  );
  console.log(JSON.stringify(cards, null, 2));
  return 0;
}

process.exitCode = await main(process.argv.slice(2));
