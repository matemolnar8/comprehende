import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { escapeHtml, evalReportHtml } from "./report.ts";
import type { CaseResult, RunSummary } from "./result.ts";

const checksOk = {
  failures: [] as { check: string; message: string }[],
  dirtyWorktree: false,
  why: "present" as const,
  parts: 1,
  size: "small" as const,
  togetherOk: 0,
  togetherTotal: 0,
  apartOk: 0,
  apartTotal: 0,
};

function caseResult(over: Partial<CaseResult> & Pick<CaseResult, "id">): CaseResult {
  return {
    ok: true,
    durationMs: 12_000,
    tokens: 800,
    checks: checksOk,
    ...over,
  };
}

describe("eval HTML report", () => {
  it("escapes LLM text and links the produced review", () => {
    const summary: RunSummary = {
      stamp: "2026-09-13T03-13-34-249Z",
      skillTree: "963f6069f91e1b36d3fc5afb6f3beaac6f525d25",
      producerModel: "composer-2.5",
      graderModel: "grok-4.6",
      cases: [
        caseResult({
          id: "comprehende-50",
          ok: false,
          producerError: undefined,
          validateError: undefined,
          checks: {
            ...checksOk,
            failures: [{ check: "why", message: "expected why absent, got present" }],
            why: "present",
          },
          document: { title: "Export vs serve", size: "small", why: "Invented <why>." },
          grouping: {
            run: { text: "", status: "finished", durationMs: 1, tokens: 1 },
            output: {
              findings: [
                {
                  check: "concern",
                  severity: "minor",
                  where: "g1",
                  note: "Directory grouped. <script>alert(1)</script>",
                },
              ],
            },
          },
          site: "/tmp/site",
          producer: { text: "ok", status: "finished", durationMs: 1, tokens: 1 },
        }),
        caseResult({ id: "comprehende-57" }),
      ],
    };
    const html = evalReportHtml(summary);
    assert.match(html, /1 of 2 cases failed deterministic checks/);
    assert.match(html, /producer composer-2\.5/);
    assert.match(html, /grader grok-4\.6/);
    assert.match(html, /skill 963f606/);
    assert.match(html, /expected why absent, got present/);
    assert.match(html, /\.\/comprehende-50\/site\/index.html/);
    assert.match(html, /\.\/comprehende-50\/producer.md/);
    assert.equal(html.includes("<script>alert(1)</script>"), false);
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.match(html, /Invented &lt;why&gt;\./);
    assert.doesNotMatch(html, /comprehende-57\/site/);
  });

  it("escapes HTML characters", () => {
    assert.equal(escapeHtml(`<a href="x">'&</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&lt;/a&gt;");
  });
});
