import type { HunkRef } from "../schema/types.ts";
import type { ApiResource } from "./paths.ts";
import type { ApiReview } from "./types.ts";

export const AGENT_MD_MEDIA_TYPE = "text/markdown; charset=utf-8";

export type AgentMdResource = Extract<ApiResource, { kind: "agent-md" }>;

export function formatHunkRef(ref: HunkRef): string {
  const rename = ref.oldPath !== undefined ? `${ref.oldPath} -> ` : "";
  return `${rename}${ref.path} @@ -${ref.oldStart},${ref.oldLines} +${ref.newStart},${ref.newLines} @@`;
}

export function isImageSlot(ref: HunkRef): boolean {
  return ref.oldStart === 0 && ref.oldLines === 0 && ref.newStart === 0 && ref.newLines === 0;
}

export function agentClipboardPrompt(url: string): string {
  return `Answer the following questions by using ${url}`;
}

export function agentMd(review: ApiReview, resource: AgentMdResource): string | null {
  if (resource.target === "overview") {
    return overviewAgentMd(review);
  }
  return groupAgentMd(review, resource.group);
}

function overviewAgentMd(review: ApiReview): string {
  const hunks = review.document.groups.flatMap((group) => group.hunkRefs);
  const blocks = [
    "Answer questions about this git change. Identify it in live git first. Then answer.",
    identityBlock(review),
    interpretationLine(),
    ticketsBlock(review),
    coverageBlock(review),
    review.document.why !== undefined ? joinBlocks(["The why:", review.document.why]) : null,
    joinBlocks([`The what (${sizeLabel(review.document.size)}):`, review.document.summary]),
    reviewConcernsBlock(review),
    imageNote(hunks),
    stepsBlock(review, "explain this change"),
  ];
  return joinBlocks(blocks);
}

function groupAgentMd(review: ApiReview, id: string): string | null {
  const listed = review.groups.find((group) => group.id === id);
  const documentGroup = review.document.groups.find((group) => group.id === id);
  if (listed === undefined || documentGroup === undefined) {
    return null;
  }
  const index = review.groups.findIndex((group) => group.id === id) + 1;
  const total = review.groups.length;
  const hunks = documentGroup.hunkRefs;
  const heading = `Review concern ${padIndex(index)} of ${padIndex(total)}: ${listed.title} (\`${listed.id}\`)`;
  const blocks = [
    "Answer questions about this review concern. Identify it in live git first. Then answer.",
    identityBlock(review),
    interpretationLine(),
    ticketsBlock(review),
    heading,
    listed.part !== undefined ? `Part: ${listed.part}` : null,
    "The why:",
    listed.why,
    "The what:",
    listed.summary,
    lookForBlock(listed.lookFor),
    dependsOnBlock(review, listed.dependsOn),
    hunkList("Hunk refs for this concern:", hunks),
    imageNote(hunks),
    listed.staleCount > 0
      ? `Stale hunk refs in this concern: ${listed.staleCount}. Live git wins. The pointer is flagged, not replaced.`
      : null,
    stepsBlock(review, "explain this review concern"),
  ];
  return joinBlocks(blocks);
}

function identityBlock(review: ApiReview): string {
  const { baseSha, headSha, baseRef, headRef } = review.resolved;
  const named = `Named refs at pin: ${baseRef} ... ${headRef}`;
  const repo =
    review.repo.origin !== null
      ? `Repository: ${review.repo.name}\nOrigin: ${review.repo.origin}`
      : `Repository: ${review.repo.name}`;
  const commits =
    review.commits.length === 0
      ? null
      : ["Commits:", ...review.commits.map((commit) => `- ${commit.shortSha} ${commit.subject}`)].join("\n");
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

function ticketsBlock(review: ApiReview): string | null {
  const tickets = review.document.tickets ?? [];
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

function coverageBlock(review: ApiReview): string | null {
  const lines: string[] = [];
  if (review.coverage.unassignedCount > 0) {
    lines.push(
      `Unassigned live hunks: ${review.coverage.unassignedCount}. They are in git and in no group.`,
    );
  }
  if (review.coverage.staleCount > 0) {
    lines.push(`Stale hunk refs: ${review.coverage.staleCount}. Live git wins. The pointer is flagged, not replaced.`);
  }
  return lines.length === 0 ? null : lines.join("\n");
}

function reviewConcernsBlock(review: ApiReview): string {
  const sections = review.groups.map((group, i) => {
    const documentGroup = review.document.groups.find((item) => item.id === group.id);
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

function dependsOnBlock(review: ApiReview, dependsOn: string[]): string | null {
  if (dependsOn.length === 0) {
    return null;
  }
  const lines = dependsOn.map((id) => {
    const dep = review.groups.find((group) => group.id === id);
    if (dep === undefined) {
      return `- ${id}`;
    }
    const index = review.groups.findIndex((group) => group.id === id) + 1;
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

function stepsBlock(review: ApiReview, fallbackTask: string): string {
  const { baseSha, headSha } = review.resolved;
  return [
    "## Steps",
    "",
    "1. Resolve the pinned SHAs.",
    `   This repository is ${review.repo.name}.`,
    review.repo.origin !== null ? `   Origin: ${review.repo.origin}.` : undefined,
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

function padIndex(index: number): string {
  return String(index).padStart(2, "0");
}

function sizeLabel(size: ApiReview["document"]["size"]): string {
  return size.replace("-", " ");
}

function joinBlocks(parts: Array<string | null | undefined>): string {
  return parts.filter((part): part is string => part !== null && part !== undefined && part.length > 0).join("\n\n");
}
