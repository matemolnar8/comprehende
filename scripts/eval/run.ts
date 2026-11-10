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
import { skillPaths } from "../../src/schema/skill-paths.ts";
import { EVAL_USAGE, parseEvalArgv } from "./args.ts";
import { listEvalCases, selectEvalCases, type EvalCase, type Rubric } from "./case.ts";
import { loadFrozenSourceValues, runDeterministicChecks } from "./checks.ts";
import { evalCacheDir } from "./checkout.ts";
import { loadDotEnv } from "./env.ts";
import {
  addDetachedWorktree,
  CASE_BUNDLE,
  cloneCaseBundle,
  cloneCaseFromCache,
  thisRepoMirror,
} from "./clone.ts";
import { claimBullets, runRubricGrader } from "./graders.ts";
import { contributorModel } from "./musecode.ts";
import { parseGithubRepoRemote } from "./github.ts";
import { writeGradingPacket } from "./packet.ts";
import { producerPrompt, runProducer } from "./producer.ts";
import {
  caseFailed,
  caseKey,
  formatBaselineDelta,
  formatCaseLine,
  formatRunTotals,
  formatTrialTotals,
  producerFailureReason,
  writeCaseArtifacts,
  type CaseResult,
  type RunSummary,
} from "./result.ts";
import { writeEvalReport } from "./report.ts";
import { snapshotSkill } from "./skill.ts";

/** A run either produces new reviews with one skill snapshot, or rescores saved reviews. */
type CaseMode =
  | { kind: "produce"; cliPath: string; skillMd: string }
  | { kind: "rescore"; dir: string };

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
  await loadDotEnv(packageRoot);
  // The muse CLI login spends the subscription and is the default. Only an
  // explicit --use-api-key spends API credit; CI passes it. An empty key makes
  // muse use its CLI login.
  const apiKey =
    request.useApiKey && !request.cliLogin ? (process.env.MUSE_CODE_API_KEY ?? "") : "";
  if (request.useApiKey && !request.cliLogin && apiKey === "") {
    console.error(
      "--use-api-key set but MUSE_CODE_API_KEY is empty; refusing to spend the subscription instead",
    );
    return 1;
  }
  const gradersOn = request.graders;
  const casesDir = join(packageRoot, "eval/cases");
  const selected = selectEvalCases(await listEvalCases(casesDir), {
    ids: request.ids,
    tag: request.tag,
  });
  if (selected.length === 0) {
    console.error("no eval cases matched");
    return 1;
  }
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
  const runDir = join(packageRoot, "eval/runs", stamp);
  await mkdir(runDir, { recursive: true });
  let mode: CaseMode;
  let skillTree: string;
  if (rescoreDir === undefined) {
    const cliPath = resolve(packageRoot, "dist/cli/main.js");
    if (!existsSync(cliPath)) {
      console.error("dist/cli/main.js is missing. Run pnpm build, or use pnpm eval.");
      return 1;
    }
    const source =
      request.skill === undefined ? skillPaths(packageRoot).nextSkill : resolve(request.skill);
    const skillDir = join(runDir, "skill");
    skillTree = await snapshotSkill(source, skillDir, cliPath);
    if (request.skill === undefined) {
      const committed = await git(packageRoot, ["rev-parse", "HEAD:skills-next/comprehende"], {
        allowFail: true,
      });
      if (committed.trim() !== skillTree) {
        console.error(
          "skills-next/comprehende has uncommitted edits. This run uses them. skillTree in summary.json is the tree of the edited copy.",
        );
      }
    }
    mode = { kind: "produce", cliPath, skillMd: join(skillDir, "SKILL.md") };
  } else {
    skillTree = (await readSummary(rescoreDir).catch(() => undefined))?.skillTree ?? "unknown";
    mode = { kind: "rescore", dir: rescoreDir };
  }
  const cacheDir = await evalCacheDir(packageRoot);
  const runs = selected.flatMap((item) =>
    Array.from({ length: request.repeat }, (_, index) => ({
      item,
      trial: request.repeat > 1 ? index + 1 : undefined,
    })),
  );
  const cases = await mapPool(runs, request.jobs, async ({ item, trial }) => {
    const result = await evalOneCase({
      packageRoot,
      runDir,
      cacheDir,
      spec: item.spec,
      trial,
      rubric: item.rubric,
      caseDir: item.dir,
      producerModel: request.producerModel,
      graderModel: request.graderModel,
      graders: gradersOn,
      apiKey,
      mode,
      keep: request.keep,
    });
    console.log(formatCaseLine(result));
    return result;
  });
  const summary: RunSummary = {
    stamp,
    skillTree,
    skill: request.skill,
    producerModel: contributorModel(request.producerModel),
    graderModel: contributorModel(request.graderModel),
    graders: gradersOn,
    cases,
  };
  if (request.repeat > 1) {
    for (const line of formatTrialTotals(cases)) {
      console.log(line);
    }
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

/** Like Promise.all over items, with at most `size` calls in flight. Keeps input order. */
async function mapPool<T, R>(
  items: readonly T[],
  size: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const queue = [...items.entries()];
  const out: R[] = [];
  const worker = async (): Promise<void> => {
    for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
      const [index, item] = next;
      out[index] = await fn(item);
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
  return out;
}

async function evalOneCase(opts: {
  packageRoot: string;
  runDir: string;
  cacheDir: string;
  spec: EvalCase;
  trial: number | undefined;
  rubric: Rubric;
  caseDir: string;
  producerModel: string;
  graderModel: string;
  graders: boolean;
  apiKey: string;
  mode: CaseMode;
  keep: boolean;
}): Promise<CaseResult> {
  const started = Date.now();
  const result: CaseResult = {
    id: opts.spec.id,
    trial: opts.trial,
    ok: true,
    durationMs: 0,
    tokens: 0,
  };
  const key = caseKey(result);
  const caseOut = join(opts.runDir, key);
  await mkdir(caseOut, { recursive: true });
  const tmp = await mkdtemp(join(tmpdir(), `comprehende-eval-${key}-`));
  const repoCwd = join(tmp, "repo");
  try {
    const bare = join(tmp, "repo.git");
    const bundle = join(opts.caseDir, CASE_BUNDLE);
    if (existsSync(bundle)) {
      await cloneCaseBundle({ bundle, dest: bare, base: opts.spec.base, repoUrl: opts.spec.repo });
    } else {
      await cloneCaseFromCache({
        cacheDir: opts.cacheDir,
        repoUrl: opts.spec.repo,
        localMirror: await thisRepoMirror(opts.packageRoot, opts.spec.repo),
        pr: opts.spec.pr,
        base: opts.spec.base,
        head: opts.spec.head,
        dest: bare,
      });
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
    if (opts.mode.kind === "rescore") {
      const saved = join(opts.mode.dir, key, "review.json");
      if (!existsSync(saved)) {
        result.producerError = `no saved review at ${saved}`;
      } else {
        await cp(saved, reviewPath);
      }
    } else {
      const prompt = producerPrompt({
        repoCwd,
        skillMd: opts.mode.skillMd,
        sourcesDir,
        outPath: reviewPath,
        base: opts.spec.base,
        head: opts.spec.head,
        cliPath: opts.mode.cliPath,
      });
      const runProducerOnce = (): Promise<
        Awaited<ReturnType<typeof runProducer>> | { thrown: string }
      > =>
        runProducer({ repoCwd, model: opts.producerModel, apiKey: opts.apiKey, prompt }).catch(
          (error: unknown) => ({
            thrown: error instanceof Error ? error.message : String(error),
          }),
        );
      let producer = await runProducerOnce();
      // Retry once when the agent run itself failed and wrote no review.
      // Validate and size gates still fail the case without a retry.
      const attemptFailed =
        "thrown" in producer || producer.status !== "finished" || producer.error !== undefined;
      if (attemptFailed && !existsSync(reviewPath)) {
        console.error(`${key} producer attempt 1 failed, retrying once`);
        producer = await runProducerOnce();
      }
      if ("thrown" in producer) {
        result.producerError = producer.thrown;
      } else {
        result.producer = producer;
        await writeFile(join(caseOut, "producer.md"), producer.text);
        if (producer.status !== "finished" || producer.error !== undefined) {
          result.producerError = producer.error ?? `producer status ${producer.status}`;
        } else if (!existsSync(reviewPath)) {
          result.producerError = `producer did not write ${reviewPath}`;
        }
      }
      if (result.producerError !== undefined) {
        console.error(`${key} producer FAIL: ${producerFailureReason(result.producerError)}`);
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
          const bullets = claimBullets(document);
          const rubricSize =
            opts.rubric.must.length + opts.rubric.good.length + opts.rubric.mustNot.length;
          if (rubricSize + bullets.length > 0) {
            const rubric = await runRubricGrader({
              repoCwd,
              model: opts.graderModel,
              apiKey: opts.apiKey,
              rubric: opts.rubric,
              bullets,
              packet,
            });
            result.rubric = rubric;
            await writeFile(join(caseOut, "rubric.json"), `${JSON.stringify(rubric, null, 2)}\n`);
          }
          const site = join(caseOut, "site");
          await exportStaticSite({ cwd: repoCwd, dataPath: reviewPath, outDir: site });
          result.site = site;
        } catch (error) {
          result.artifactError = error instanceof Error ? error.message : String(error);
        }
      }
    }
  } catch (error) {
    result.producerError ??= error instanceof Error ? error.message : String(error);
  } finally {
    if (opts.keep) {
      result.clone = repoCwd;
    } else {
      await rm(tmp, { recursive: true, force: true });
    }
  }
  result.ok = !caseFailed(result);
  result.tokens = (result.producer?.tokens ?? 0) + (result.rubric?.run.tokens ?? 0);
  result.durationMs = Date.now() - started;
  await writeCaseArtifacts(caseOut, result, {});
  return result;
}

async function readSummary(runDir: string): Promise<RunSummary> {
  return JSON.parse(await readFile(join(resolve(runDir), "summary.json"), "utf8")) as RunSummary;
}

async function printBaseline(baselineDir: string, summary: RunSummary): Promise<void> {
  const previous = await readSummary(baselineDir);
  const byKey = new Map(previous.cases.map((item) => [caseKey(item), item]));
  console.log("baseline deltas");
  for (const item of summary.cases) {
    const line = formatBaselineDelta(item, byKey.get(caseKey(item)));
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
