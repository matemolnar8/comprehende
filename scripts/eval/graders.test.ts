import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GRADER_TOOLS } from "./constants.ts";
import { groupingPrompt, parseGraderJson, prosePrompt } from "./graders.ts";
import { caseFailed, formatCaseLine, formatDuration, formatRunTotals, formatTokens, type CaseResult } from "./result.ts";
import type { AgentRunResult } from "./agent.ts";

const finishedRun: AgentRunResult = {
  text: "",
  status: "finished",
  durationMs: 1,
  tokens: 1,
  steps: 1,
  toolCalls: [],
};

const skillStub = `## Grouping rules

Group by review concern.

## The why

Document why.

## The what

Document summary.

## lookFor

Claims the live diff does not make obvious.

## Write the prose

Short sentences.
`;

describe("grader JSON", () => {
  it("parses fenced objects", () => {
    const output = parseGraderJson(`Here you go\n\`\`\`json\n{"findings":[{"check":"concern","severity":"minor","where":"g1","note":"Directory grouped."}]}\n\`\`\``);
    assert.equal(output.findings.length, 1);
    assert.equal(output.findings[0]?.check, "concern");
  });

  it("rejects junk", () => {
    assert.throws(() => parseGraderJson("no json here"));
  });
});

describe("eval result line", () => {
  it("formats duration and tokens", () => {
    assert.equal(formatDuration(12_000), "12s");
    assert.equal(formatDuration(252_000), "4m12s");
    assert.equal(formatTokens(212_000), "212k tok");
  });

  it("prints validate and finding counts", () => {
    const result: CaseResult = {
      id: "comprehende-47",
      ok: true,
      durationMs: 252_000,
      tokens: 212_000,
      checks: {
        failures: [],
        lints: [],
        dirtyWorktree: false,
        why: "present",
        parts: 2,
        size: "large",
        togetherOk: 2,
        togetherTotal: 2,
        apartOk: 1,
        apartTotal: 1,
      },
      grouping: { run: finishedRun, output: { findings: [{ check: "x", severity: "major", where: "g", note: "n" }] } },
      prose: { run: finishedRun, output: { findings: [] } },
      claims: { stated: 4, total: 5, missing: ["one"] },
    };
    const line = formatCaseLine(result);
    assert.match(line, /comprehende-47/);
    assert.match(line, /validate ok/);
    assert.match(line, /claims 4\/5/);
    assert.match(line, /grouping 1M 0m/);
    assert.match(line, /4m12s/);
    assert.match(line, /g-tools 0/);
    assert.match(line, /p-tools 0/);
  });

  it("inlines the packet and forbids tools", () => {
    assert.deepEqual([...GRADER_TOOLS], []);
    const grouping = groupingPrompt({ skillMd: skillStub, packet: "PACKET_UNIQUE_7f3a" });
    assert.match(grouping, /PACKET_UNIQUE_7f3a/);
    assert.match(grouping, /Do not use tools/);
    assert.doesNotMatch(grouping, /work tree/);
    assert.doesNotMatch(grouping, /packetPath/);
    const prose = prosePrompt({ skillMd: skillStub, packet: "PACKET_UNIQUE_7f3a", claims: ["claim one"] });
    assert.match(prose, /PACKET_UNIQUE_7f3a/);
    assert.match(prose, /Do not use tools/);
    assert.doesNotMatch(prose, /work tree/);
  });

  it("prints run totals with grader tool counts", () => {
    const line = formatRunTotals({
      stamp: "t",
      skillTree: "abc",
      producerModel: "composer-2.5",
      graderModel: "grok-4.6",
      graders: true,
      cases: [
        {
          id: "comprehende-50",
          ok: true,
          durationMs: 1,
          tokens: 3000,
          producer: { ...finishedRun, tokens: 2000, toolCalls: [{ name: "glob", detail: "**/*" }] },
          grouping: { run: { ...finishedRun, tokens: 500 }, output: { findings: [] } },
          prose: { run: { ...finishedRun, tokens: 500 }, output: { findings: [] } },
        },
      ],
    });
    assert.match(line, /producer 2k tok/);
    assert.match(line, /graders 1k tok/);
    assert.match(line, /cli-hunt 1\/1 producer tools/);
    assert.match(line, /grader-tools 0/);
  });

  it("omits grader counts when graders did not run", () => {
    const line = formatCaseLine({
      id: "comprehende-50",
      ok: true,
      durationMs: 12_000,
      tokens: 800,
      checks: {
        failures: [],
        lints: [],
        dirtyWorktree: false,
        why: "present",
        parts: 2,
        size: "small",
        togetherOk: 0,
        togetherTotal: 0,
        apartOk: 0,
        apartTotal: 0,
      },
    });
    assert.match(line, /comprehende-50/);
    assert.match(line, /validate ok/);
    assert.doesNotMatch(line, /grouping/);
    assert.doesNotMatch(line, /prose/);
  });

  it("does not fail the case on prose lint alone", () => {
    const result: CaseResult = {
      id: "vitadeck-24",
      ok: true,
      durationMs: 1,
      tokens: 1,
      checks: {
        failures: [],
        lints: ["summary has a 32-word sentence"],
        dirtyWorktree: false,
        why: "present",
        parts: 2,
        size: "small",
        togetherOk: 0,
        togetherTotal: 0,
        apartOk: 0,
        apartTotal: 0,
      },
    };
    assert.equal(caseFailed(result), false);
    assert.match(formatCaseLine(result), /lint 1/);
  });

  it("fails the case when a deterministic expect misses", () => {
    const result: CaseResult = {
      id: "comprehende-50",
      ok: true,
      durationMs: 1,
      tokens: 1,
      checks: {
        failures: [{ check: "why", message: "expected why absent, got present" }],
        lints: [],
        dirtyWorktree: false,
        why: "present",
        parts: 2,
        size: "small",
        togetherOk: 0,
        togetherTotal: 0,
        apartOk: 0,
        apartTotal: 0,
      },
    };
    assert.equal(caseFailed(result), true);
  });

  it("does not fail the case when only an artifact step throws", () => {
    const result: CaseResult = {
      id: "comprehende-47",
      ok: true,
      durationMs: 1,
      tokens: 1,
      artifactError: "grader timed out",
      checks: {
        failures: [],
        lints: [],
        dirtyWorktree: false,
        why: "present",
        parts: 1,
        size: "small",
        togetherOk: 0,
        togetherTotal: 0,
        apartOk: 0,
        apartTotal: 0,
      },
    };
    assert.equal(caseFailed(result), false);
    assert.match(formatCaseLine(result), /artifact FAIL/);
  });
});
