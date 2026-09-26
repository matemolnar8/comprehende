#!/usr/bin/env node

import { realpathSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { exportStaticSite } from "../../src/api/snapshot.ts";
import { openReview } from "../../src/api/live.ts";
import { cmdValidate } from "../../src/cli/commands.ts";
import { git } from "../../src/git/exec.ts";
import { findPackageRoot } from "../../src/package-root.ts";
import { loadDocument } from "../../src/review/load.ts";
import { EVAL_USAGE, parseEvalArgv } from "./args.ts";
import { listEvalCases, selectEvalCases, type EvalCase } from "./case.ts";
import { loadFrozenSourceValues, runDeterministicChecks } from "./checks.ts";
import {
  addDetachedWorktree,
  CASE_BUNDLE,
  cloneCaseBundle,
  ensureBareClone,
  fetchCaseRefs,
  removeWorktree,
  thisRepoMirror,
} from "./clone.ts";
import { groupingPrompt, prosePrompt, runGrader } from "./graders.ts";
import { parseGithubRepoRemote } from "./github.ts";
import { writeGradingPacket } from "./packet.ts";
import { producerPrompt, runProducer } from "./producer.ts";
import {
  caseFailed,
  claimsFromGrader,
  formatBaselineDelta,
  formatCaseLine,
  formatRunTotals,
  writeCaseArtifacts,
  type CaseResult,
  type RunSummary,
} from "./result.ts";
import { writeEvalReport } from "./report.ts";
import { copySkillForEval, readNextSkillMd } from "./skill.ts";

export async function runEval(argv: string[], packageRoot = findPackageRoot()): Promise<number> {
  const request = parseEvalArgv(argv);
  if (request.kind === "help") {
    console.log(EVAL_USAGE);
    return 0;
  }
  if (request.kind === "error") {
    console.error(request.message);
    console.error(`\n${EVAL_USAGE}`);
    return 1;
  }
  const rescoreDir = request.rescore === undefined ? undefined : resolve(request.rescore);
  const apiKey = process.env.CURSOR_API_KEY;
  if (rescoreDir === undefined && (apiKey === undefined || apiKey === "")) {
    console.error("CURSOR_API_KEY is not set");
    return 1;
  }
  const casesDir = join(packageRoot, "eval/cases");
  const selected = selectEvalCases(await listEvalCases(casesDir), { ids: request.ids, tag: request.tag });
  if (selected.length === 0) {
    console.error("no eval cases matched");
    return 1;
  }
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
  const runDir = join(packageRoot, "eval/runs", stamp);
  await mkdir(runDir, { recursive: true });
  const skillTree = (await git(packageRoot, ["rev-parse", "HEAD:skills-next/comprehende"])).trim();
  const skillMd = await readNextSkillMd(packageRoot);
  const summary: RunSummary = {
    stamp,
    skillTree,
    producerModel: request.producerModel,
    graderModel: request.graderModel,
    graders: rescoreDir === undefined && request.graders,
    cases: [],
  };
  for (const item of selected) {
    const result = await evalOneCase({
      packageRoot,
      runDir,
      spec: item.spec,
      caseDir: item.dir,
      skillMd,
      producerModel: request.producerModel,
      graderModel: request.graderModel,
      graders: rescoreDir === undefined && request.graders,
      sandbox: request.sandbox,
      apiKey: apiKey ?? "",
      rescoreDir,
    });
    summary.cases.push(result);
    console.log(formatCaseLine(result));
  }
  console.log(formatRunTotals(summary));
  await writeFile(join(runDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  const reportPath = await writeEvalReport(runDir, summary);
  console.error(`wrote ${reportPath}`);
  if (request.baseline !== undefined) {
    await printBaseline(request.baseline, summary);
  }
  if (request.json) {
    console.log(JSON.stringify(summary, null, 2));
  }
  return summary.cases.some(caseFailed) ? 1 : 0;
}

async function evalOneCase(opts: {
  packageRoot: string;
  runDir: string;
  spec: EvalCase;
  caseDir: string;
  skillMd: string;
  producerModel: string;
  graderModel: string;
  graders: boolean;
  sandbox: boolean;
  apiKey: string;
  rescoreDir?: string;
}): Promise<CaseResult> {
  const started = Date.now();
  const result: CaseResult = { id: opts.spec.id, ok: true, durationMs: 0, tokens: 0 };
  const caseOut = join(opts.runDir, opts.spec.id);
  await mkdir(caseOut, { recursive: true });
  const tmp = await mkdtemp(join(tmpdir(), `comprehende-eval-${opts.spec.id}-`));
  const repoCwd = join(tmp, "repo");
  const cacheDir = join(opts.packageRoot, "eval/.cache");
  let bare: string | undefined;
  try {
    const bundle = join(opts.caseDir, CASE_BUNDLE);
    if (existsSync(bundle)) {
      bare = join(tmp, "repo.git");
      await cloneCaseBundle({ bundle, dest: bare, base: opts.spec.base, repoUrl: opts.spec.repo });
    } else {
      bare = await ensureBareClone({
        cacheDir,
        repoUrl: opts.spec.repo,
        localMirror: await thisRepoMirror(opts.packageRoot, opts.spec.repo),
      });
      await fetchCaseRefs(bare, opts.spec.pr, opts.spec.base, opts.spec.head);
    }
    await addDetachedWorktree(bare, repoCwd, opts.spec.head);
    const sourcesDir = join(tmp, "sources");
    const reviewPath = join(tmp, "out/review.json");
    await mkdir(join(tmp, "out"), { recursive: true });
    const caseSources = join(opts.caseDir, "sources");
    if (existsSync(caseSources)) {
      await cp(caseSources, sourcesDir, { recursive: true });
    } else {
      await mkdir(sourcesDir);
    }
    if (opts.rescoreDir !== undefined) {
      const saved = join(opts.rescoreDir, opts.spec.id, "review.json");
      if (!existsSync(saved)) {
        result.producerError = `no saved review at ${saved}`;
      } else {
        await cp(saved, reviewPath);
      }
    } else {
      const cliPath = resolve(opts.packageRoot, "dist/cli/main.js");
      if (!existsSync(cliPath)) {
        throw new Error("dist/cli/main.js is missing. pnpm eval runs the build first.");
      }
      const skillDir = join(tmp, "skill");
      await copySkillForEval(opts.packageRoot, skillDir, cliPath);
      const producer = await runProducer({
        repoCwd,
        model: opts.producerModel,
        apiKey: opts.apiKey,
        sandbox: opts.sandbox,
        prompt: producerPrompt({
          repoCwd,
          skillMd: join(skillDir, "SKILL.md"),
          sourcesDir,
          outPath: reviewPath,
          base: opts.spec.base,
          head: opts.spec.head,
          cliPath,
        }),
      });
      result.producer = producer;
      await writeFile(join(caseOut, "producer.md"), producer.text);
      if (producer.status !== "finished" || producer.error !== undefined) {
        result.producerError = producer.error ?? `producer status ${producer.status}`;
      } else if (!existsSync(reviewPath)) {
        result.producerError = `producer did not write ${reviewPath}`;
      }
    }

    if (existsSync(reviewPath)) {
      await cp(reviewPath, join(caseOut, "review.json"));
      try {
        await cmdValidate(repoCwd, reviewPath);
      } catch (error) {
        result.validateError = error instanceof Error ? error.message : String(error);
      }
      let document: Awaited<ReturnType<typeof loadDocument>> | undefined;
      let frozen: unknown[] = [];
      try {
        document = await loadDocument(reviewPath);
        result.document = { title: document.title, size: document.size, why: document.why };
        frozen = await loadFrozenSourceValues(sourcesDir);
        result.checks = await runDeterministicChecks({
          cwd: repoCwd,
          document,
          expect: opts.spec.expect,
          frozen,
          repo: parseGithubRepoRemote(opts.spec.repo),
        });
      } catch (error) {
        result.validateError ??= error instanceof Error ? error.message : String(error);
      }
      if (document !== undefined && opts.graders) {
        try {
          const ctx = await openReview(repoCwd, document);
          const packetPath = join(caseOut, "packet.md");
          const packet = await writeGradingPacket(ctx, frozen, packetPath);
          const [grouping, prose] = await Promise.all([
            runGrader({
              repoCwd,
              model: opts.graderModel,
              apiKey: opts.apiKey,
              sandbox: opts.sandbox,
              prompt: groupingPrompt({ skillMd: opts.skillMd, packet }),
            }),
            runGrader({
              repoCwd,
              model: opts.graderModel,
              apiKey: opts.apiKey,
              sandbox: opts.sandbox,
              prompt: prosePrompt({
                skillMd: opts.skillMd,
                packet,
                claims: opts.spec.expect?.claims ?? [],
              }),
            }),
          ]);
          result.grouping = grouping;
          result.prose = prose;
          await writeFile(join(caseOut, "grouping.json"), `${JSON.stringify(grouping, null, 2)}\n`);
          await writeFile(join(caseOut, "prose.json"), `${JSON.stringify(prose, null, 2)}\n`);
          result.claims = claimsFromGrader(opts.spec.expect?.claims, prose);
          const site = join(caseOut, "site");
          await exportStaticSite({ cwd: repoCwd, dataPath: reviewPath, outDir: site, ctx });
          result.site = site;
        } catch (error) {
          result.artifactError = error instanceof Error ? error.message : String(error);
        }
      }
    }
  } catch (error) {
    result.producerError ??= error instanceof Error ? error.message : String(error);
  } finally {
    if (bare !== undefined) {
      await removeWorktree(bare, repoCwd);
    }
    await rm(tmp, { recursive: true, force: true });
  }
  result.ok = !caseFailed(result);
  result.tokens = (result.producer?.tokens ?? 0) + (result.grouping?.run.tokens ?? 0) + (result.prose?.run.tokens ?? 0);
  result.durationMs = Date.now() - started;
  await writeCaseArtifacts(caseOut, result, {});
  return result;
}

async function printBaseline(baselineDir: string, summary: RunSummary): Promise<void> {
  const previous = JSON.parse(await readFile(join(resolve(baselineDir), "summary.json"), "utf8")) as RunSummary;
  const byId = new Map(previous.cases.map((item) => [item.id, item]));
  console.log("baseline deltas");
  for (const item of summary.cases) {
    const line = formatBaselineDelta(item, byId.get(item.id));
    if (line !== undefined) {
      console.log(line);
    }
  }
}

const thisFile = fileURLToPath(import.meta.url);
if (isEvalCliEntry(thisFile, process.argv[1])) {
  process.exitCode = await runEval(process.argv.slice(2));
}

export function isEvalCliEntry(modulePath: string, argv1: string | undefined): boolean {
  if (argv1 === undefined) {
    return false;
  }
  try {
    if (realpathSync(modulePath) === realpathSync(argv1)) {
      return true;
    }
  } catch {
    // tsx shims
  }
  return resolve(argv1).replaceAll("\\", "/").endsWith("scripts/eval/run.ts");
}
