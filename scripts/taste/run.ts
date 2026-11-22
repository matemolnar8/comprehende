#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { git } from "../../src/git/exec.ts";
import { findPackageRoot } from "../../src/package-root.ts";
import { loadDocument } from "../../src/review/load.ts";
import { shortSha } from "../../src/schema/types.ts";
import { loadEvalCase } from "../eval/case.ts";
import { evalCacheDir } from "../eval/checkout.ts";
import { cachePath } from "../eval/clone.ts";
import { loadDotEnv } from "../eval/env.ts";
import type { RunSummary } from "../eval/result.ts";
import { DUEL_KINDS, duelCards, type DuelCard, type Side } from "./cards.ts";
import {
  ideasSchema,
  limitDuels,
  makeRound,
  parseRound,
  readCode,
  tally,
  type CodeLine,
  type Duel,
  type Idea,
} from "./round.ts";

const USAGE = `Usage:
  pnpm taste:page -- --run [<label>=]<run dir> --run [<label>=]<run dir> [options]
  pnpm taste:read -- <code>

page writes one self-contained HTML page of blind duels and idea cards, and prints its path.
A duel shows one piece (a summary, a why, a group, a note) that two eval runs wrote for the same case. Each run dir is an eval/runs/<stamp> folder. Three or more runs duel in every pair. Without a label, a side is named by its skill folder, or by its producer model and skill tree.

  --run [<label>=]<dir>  An eval run. Repeat it
  --kind <kind>          Keep only these pieces: ${DUEL_KINDS.join(", ")}. Repeat it
  --limit <n>            Keep at most n duels. Default 24
  --ideas <file>         JSON array of { idea, before, after } to show as idea cards

The page ends on a code that holds every answer. When TASTE_WEBHOOK_URL is set (environment or .env), the page also sends the code there, so a page built with it must stay private.

read takes that code and prints the picks with their texts, and the wins per side, as JSON.

Rounds live in the git dir that all worktrees share, so any checkout can read a code.
`;

const CODE_LINES_AROUND = 2;

type Run = { dir: string; label: string };

async function loadRun(arg: string): Promise<Run> {
  const split = arg.indexOf("=");
  const dir = resolve(split === -1 ? arg : arg.slice(split + 1));
  if (split !== -1) {
    return { dir, label: arg.slice(0, split) };
  }
  // The eval runner wrote this file, so its shape is trusted.
  const summary = JSON.parse(await readFile(join(dir, "summary.json"), "utf8")) as RunSummary;
  if (summary.skill !== undefined) {
    return { dir, label: basename(summary.skill) };
  }
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
async function withCode(card: DuelCard, clone: CaseClone | undefined): Promise<Duel | undefined> {
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

async function pairDuels(x: Run, y: Run, packageRoot: string, cacheDir: string): Promise<Duel[]> {
  const shared = new Set(await reviewFolders(y.dir));
  const folders = (await reviewFolders(x.dir)).filter((folder) => shared.has(folder)).sort();
  const duels: Duel[] = [];
  for (const folder of folders) {
    const [left, right] = await Promise.all([loadSide(x, folder), loadSide(y, folder)]);
    if (left === undefined || right === undefined) {
      continue;
    }
    // A repeated run names its folders <case>.t<n>.
    const caseId = folder.replace(/\.t\d+$/, "");
    const clone = await caseClone(join(packageRoot, "eval/cases", caseId), cacheDir);
    for (const card of duelCards(folder, left, right)) {
      const duel = await withCode(card, clone);
      if (duel !== undefined) {
        duels.push(duel);
      }
    }
  }
  return duels;
}

function isKind(value: string): value is DuelCard["kind"] {
  return (DUEL_KINDS as readonly string[]).includes(value);
}

/** Beside the eval clone cache, in the git dir the main checkout and its worktrees share. */
function roundDir(cacheDir: string, roundId: string): string {
  return join(dirname(cacheDir), "comprehende-taste", roundId);
}

async function page(argv: string[], packageRoot: string, cacheDir: string): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: {
      run: { type: "string", multiple: true, default: [] },
      kind: { type: "string", multiple: true, default: [] },
      limit: { type: "string", default: "24" },
      ideas: { type: "string" },
    },
  });
  const limit = Number(values.limit);
  const badKind = values.kind.find((kind) => !isKind(kind));
  if (!Number.isInteger(limit) || limit < 1 || badKind !== undefined) {
    console.error(badKind === undefined ? USAGE : `unknown kind "${badKind}"\n\n${USAGE}`);
    return 1;
  }
  const kinds = values.kind.filter(isKind);
  const ideas: Idea[] =
    values.ideas === undefined
      ? []
      : ideasSchema.parse(JSON.parse(await readFile(resolve(values.ideas), "utf8")));
  if (values.run.length === 1 || (values.run.length === 0 && ideas.length === 0)) {
    console.error(`give two or more --run, or --ideas\n\n${USAGE}`);
    return 1;
  }

  const runs = await Promise.all(values.run.map(loadRun));
  const repeated = runs.find((run, index) => runs.findIndex((r) => r.label === run.label) < index);
  if (repeated !== undefined) {
    console.error(`two runs share the label "${repeated.label}". Name them: --run <label>=<dir>`);
    return 1;
  }
  const all: Duel[] = [];
  for (const [index, x] of runs.entries()) {
    for (const y of runs.slice(index + 1)) {
      all.push(...(await pairDuels(x, y, packageRoot, cacheDir)));
    }
  }
  const wanted = kinds.length === 0 ? all : all.filter((duel) => kinds.includes(duel.kind));
  const round = makeRound(limitDuels(wanted, limit), ideas);

  await loadDotEnv(packageRoot);
  const webhook = process.env["TASTE_WEBHOOK_URL"] ?? null;
  const out = roundDir(cacheDir, round.id);
  await mkdir(out, { recursive: true });
  const template = await readFile(join(import.meta.dirname, "page.html"), "utf8");
  // "<" is escaped so no card text can close the script tag.
  const data = JSON.stringify({ ...round, webhook }).replaceAll("<", "\\u003c");
  await writeFile(
    join(out, "index.html"),
    template.replace('"__ROUND__"', () => data),
  );
  await writeFile(join(out, "round.json"), `${JSON.stringify(round, null, 2)}\n`);
  console.error(
    `round ${round.id}: ${round.duels.length} of ${wanted.length} duels, ${round.ideas.length} ideas${webhook === null ? "" : ", sends its code to the webhook"}`,
  );
  console.log(join(out, "index.html"));
  return 0;
}

async function read(argv: string[], cacheDir: string): Promise<number> {
  const [code] = argv;
  const id = code?.split(".")[1];
  if (code === undefined || id === undefined || !/^[0-9a-f]+$/.test(id)) {
    console.error(USAGE);
    return 1;
  }
  const file = join(roundDir(cacheDir, id), "round.json");
  if (!existsSync(file)) {
    console.error(`no round ${id} on this machine: ${file}`);
    return 1;
  }
  const picks = readCode(parseRound(await readFile(file, "utf8")), code);
  const duels = picks.duels.map(({ duel, answer }) => ({
    kind: duel.kind,
    context: duel.context,
    answer,
    ...(answer === "x" ? { picked: duel.x, other: duel.y } : {}),
    ...(answer === "y" ? { picked: duel.y, other: duel.x } : {}),
    ...(answer === "same" || answer === "both-bad" ? { x: duel.x, y: duel.y } : {}),
  }));
  console.log(JSON.stringify({ tally: tally(picks), duels, ideas: picks.ideas }, null, 2));
  return 0;
}

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv.filter((arg) => arg !== "--");
  const packageRoot = findPackageRoot();
  const cacheDir = await evalCacheDir(packageRoot);
  if (command === "page") {
    return page(rest, packageRoot, cacheDir);
  }
  if (command === "read") {
    return read(rest, cacheDir);
  }
  console.error(USAGE);
  return command === "--help" || command === "-h" ? 0 : 1;
}

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
