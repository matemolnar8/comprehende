import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseGraderJson } from "./graders.ts";
import { formatCaseLine, formatDuration, formatTokens, type CaseResult } from "./result.ts";

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
        dirtyWorktree: false,
        why: "present",
        parts: 2,
        size: "large",
        togetherOk: 2,
        togetherTotal: 2,
        apartOk: 1,
        apartTotal: 1,
      },
      grouping: { run: { text: "", status: "finished", durationMs: 1, tokens: 1 }, output: { findings: [{ check: "x", severity: "major", where: "g", note: "n" }] } },
      prose: { run: { text: "", status: "finished", durationMs: 1, tokens: 1 }, output: { findings: [] } },
      claims: { stated: 4, total: 5, missing: ["one"] },
    };
    const line = formatCaseLine(result);
    assert.match(line, /comprehende-47/);
    assert.match(line, /validate ok/);
    assert.match(line, /claims 4\/5/);
    assert.match(line, /grouping 1M 0m/);
    assert.match(line, /4m12s/);
  });
});
