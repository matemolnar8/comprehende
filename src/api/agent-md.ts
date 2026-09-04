import { formatHunkRef } from "../schema/identity.ts";
import { padIndex, sizeLabel } from "../schema/types.ts";
import type { HunkRef } from "../schema/types.ts";
import { agentMdGroupHref } from "./paths.ts";
import type { ApiResource } from "./paths.ts";
import type { ApiReview } from "./types.ts";

export const AGENT_MD_MEDIA_TYPE = "text/markdown; charset=utf-8";

export type AgentMdResource = Extract<ApiResource, { kind: "agent-md" }>;

export { formatHunkRef };

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
  return joinBlocks([
    "Answer questions about this git change.",
    overviewSteps(review),
    pinBlock(review, { commits: true }),
    sourcesBlock(review),
    coverageBlock(review),
    joinBlocks(["The title:", review.document.title]),
    review.document.why !== undefined ? joinBlocks(["The why:", review.document.why]) : null,
    joinBlocks([`The what (${sizeLabel(review.document.size)}):`, review.document.summary]),
    reviewConcernsBlock(review),
  ]);
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
  return joinBlocks([
    "Answer questions about this review concern.",
    groupSteps(review),
    pinBlock(review, { commits: false }),
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
  ]);
}

function pinBlock(review: ApiReview, options: { commits: boolean }): string {
  const { baseSha, headSha, baseRef, headRef } = review.resolved;
  const repo =
    review.repo.origin !== null
      ? `Repository: ${review.repo.name}\nOrigin: ${review.repo.origin}`
      : `Repository: ${review.repo.name}`;
  const commits =
    options.commits && review.commits.length > 0
      ? ["Commits:", ...review.commits.map((commit) => `- ${commit.shortSha} ${commit.subject}`)].join("\n")
      : null;
  return joinBlocks([
    "## Pin",
    repo,
    `base (merge-base)  ${baseSha}`,
    `head               ${headSha}`,
    `Named refs at pin: ${baseRef} ... ${headRef}`,
    "Read the diff:",
    `git diff --find-renames ${baseSha} ${headSha}`,
    commits,
  ]);
}

function sourcesBlock(review: ApiReview): string | null {
  const sources = review.document.sources ?? [];
  if (sources.length === 0) {
    return null;
  }
  const lines = sources.map((source) => {
    const gist = source.gist !== undefined ? ` ${source.gist}` : "";
    const url = source.url !== undefined ? `\n  ${source.url}` : "";
    return `- ${source.kind} ${source.label}${gist}${url}`;
  });
  return ["Sources:", ...lines].join("\n");
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
    const href = agentMdGroupHref(group.id);
    return joinBlocks([
      `### ${padIndex(i + 1)} ${group.title} (\`${group.id}\`)`,
      group.summary,
      dependsOnBlock(review, group.dependsOn),
      `[${href}](${href})`,
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

function overviewSteps(review: ApiReview): string {
  return [
    "## Steps",
    "",
    "When no question follows this paste, explain this change.",
    "",
    ...resolveShaSteps(review),
    "",
    "2. Choose the relevant review concerns.",
    "   Read Review concerns. Fetch a concern file only when that concern is relevant to the question.",
    "   Done when every concern the question touches has its markdown loaded.",
    "",
    "3. Answer from live git.",
    "   Follow those files. Use the why and the what as interpretation. Live git wins when they disagree.",
    `   ${SHOW_CODE_RULE}`,
    "   Done when the answer quotes the live code.",
  ].join("\n");
}

function groupSteps(review: ApiReview): string {
  const { baseSha, headSha } = review.resolved;
  return [
    "## Steps",
    "",
    "When no question follows this paste, explain this review concern.",
    "",
    ...resolveShaSteps(review),
    "",
    "2. Load the hunks.",
    "   A hunk ref is a pointer into the live git diff at the pinned SHAs.",
    `   For each hunk ref, run \`git diff --find-renames ${baseSha} ${headSha} -- <path>\` and keep the hunk whose header matches the @@ range.`,
    "   Done when every hunk ref has a matching live hunk.",
    "",
    "3. Answer from live git.",
    "   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.",
    `   ${SHOW_CODE_RULE}`,
    "   Done when the answer quotes the live code.",
  ].join("\n");
}

function resolveShaSteps(review: ApiReview): string[] {
  const { baseSha, headSha } = review.resolved;
  return [
    "1. Resolve the pinned SHAs.",
    `   Run \`git rev-parse --verify ${baseSha}\` and \`git rev-parse --verify ${headSha}\` in this repository.`,
    "   Done when both objects exist.",
  ];
}

const SHOW_CODE_RULE = "When you show code, quote the live git lines.";

function joinBlocks(parts: Array<string | null | undefined>): string {
  return parts.filter((part): part is string => part !== null && part !== undefined && part.length > 0).join("\n\n");
}
