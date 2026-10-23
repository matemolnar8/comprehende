import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  rubricCounts,
  type BulletVerdict,
  type ItemVerdict,
  type RubricResult,
} from "./graders.ts";
import { caseFailed, formatCaseLine, type CaseResult, type RunSummary } from "./result.ts";

export async function writeEvalReport(runDir: string, summary: RunSummary): Promise<string> {
  const path = evalReportPath(runDir);
  await writeFile(path, evalReportHtml(summary));
  return path;
}

export function evalReportHtml(summary: RunSummary): string {
  const failed = summary.cases.filter((item) => caseFailed(item)).length;
  const total = summary.cases.length;
  const headline =
    failed === 0
      ? `All ${total} ${total === 1 ? "case" : "cases"} passed deterministic checks.`
      : `${failed} of ${total} ${total === 1 ? "case" : "cases"} failed deterministic checks.`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Eval ${escapeHtml(summary.stamp)}</title>
<style>
:root {
  color-scheme: light dark;
  --bg: #f4f6f8;
  --fg: #171b22;
  --muted: #5c6570;
  --line: #d5dbe3;
  --card: #ffffff;
  --ok: #1a7f37;
  --fail: #cf222e;
  --warn: #9a6700;
  --mono: ui-monospace, "IBM Plex Mono", "SF Mono", Menlo, monospace;
  --sans: ui-sans-serif, "IBM Plex Sans", system-ui, sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #12151a;
    --fg: #ecf0f5;
    --muted: #9aa3ad;
    --line: #2c333c;
    --card: #1a1f26;
  }
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0 auto;
  max-width: 52rem;
  padding: 1.5rem 1.25rem 4rem;
  background: var(--bg);
  color: var(--fg);
  font: 16px/1.45 var(--sans);
}
h1, h2, h3 { font-weight: 600; letter-spacing: -0.02em; }
h1 { font-size: 1.35rem; margin: 0 0 0.35rem; }
h2 { font-size: 1.15rem; margin: 0 0 0.4rem; }
h3 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin: 1.1rem 0 0.4rem; }
.meta, .line, code { font-family: var(--mono); font-size: 0.82rem; }
.meta { color: var(--muted); margin: 0 0 0.75rem; }
.headline { margin: 0 0 1.25rem; }
nav { display: flex; flex-wrap: wrap; gap: 0.4rem 0.9rem; margin: 0 0 1.75rem; padding-bottom: 1rem; border-bottom: 1px solid var(--line); }
nav a { color: inherit; }
.case {
  background: var(--card);
  border: 1px solid var(--line);
  border-left-width: 4px;
  border-left-color: var(--ok);
  padding: 1rem 1.1rem 1.15rem;
  margin: 0 0 1rem;
}
.case.fail { border-left-color: var(--fail); }
.mark { font-family: var(--mono); font-size: 0.78rem; font-weight: 600; }
.mark.ok { color: var(--ok); }
.mark.fail { color: var(--fail); }
.line { white-space: pre-wrap; margin: 0.35rem 0 0.75rem; color: var(--muted); }
ul { margin: 0; padding: 0 0 0 1.1rem; }
li { margin: 0.2rem 0; }
.verdict { margin: 0.55rem 0; padding: 0.45rem 0 0.15rem; border-top: 1px solid var(--line); }
.verdict:first-child { border-top: 0; padding-top: 0; }
.verdict p { margin: 0.15rem 0; }
.quote { color: var(--muted); font-style: italic; }
.yes { color: var(--ok); }
.no { color: var(--fail); }
.files { display: flex; flex-wrap: wrap; gap: 0.7rem; margin: 0.9rem 0 0; }
.files a { color: inherit; }
</style>
</head>
<body>
<header>
<h1>Eval ${escapeHtml(summary.stamp)}</h1>
<p class="meta">producer ${escapeHtml(summary.producerModel)} · ${
    summary.graders ? `grader ${escapeHtml(summary.graderModel)}` : "graders off"
  } · skill ${escapeHtml(summary.skillTree.slice(0, 7))}</p>
<p class="headline">${escapeHtml(headline)}</p>
<nav>
${summary.cases
  .map((item) => {
    const fail = caseFailed(item);
    return `<a href="#${escapeHtml(item.id)}"><span class="mark ${fail ? "fail" : "ok"}">${fail ? "FAIL" : "ok"}</span> ${escapeHtml(item.id)}</a>`;
  })
  .join("\n")}
</nav>
</header>
${summary.cases.map((item) => caseHtml(item)).join("\n")}
</body>
</html>
`;
}

function caseHtml(result: CaseResult): string {
  const fail = caseFailed(result);
  const parts: string[] = [
    `<section class="case ${fail ? "fail" : "ok"}" id="${escapeHtml(result.id)}">`,
    `<h2>${escapeHtml(result.id)} <span class="mark ${fail ? "fail" : "ok"}">${fail ? "FAIL" : "ok"}</span></h2>`,
    `<p class="line">${escapeHtml(formatCaseLine(result))}</p>`,
  ];
  if (result.producerError !== undefined) {
    parts.push(block("Producer", `<p>${escapeHtml(result.producerError)}</p>`));
  }
  if (result.validateError !== undefined) {
    parts.push(block("Validate", `<p>${escapeHtml(result.validateError)}</p>`));
  }
  if (result.artifactError !== undefined) {
    parts.push(block("Artifact", `<p>${escapeHtml(result.artifactError)}</p>`));
  }
  if (result.document !== undefined) {
    const why = result.document.why;
    parts.push(
      block(
        "Review",
        `<p>${escapeHtml(result.document.title)} · ${escapeHtml(result.document.size)}${
          why !== undefined ? ` · ${escapeHtml(why)}` : ""
        }</p>`,
      ),
    );
  }
  const failures = result.checks?.failures ?? [];
  if (failures.length > 0) {
    parts.push(
      block(
        "Checks",
        `<ul>${failures.map((item) => `<li><code>${escapeHtml(item.check)}</code> ${escapeHtml(item.message)}</li>`).join("")}</ul>`,
      ),
    );
  }
  const lints = result.checks?.lints ?? [];
  if (lints.length > 0) {
    parts.push(
      block("Lint", `<ul>${lints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`),
    );
  }
  if (result.rubric !== undefined) {
    parts.push(...rubricHtml(result.rubric));
  }
  const links = fileLinks(result);
  if (links !== undefined) {
    parts.push(links);
  }
  parts.push("</section>");
  return parts.join("\n");
}

function rubricHtml(rubric: RubricResult): string[] {
  if (rubric.parseError !== undefined) {
    return [block("Rubric", `<p>Parse failed. ${escapeHtml(rubric.parseError)}</p>`)];
  }
  const counts = rubricCounts(rubric.output);
  const sections: string[] = [];
  const items = (
    title: string,
    list: ItemVerdict[],
    count: { yes: number; total: number },
    yesIsGood: boolean,
  ): void => {
    if (list.length === 0) {
      return;
    }
    sections.push(
      block(
        `${title} ${count.yes} of ${count.total}`,
        list.map((item) => itemHtml(item, yesIsGood)).join(""),
      ),
    );
  };
  items("Must", rubric.output.must, counts.must, true);
  items("Good", rubric.output.good, counts.good, true);
  items("Must not", rubric.output.mustNot, counts.mustNot, false);
  if (rubric.output.bullets.length > 0) {
    sections.push(
      block(
        `lookFor ${counts.bullets.holds} of ${counts.bullets.total} true`,
        rubric.output.bullets.map((item) => bulletHtml(item)).join(""),
      ),
    );
  }
  return sections;
}

function itemHtml(item: ItemVerdict, yesIsGood: boolean): string {
  const mark = item.yes ? "yes" : "no";
  const tone = item.yes === yesIsGood ? "yes" : "no";
  const quote =
    item.quote !== undefined && item.quote !== ""
      ? `<p class="quote">${escapeHtml(item.quote)}</p>`
      : "";
  return `<div class="verdict"><p><span class="mark ${tone}">${mark}</span> ${escapeHtml(item.item)}</p>${quote}</div>`;
}

function bulletHtml(item: BulletVerdict): string {
  const mark = item.holds ? "true" : "false";
  const tone = item.holds ? "yes" : "no";
  const note =
    item.note !== undefined && item.note !== ""
      ? `<p class="quote">${escapeHtml(item.note)}</p>`
      : "";
  return `<div class="verdict"><p><span class="mark ${tone}">${mark}</span> ${escapeHtml(item.where)} · ${escapeHtml(item.bullet)}</p>${note}</div>`;
}

function fileLinks(result: CaseResult): string | undefined {
  const hrefs: string[] = [];
  if (result.site !== undefined) {
    hrefs.push(`<a href="./${encodeURIComponent(result.id)}/site/index.html">Produced review</a>`);
  }
  if (result.producer !== undefined) {
    hrefs.push(`<a href="./${encodeURIComponent(result.id)}/producer.md">Producer notes</a>`);
  }
  if (hrefs.length === 0) {
    return undefined;
  }
  return `<p class="files">${hrefs.join(" · ")}</p>`;
}

function block(title: string, body: string): string {
  return `<h3>${escapeHtml(title)}</h3>\n${body}`;
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/gu, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

export function evalReportPath(runDir: string): string {
  return join(runDir, "index.html");
}
