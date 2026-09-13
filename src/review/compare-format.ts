import { basename } from "../schema/types.ts";
import { formatHunkRef } from "../schema/identity.ts";
import {
  formatReviewRange,
  listDiffHasChanges,
  type ChangedGroup,
  type ComparePayload,
  type DocumentDiff,
  type GroupSide,
  type ListDiff,
  type TextChange,
} from "./compare.ts";
import type { Source } from "../schema/types.ts";

const MATCH_REASON: Record<ChangedGroup["reason"], string> = {
  id: "id",
  title: "title",
  hunks: "hunks",
};

export function formatCompare(payload: ComparePayload): string {
  const lines: string[] = [];
  lines.push("Interpretation");
  lines.push("");
  lines.push(...sideBlock("From", payload.from));
  lines.push(...sideBlock("To", payload.to));
  lines.push("");

  if (payload.comparison.identical) {
    lines.push("The interpretation did not change.");
    return `${lines.join("\n")}\n`;
  }

  const documentLines = formatDocument(payload.comparison.document);
  if (documentLines.length > 0) {
    lines.push("Document");
    lines.push(...documentLines);
    lines.push("");
  }

  const { added, removed, changed, unchangedCount } = payload.comparison.groups;
  if (added.length + removed.length + changed.length + unchangedCount > 0) {
    lines.push("Groups");
    for (const group of added) {
      lines.push(`  added    ${groupLabel(group)}`);
    }
    for (const group of removed) {
      lines.push(`  removed  ${groupLabel(group)}`);
    }
    if (added.length > 0 || removed.length > 0) {
      lines.push("");
    }
    for (const group of changed) {
      lines.push(...formatChangedGroup(group));
      lines.push("");
    }
    if (unchangedCount > 0) {
      lines.push(`  unchanged  ${unchangedCount}`);
    }
  }

  while (lines.at(-1) === "") {
    lines.pop();
  }
  return `${lines.join("\n")}\n`;
}

function sideBlock(label: string, side: ComparePayload["from"]): string[] {
  return [
    `${label.padEnd(4)}  ${side.title}  (${side.size})`,
    `      ${formatReviewRange(side.source)}`,
    `      ${basename(side.path)}`,
  ];
}

function formatDocument(document: DocumentDiff): string[] {
  const lines: string[] = [];
  pushChange(lines, "title", document.title);
  pushChange(lines, "summary", document.summary);
  pushOptionalChange(lines, "why", document.why);
  if (document.size !== undefined) {
    lines.push("  size");
    lines.push(`    From  ${document.size.from}`);
    lines.push(`    To    ${document.size.to}`);
  }
  pushChange(lines, "range", document.range);
  pushList(lines, "lookFor", document.lookFor);
  lines.push(...formatSources(document.sources));
  return lines;
}

function formatChangedGroup(group: ChangedGroup): string[] {
  const lines = [`  ${groupLabel(group.to)}`];
  lines.push(`    matched by ${MATCH_REASON[group.reason]}`);
  if (group.from.id !== group.to.id || group.from.title !== group.to.title) {
    lines.push(`    from ${groupLabel(group.from)}`);
  }
  if (group.retitled && group.title !== undefined) {
    pushChange(lines, "title", group.title, "    ");
  }
  pushChange(lines, "summary", group.summary, "    ");
  pushChange(lines, "why", group.why, "    ");
  pushOptionalChange(lines, "part", group.part, "    ");
  if (group.suggestedOrder !== undefined) {
    lines.push("    suggestedOrder");
    lines.push(`      From  ${group.suggestedOrder.from}`);
    lines.push(`      To    ${group.suggestedOrder.to}`);
  }
  pushList(lines, "lookFor", group.lookFor, "    ");
  pushList(lines, "sources", group.sources, "    ");
  pushList(lines, "dependsOn", group.dependsOn, "    ");
  if (group.regrouped) {
    lines.push("    hunks");
    for (const ref of group.hunks.removed) {
      lines.push(`      - ${formatHunkRef(ref)}`);
    }
    for (const ref of group.hunks.added) {
      lines.push(`      + ${formatHunkRef(ref)}`);
    }
  }
  return lines;
}

function formatSources(sources: DocumentDiff["sources"]): string[] {
  const lines: string[] = [];
  for (const source of sources.added) {
    lines.push(`  sources  added    ${sourceLabel(source)}`);
  }
  for (const source of sources.removed) {
    lines.push(`  sources  removed  ${sourceLabel(source)}`);
  }
  for (const change of sources.changed) {
    lines.push(`  sources  ${sourceLabel(change.to)}`);
    if (change.from.id !== change.to.id) {
      lines.push(`    id`);
      lines.push(`      From  ${change.from.id}`);
      lines.push(`      To    ${change.to.id}`);
    }
    if (change.from.label !== change.to.label) {
      pushChange(lines, "label", { from: change.from.label, to: change.to.label }, "    ");
    }
    pushOptionalChange(lines, "gist", optionalFromTo(change.from.gist, change.to.gist), "    ");
    pushOptionalChange(lines, "title", optionalFromTo(change.from.title, change.to.title), "    ");
  }
  return lines;
}

function pushChange(
  lines: string[],
  label: string,
  change: { from: string; to: string } | undefined,
  indent = "  ",
): void {
  if (change === undefined) {
    return;
  }
  lines.push(`${indent}${label}`);
  lines.push(`${indent}  From  ${change.from}`);
  lines.push(`${indent}  To    ${change.to}`);
}

function pushOptionalChange(lines: string[], label: string, change: TextChange | undefined, indent = "  "): void {
  if (change === undefined) {
    return;
  }
  lines.push(`${indent}${label}`);
  if (change.from !== undefined) {
    lines.push(`${indent}  From  ${change.from}`);
  }
  if (change.to !== undefined) {
    lines.push(`${indent}  To    ${change.to}`);
  }
}

function pushList(lines: string[], label: string, diff: ListDiff, indent = "  "): void {
  if (!listDiffHasChanges(diff)) {
    return;
  }
  lines.push(`${indent}${label}`);
  for (const item of diff.removed) {
    lines.push(`${indent}  - ${item}`);
  }
  for (const item of diff.added) {
    lines.push(`${indent}  + ${item}`);
  }
}

function groupLabel(group: GroupSide): string {
  return `${group.title}  (${group.id})`;
}

function sourceLabel(source: Source): string {
  return `${source.label}  (${source.id})`;
}

function optionalFromTo(from: string | undefined, to: string | undefined): TextChange | undefined {
  if (from === to) {
    return undefined;
  }
  const change: TextChange = {};
  if (from !== undefined) {
    change.from = from;
  }
  if (to !== undefined) {
    change.to = to;
  }
  return change;
}
