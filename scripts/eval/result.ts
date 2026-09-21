import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReviewDocument } from "../../src/schema/types.ts";
import type { DeterministicReport } from "./checks.ts";
import type { AgentRunResult } from "./agent.ts";
import type { Finding, GraderResult } from "./graders.ts";

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
  grouping?: GraderResult;
  prose?: GraderResult;
  claims?: { stated: number; total: number; missing: string[] };
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

export function formatCaseLine(result: CaseResult): string {
  const bits = [result.id];
  if (result.producerError !== undefined) {
    bits.push("producer FAIL");
  } else {
    bits.push(result.validateError === undefined ? "validate ok" : "validate FAIL");
  }
  const checks = result.checks;
  if (checks !== undefined) {
    bits.push(failed(checks, "sources") ? "sources FAIL" : "sources ok");
    bits.push(failed(checks, "why") ? `why ${checks.why} FAIL` : `why ${checks.why}`);
    bits.push(failed(checks, "parts") ? `parts ${checks.parts} FAIL` : `parts ${checks.parts}`);
    bits.push(failed(checks, "size") ? `size ${checks.size} FAIL` : `size ${checks.size}`);
    bits.push(`together ${checks.togetherOk}/${checks.togetherTotal}`);
    bits.push(`apart ${checks.apartOk}/${checks.apartTotal}`);
    if (failed(checks, "worktree")) {
      bits.push("worktree dirty");
    }
    if (checks.lints.length > 0) {
      bits.push(`lint ${checks.lints.length}`);
    }
  }
  if (result.claims !== undefined) {
    bits.push(`claims ${result.claims.stated}/${result.claims.total}`);
  }
  if (result.grouping !== undefined) {
    bits.push(findingCounts("grouping", result.grouping));
  }
  if (result.prose !== undefined) {
    bits.push(findingCounts("prose", result.prose));
  }
  if (result.artifactError !== undefined) {
    bits.push("artifact FAIL");
  }
  bits.push(formatDuration(result.durationMs));
  bits.push(formatTokens(result.tokens));
  return bits.join("  ");
}

export function formatBaselineDelta(current: CaseResult, previous: CaseResult | undefined): string | undefined {
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
  const curG = countFindings(current.grouping);
  const prevG = countFindings(previous.grouping);
  if (curG.major !== prevG.major || curG.minor !== prevG.minor) {
    bits.push(`grouping ${prevG.major}M${prevG.minor}m->${curG.major}M${curG.minor}m`);
  }
  const curP = countFindings(current.prose);
  const prevP = countFindings(previous.prose);
  if (curP.major !== prevP.major || curP.minor !== prevP.minor) {
    bits.push(`prose ${prevP.major}M${prevP.minor}m->${curP.major}M${curP.minor}m`);
  }
  if (bits.length === 0) {
    return undefined;
  }
  return `${current.id}  ${bits.join("  ")}`;
}

export async function writeCaseArtifacts(dir: string, result: CaseResult, extras: Record<string, string>): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "result.json"), `${JSON.stringify(result, null, 2)}\n`);
  for (const [name, body] of Object.entries(extras)) {
    await writeFile(join(dir, name), body);
  }
}

function failed(report: DeterministicReport, check: string): boolean {
  return report.failures.some((item) => item.check === check);
}

function findingCounts(label: string, grader: GraderResult | undefined): string {
  if (grader === undefined) {
    return `${label} -`;
  }
  if (grader.parseError !== undefined) {
    return `${label} parse FAIL`;
  }
  const { major, minor } = countFindings(grader);
  return `${label} ${major}M ${minor}m`;
}

function countFindings(grader: GraderResult | undefined): { major: number; minor: number } {
  const findings: Finding[] = grader?.output.findings ?? [];
  return {
    major: findings.filter((item) => item.severity === "major").length,
    minor: findings.filter((item) => item.severity === "minor").length,
  };
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

export function claimsFromGrader(expected: string[] | undefined, grader: GraderResult | undefined): CaseResult["claims"] {
  if (expected === undefined || expected.length === 0) {
    return undefined;
  }
  const verdicts = grader?.output.claims ?? [];
  const missing: string[] = [];
  let stated = 0;
  for (const claim of expected) {
    const hit = verdicts.find((item) => item.claim === claim);
    if (hit?.stated === true) {
      stated += 1;
    } else {
      missing.push(claim);
    }
  }
  return { stated, total: expected.length, missing };
}
