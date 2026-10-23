import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReviewDocument } from "../../src/schema/types.ts";
import type { DeterministicReport } from "./checks.ts";
import { isCliHuntCall, type AgentRunResult } from "./musecode.ts";
import { rubricCounts, type RubricCounts, type RubricResult } from "./graders.ts";

export type CaseResult = {
  id: string;
  ok: boolean;
  durationMs: number;
  tokens: number;
  producer?: AgentRunResult;
  producerError?: string;
  validateError?: string;
  artifactError?: string;
  document?: Pick<ReviewDocument, "title" | "size" | "why">;
  checks?: DeterministicReport;
  rubric?: RubricResult;
  site?: string;
};

export type RunSummary = {
  stamp: string;
  skillTree: string;
  producerModel: string;
  graderModel: string;
  graders: boolean;
  cases: CaseResult[];
};

export function caseFailed(result: CaseResult): boolean {
  if (result.producerError !== undefined || result.validateError !== undefined) {
    return true;
  }
  return (result.checks?.failures.length ?? 0) > 0;
}

const REASON_MAX = 120;

export function producerFailureReason(error: string): string {
  const firstLine = (error.split("\n")[0] ?? "").trim();
  return firstLine.length > REASON_MAX ? `${firstLine.slice(0, REASON_MAX)}...` : firstLine;
}

export function formatCaseLine(result: CaseResult): string {
  const bits = [result.id];
  if (result.producerError !== undefined) {
    bits.push(`producer FAIL: ${producerFailureReason(result.producerError)}`);
  } else {
    bits.push(result.validateError === undefined ? "validate ok" : "validate FAIL");
  }
  const checks = result.checks;
  if (checks !== undefined) {
    bits.push(failed(checks, "sources") ? "sources FAIL" : "sources ok");
    bits.push(failed(checks, "why") ? `why ${checks.why} FAIL` : `why ${checks.why}`);
    bits.push(failed(checks, "parts") ? `parts ${checks.parts} FAIL` : `parts ${checks.parts}`);
    bits.push(
      failed(checks, "groups") ? `groups ${checks.groups} FAIL` : `groups ${checks.groups}`,
    );
    bits.push(failed(checks, "size") ? `size ${checks.size} FAIL` : `size ${checks.size}`);
    bits.push(`together ${checks.togetherOk}/${checks.togetherTotal}`);
    bits.push(`apart ${checks.apartOk}/${checks.apartTotal}`);
    if (failed(checks, "dependsOn")) {
      bits.push("dependsOn FAIL");
    }
    if (failed(checks, "worktree")) {
      bits.push("worktree dirty");
    }
    if (checks.lints.length > 0) {
      bits.push(`lint ${checks.lints.length}`);
    }
  }
  if (result.rubric !== undefined) {
    bits.push(...rubricBits(result.rubric));
  }
  if (result.artifactError !== undefined) {
    bits.push("artifact FAIL");
  }
  if (result.producer !== undefined) {
    bits.push(`${result.producer.steps} steps`);
  }
  bits.push(formatDuration(result.durationMs));
  bits.push(formatTokens(result.tokens));
  if (result.producer !== undefined) {
    bits.push(
      `producer ${formatTokens(result.producer.tokens)}`,
      ...efficiencyBits(
        result.producer.toolCalls.length,
        result.producer.inputTokens ?? 0,
        result.producer.cacheReadTokens ?? 0,
        result.producer.outputTokens ?? 0,
      ),
    );
  }
  if (result.rubric !== undefined) {
    bits.push(`grader ${formatTokens(result.rubric.run.tokens)}`);
    bits.push(`grader-tools ${result.rubric.run.toolCalls.length}`);
  }
  return bits.join("  ");
}

export function formatBaselineDelta(
  current: CaseResult,
  previous: CaseResult | undefined,
): string | undefined {
  if (previous === undefined) {
    return `${current.id}  new`;
  }
  const bits: string[] = [];
  if (caseFailed(current) !== caseFailed(previous)) {
    bits.push(caseFailed(current) ? "now FAIL" : "now ok");
  }
  const curFail = current.checks?.failures.length ?? 0;
  const prevFail = previous.checks?.failures.length ?? 0;
  if (curFail !== prevFail) {
    bits.push(`checks ${prevFail}->${curFail}`);
  }
  if (current.rubric !== undefined && previous.rubric !== undefined) {
    const cur = rubricCounts(current.rubric.output);
    const prev = rubricCounts(previous.rubric.output);
    for (const key of ["must", "good", "mustNot"] as const) {
      if (cur[key].yes !== prev[key].yes) {
        bits.push(`${key} ${prev[key].yes}->${cur[key].yes}/${cur[key].total}`);
      }
    }
    if (cur.bullets.holds !== prev.bullets.holds || cur.bullets.total !== prev.bullets.total) {
      bits.push(
        `bullets ${prev.bullets.holds}/${prev.bullets.total}->${cur.bullets.holds}/${cur.bullets.total}`,
      );
    }
  }
  if (bits.length === 0) {
    return undefined;
  }
  return `${current.id}  ${bits.join("  ")}`;
}

export async function writeCaseArtifacts(
  dir: string,
  result: CaseResult,
  extras: Record<string, string>,
): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "result.json"), `${JSON.stringify(result, null, 2)}\n`);
  for (const [name, body] of Object.entries(extras)) {
    await writeFile(join(dir, name), body);
  }
}

function failed(report: DeterministicReport, check: string): boolean {
  return report.failures.some((item) => item.check === check);
}

function rubricBits(rubric: RubricResult): string[] {
  if (rubric.parseError !== undefined) {
    return ["rubric parse FAIL"];
  }
  return formatRubricCounts(rubricCounts(rubric.output));
}

export function formatRubricCounts(counts: RubricCounts): string[] {
  return [
    `must ${counts.must.yes}/${counts.must.total}`,
    `good ${counts.good.yes}/${counts.good.total}`,
    `mustNot ${counts.mustNot.yes}/${counts.mustNot.total}`,
    `bullets ${counts.bullets.holds}/${counts.bullets.total} true`,
  ];
}

export function formatDuration(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}m${String(rest).padStart(2, "0")}s`;
}

export function formatTokens(tokens: number): string {
  if (tokens < 1000) {
    return `${tokens} tok`;
  }
  return `${Math.round(tokens / 1000)}k tok`;
}

export function formatRunTotals(summary: RunSummary): string {
  const producerTokens = sum(summary.cases, (item) => item.producer?.tokens ?? 0);
  const graderTokens = sum(summary.cases, (item) => item.rubric?.run.tokens ?? 0);
  const producerHunt = sum(
    summary.cases,
    (item) => item.producer?.toolCalls.filter(isCliHuntCall).length ?? 0,
  );
  const producerTools = sum(summary.cases, (item) => item.producer?.toolCalls.length ?? 0);
  const producerInput = sum(summary.cases, (item) => item.producer?.inputTokens ?? 0);
  const producerCacheRead = sum(summary.cases, (item) => item.producer?.cacheReadTokens ?? 0);
  const producerOutput = sum(summary.cases, (item) => item.producer?.outputTokens ?? 0);
  const graderTools = sum(summary.cases, (item) => item.rubric?.run.toolCalls.length ?? 0);
  const bits = [
    "total",
    formatTokens(producerTokens + graderTokens),
    `producer ${formatTokens(producerTokens)}`,
    ...efficiencyBits(producerTools, producerInput, producerCacheRead, producerOutput),
    `graders ${formatTokens(graderTokens)}`,
    `cli-hunt ${producerHunt}/${producerTools} producer tools`,
    `grader-tools ${graderTools}`,
  ];
  return bits.join("  ");
}

function efficiencyBits(tools: number, input: number, cacheRead: number, output: number): string[] {
  return [
    `producer-tools ${tools}`,
    `input ${formatTokens(input)}`,
    `cache-read ${formatTokens(cacheRead)}`,
    `output ${formatTokens(output)}`,
  ];
}

function sum<T>(items: readonly T[], value: (item: T) => number): number {
  return items.reduce((total, item) => total + value(item), 0);
}
