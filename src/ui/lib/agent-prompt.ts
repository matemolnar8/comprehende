import { padIndex, sizeLabel, type ReviewMeta } from "../api.ts";
import type { HunkRef } from "../../schema/types.ts";

export type PromptTarget = { kind: "overview" } | { kind: "group"; id: string };

export function formatHunkRef(ref: HunkRef): string {
  const rename = ref.oldPath !== undefined ? `${ref.oldPath} -> ` : "";
  return `${rename}${ref.path} @@ -${ref.oldStart},${ref.oldLines} +${ref.newStart},${ref.newLines} @@`;
}

export function isImageSlot(ref: HunkRef): boolean {
  return ref.oldStart === 0 && ref.oldLines === 0 && ref.newStart === 0 && ref.newLines === 0;
}

export function agentPrompt(meta: ReviewMeta, target: PromptTarget): string | null {
  if (target.kind === "overview") {
    return overviewPrompt(meta);
  }
  return groupPrompt(meta, target.id);
}

function overviewPrompt(meta: ReviewMeta): string {
  const hunks = meta.document.groups.flatMap((group) => group.hunkRefs);
  const blocks = [
    "Answer questions about this git change. Identify it in live git first. Then answer.",
    identityBlock(meta),
    interpretationLine(),
    ticketsBlock(meta),
    coverageBlock(meta),
    meta.document.why !== undefined ? joinBlocks(["The why:", meta.document.why]) : null,
    joinBlocks([`The what (${sizeLabel(meta.document.size)}):`, meta.document.summary]),
    reviewConcernsBlock(meta),
    imageNote(hunks),
    stepsBlock(meta, "explain this change"),
  ];
  return joinBlocks(blocks);
}

function groupPrompt(meta: ReviewMeta, id: string): string | null {
  const listed = meta.groups.find((group) => group.id === id);
  const documentGroup = meta.document.groups.find((group) => group.id === id);
  if (listed === undefined || documentGroup === undefined) {
    return null;
  }
  const index = meta.groups.findIndex((group) => group.id === id) + 1;
  const total = meta.groups.length;
  const hunks = documentGroup.hunkRefs;
  const heading = `Review concern ${padIndex(index)} of ${padIndex(total)}: ${listed.title} (\`${listed.id}\`)`;
  const blocks = [
    "Answer questions about this review concern. Identify it in live git first. Then answer.",
    identityBlock(meta),
    interpretationLine(),
    ticketsBlock(meta),
    heading,
    listed.part !== undefined ? `Part: ${listed.part}` : null,
    "The why:",
    listed.why,
    "The what:",
    listed.summary,
    lookForBlock(listed.lookFor),
    dependsOnBlock(meta, listed.dependsOn),
    hunkList("Hunk refs for this concern:", hunks),
    imageNote(hunks),
    listed.staleCount > 0
      ? `Stale hunk refs in this concern: ${listed.staleCount}. Live git wins. The pointer is flagged, not replaced.`
      : null,
    stepsBlock(meta, "explain this review concern"),
  ];
  return joinBlocks(blocks);
}

function identityBlock(meta: ReviewMeta): string {
  const { baseSha, headSha, baseRef, headRef } = meta.resolved;
  const named = `Named refs at pin: ${baseRef} ... ${headRef}`;
  const repo =
    meta.repo.origin !== null
      ? `Repository: ${meta.repo.name}\nOrigin: ${meta.repo.origin}`
      : `Repository: ${meta.repo.name}`;
  const commits =
    meta.commits.length === 0
      ? null
      : ["Commits:", ...meta.commits.map((commit) => `- ${commit.shortSha} ${commit.subject}`)].join("\n");
  return joinBlocks([
    repo,
    "## Pinned SHAs",
    `base (merge-base)  ${baseSha}`,
    `head               ${headSha}`,
    named,
    "Read the diff:",
    `git diff --find-renames ${baseSha} ${headSha}`,
    commits,
  ]);
}

function interpretationLine(): string {
  return "Live git is the diff at the pinned SHAs. A hunk ref is a pointer into that diff. The why and the what are interpretation.";
}

function ticketsBlock(meta: ReviewMeta): string | null {
  const tickets = meta.document.tickets ?? [];
  if (tickets.length === 0) {
    return null;
  }
  const lines = tickets.map((ticket) => {
    const title = ticket.title !== undefined ? ` ${ticket.title}` : "";
    const url = ticket.url !== undefined ? `\n  ${ticket.url}` : "";
    return `- ${ticket.id}${title}${url}`;
  });
  return ["Tickets:", ...lines].join("\n");
}

function coverageBlock(meta: ReviewMeta): string | null {
  const lines: string[] = [];
  if (meta.coverage.unassignedCount > 0) {
    lines.push(
      `Unassigned live hunks: ${meta.coverage.unassignedCount}. They are in git and in no group.`,
    );
  }
  if (meta.coverage.staleCount > 0) {
    lines.push(`Stale hunk refs: ${meta.coverage.staleCount}. Live git wins. The pointer is flagged, not replaced.`);
  }
  return lines.length === 0 ? null : lines.join("\n");
}

function reviewConcernsBlock(meta: ReviewMeta): string {
  const sections = meta.groups.map((group, i) => {
    const documentGroup = meta.document.groups.find((item) => item.id === group.id);
    const hunks = documentGroup?.hunkRefs ?? [];
    return joinBlocks([
      `### ${padIndex(i + 1)} ${group.title} (\`${group.id}\`)`,
      group.part !== undefined ? `Part: ${group.part}` : null,
      "The why:",
      group.why,
      "The what:",
      group.summary,
      lookForBlock(group.lookFor),
      hunkList("Hunk refs:", hunks),
    ]);
  });
  return ["## Review concerns", ...sections].join("\n\n");
}

function lookForBlock(lookFor: string[]): string | null {
  if (lookFor.length === 0) {
    return null;
  }
  return ["Look for:", ...lookFor.map((item) => `- ${item}`)].join("\n");
}

function dependsOnBlock(meta: ReviewMeta, dependsOn: string[]): string | null {
  if (dependsOn.length === 0) {
    return null;
  }
  const lines = dependsOn.map((id) => {
    const dep = meta.groups.find((group) => group.id === id);
    if (dep === undefined) {
      return `- ${id}`;
    }
    const index = meta.groups.findIndex((group) => group.id === id) + 1;
    return `- ${padIndex(index)} ${dep.title} (\`${dep.id}\`)`;
  });
  return ["Depends on:", ...lines].join("\n");
}

function hunkList(heading: string, hunks: HunkRef[]): string {
  if (hunks.length === 0) {
    return `${heading}\n(none)`;
  }
  return [heading, ...hunks.map((hunk) => `- ${formatHunkRef(hunk)}`)].join("\n");
}

function imageNote(hunks: HunkRef[]): string | null {
  if (!hunks.some(isImageSlot)) {
    return null;
  }
  return "Hunk refs with @@ -0,0 +0,0 @@ are image or binary slots. Identify those by path.";
}

function stepsBlock(meta: ReviewMeta, fallbackTask: string): string {
  const { baseSha, headSha } = meta.resolved;
  return [
    "## Steps",
    "",
    "1. Resolve the pinned SHAs.",
    `   This repository is ${meta.repo.name}.`,
    meta.repo.origin !== null ? `   Origin: ${meta.repo.origin}.` : undefined,
    `   Run \`git rev-parse --verify ${baseSha}\` and \`git rev-parse --verify ${headSha}\` in this repository.`,
    "   Done when both objects exist.",
    "",
    "2. Load the hunks.",
    `   For each hunk ref, run \`git diff --find-renames ${baseSha} ${headSha} -- <path>\` and keep the hunk whose header matches the @@ range.`,
    "   Done when every hunk ref has a matching live hunk.",
    "",
    "3. Answer from live git.",
    "   Read those hunks. Use the why and the what as interpretation.",
    "   Live git wins when they disagree.",
    `   If this paste has no question after it, ${fallbackTask}.`,
    "   Done when the answer cites the matching hunk refs.",
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");
}

function joinBlocks(parts: Array<string | null | undefined>): string {
  return parts.filter((part): part is string => part !== null && part !== undefined && part.length > 0).join("\n\n");
}
