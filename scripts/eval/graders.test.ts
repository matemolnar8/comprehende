import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import {
  emptyRubricOutput,
  lookForBullets,
  parseRubricReply,
  rubricCounts,
  rubricPrompt,
  shouldRetryGraderRun,
  type RubricOutput,
} from "./graders.ts";
import {
  caseFailed,
  formatBaselineDelta,
  formatCaseLine,
  formatDuration,
  formatRunTotals,
  formatTokens,
  type CaseResult,
} from "./result.ts";
import type { AgentRunResult } from "./musecode.ts";
import type { ReviewDocument } from "../../src/schema/types.ts";

const finishedRun: AgentRunResult = {
  text: "",
  status: "finished",
  durationMs: 1,
  tokens: 1,
  steps: 1,
  toolCalls: [],
};

const rubric = {
  must: ["copies args"],
  good: ["names the reviewer"],
  mustNot: ["three-index slice"],
};
const bullets = [
  { where: "document", bullet: "PR says slice, head copies." },
  { where: "group fix", bullet: "append writes into os.Args." },
];

const rubricOutput: RubricOutput = {
  must: [{ item: "copies args", yes: true, quote: "copies trimmedArgs" }],
  good: [{ item: "names the reviewer", yes: false }],
  mustNot: [{ item: "three-index slice", yes: false }],
  bullets: [
    { where: "document", bullet: "PR says slice, head copies.", holds: true },
    { where: "group fix", bullet: "append writes into os.Args.", holds: false, note: "no" },
  ],
};

describe("rubric grader", () => {
  it("zips a fenced reply onto the rubric and bullets by position", () => {
    const output = parseRubricReply(
      `Here you go\n\`\`\`json\n{"must":[{"yes":true,"quote":"copies trimmedArgs"}],"good":[{"yes":false}],"mustNot":[{"yes":false}],"bullets":[{"holds":true},{"holds":false,"note":"no"}]}\n\`\`\``,
      rubric,
      bullets,
    );
    assert.deepEqual(output, rubricOutput);
    assert.deepEqual(rubricCounts(output), {
      must: { yes: 1, total: 1 },
      good: { yes: 0, total: 1 },
      mustNot: { yes: 0, total: 1 },
      bullets: { holds: 1, total: 2 },
    });
  });

  it("rejects junk and a reply with the wrong entry count", () => {
    assert.throws(() => parseRubricReply("no json here", rubric, bullets));
    assert.throws(
      () =>
        parseRubricReply(
          '{"must":[],"good":[{"yes":false}],"mustNot":[{"yes":false}],"bullets":[{"holds":true},{"holds":true}]}',
          rubric,
          bullets,
        ),
      /must has 0 verdicts for 1 items/,
    );
  });

  it("lists document bullets before group bullets", () => {
    const document: ReviewDocument = {
      version: 1,
      source: { baseRef: "a", headRef: "b" },
      size: "small",
      title: "t",
      summary: "s",
      lookFor: ["doc one"],
      groups: [
        {
          id: "g1",
          title: "g",
          why: "w",
          summary: "s",
          suggestedOrder: 1,
          hunkRefs: [{ path: "a.ts" }],
          lookFor: ["in g1"],
        },
        {
          id: "g2",
          title: "g",
          why: "w",
          summary: "s",
          suggestedOrder: 2,
          hunkRefs: [{ path: "b.ts" }],
        },
      ],
    };
    assert.deepEqual(lookForBullets(document), [
      { where: "document", bullet: "doc one" },
      { where: "group g1", bullet: "in g1" },
    ]);
  });

  it("inlines the rubric, the bullets, the packet, and the entry counts", () => {
    const prompt = rubricPrompt({ rubric, bullets, packet: "PACKET_UNIQUE_7f3a" });
    assert.match(prompt, /1\. copies args/);
    assert.match(prompt, /1\. three-index slice/);
    assert.match(prompt, /2\. \(group fix\) append writes into os\.Args\./);
    assert.match(prompt, /PACKET_UNIQUE_7f3a/);
    assert.match(prompt, /Start from this packet/);
    assert.match(prompt, /git work tree/);
    assert.match(prompt, /must has exactly 1 entries, good 1, mustNot 1, bullets 2/);
    const empty = rubricPrompt({
      rubric: { must: [], good: [], mustNot: [] },
      bullets: [],
      packet: "p",
    });
    assert.match(empty, /Must \(facts the review must state\):\n\(none\)/);
  });

  it("retries only when the model returned text", () => {
    assert.equal(shouldRetryGraderRun({ ...finishedRun, text: "not json" }), true);
    assert.equal(shouldRetryGraderRun({ ...finishedRun, text: "   " }), false);
    assert.equal(shouldRetryGraderRun({ ...finishedRun, text: "" }), false);
    assert.equal(
      shouldRetryGraderRun({ ...finishedRun, status: "error", text: "not json" }),
      false,
    );
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
        groups: 2,
        size: "large",
        togetherOk: 2,
        togetherTotal: 2,
        apartOk: 1,
        apartTotal: 1,
      },
      rubric: { run: { ...finishedRun, tokens: 40_000 }, output: rubricOutput },
    };
    const line = formatCaseLine(result);
    assert.match(line, /comprehende-47/);
    assert.match(line, /validate ok/);
    assert.match(line, /must 1\/1  good 0\/1  mustNot 0\/1  bullets 1\/2 true/);
    assert.match(line, /4m12s/);
    assert.match(line, /grader 40k tok  grader-tools 0/);
    assert.doesNotMatch(line, /producer-tools/);
    const failed = formatCaseLine({
      ...result,
      rubric: { run: finishedRun, output: emptyRubricOutput(), parseError: "bad" },
    });
    assert.match(failed, /rubric parse FAIL/);
  });

  it("prints rubric deltas against a baseline", () => {
    const base: CaseResult = {
      id: "c",
      ok: true,
      durationMs: 1,
      tokens: 1,
      rubric: { run: finishedRun, output: rubricOutput },
    };
    const better: CaseResult = {
      ...base,
      rubric: {
        run: finishedRun,
        output: {
          ...rubricOutput,
          good: [{ item: "names the reviewer", yes: true }],
          bullets: [{ where: "document", bullet: "x", holds: true }],
        },
      },
    };
    assert.equal(formatBaselineDelta(base, base), undefined);
    assert.equal(formatBaselineDelta(better, base), "c  good 0->1/1  bullets 1/2->1/1");
  });

  it("prints why the producer failed", () => {
    const base = { id: "c1", ok: false, durationMs: 1000, tokens: 0 };
    const crash = formatCaseLine({ ...base, producerError: "spawn rg ENOENT\n    at foo" });
    assert.match(crash, /producer FAIL: spawn rg ENOENT  /);
    const limited = formatCaseLine({ ...base, producerError: "429 usage limit reached" });
    assert.match(limited, /producer FAIL: 429 usage limit reached/);
  });

  it("prints producer tool calls and the token split next to the total", () => {
    const line = formatCaseLine({
      id: "comprehende-47",
      ok: true,
      durationMs: 252_000,
      tokens: 4_100_000,
      producer: {
        ...finishedRun,
        tokens: 2_650_000,
        steps: 14,
        inputTokens: 1_200_000,
        cacheReadTokens: 1_408_000,
        outputTokens: 42_000,
        toolCalls: [
          { name: "read", detail: "SKILL.md" },
          { name: "shell", detail: "git diff" },
          { name: "write", detail: "review.json" },
        ],
      },
    });
    assert.match(line, /14 steps/);
    assert.match(
      line,
      /4100k tok  producer 2650k tok  producer-tools 3  input 1200k tok  cache-read 1408k tok  output 42k tok/,
    );
    assert.doesNotMatch(line, /14 steps 3 tools/);
  });

  it("prints run totals with grader tool counts", () => {
    const line = formatRunTotals({
      stamp: "t",
      skillTree: "abc",
      producerModel: "muse-spark-1.3-contributor",
      graderModel: "muse-spark-1.3-contributor",
      graders: true,
      cases: [
        {
          id: "comprehende-50",
          ok: true,
          durationMs: 1,
          tokens: 3000,
          producer: {
            ...finishedRun,
            tokens: 2000,
            inputTokens: 1000,
            cacheReadTokens: 800,
            outputTokens: 200,
            toolCalls: [{ name: "glob", detail: "**/dist/**" }],
          },
          rubric: { run: { ...finishedRun, tokens: 1000 }, output: emptyRubricOutput() },
        },
      ],
    });
    assert.match(
      line,
      /producer 2k tok  producer-tools 1  input 1k tok  cache-read 800 tok  output 200 tok  graders 1k tok/,
    );
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
        groups: 2,
        size: "small",
        togetherOk: 0,
        togetherTotal: 0,
        apartOk: 0,
        apartTotal: 0,
      },
    });
    assert.match(line, /comprehende-50/);
    assert.match(line, /validate ok/);
    assert.doesNotMatch(line, /must/);
    assert.doesNotMatch(line, /grader/);
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
        groups: 2,
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
        groups: 2,
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
        groups: 1,
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
