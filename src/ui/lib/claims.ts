import {
  citationIds,
  groupIdForPinnedSource,
  groupSourceIds,
  isLinePinned,
} from "../../schema/source.ts";
import type { Attention, ReviewDocument, Source } from "../../schema/types.ts";
import { groupParts, type PartGroup } from "./parts.ts";
import type { Selection } from "./selection.ts";

/** Prose a source click can scroll to: a document lookFor bullet, or a group attention. */
export type Claim = {
  key: string;
  /** Unset for document lookFor. */
  groupId?: string;
  sourceIds: string[];
};

export type ClaimGroup = PartGroup & { attention?: Attention };

export function lookForKey(index: number): string {
  return `look-for:${index}`;
}

export function attentionKey(groupId: string): string {
  return `attention:${groupId}`;
}

/** Document lookFor first, then group attentions in reading order. */
export function reviewClaims(
  document: { lookFor?: readonly string[] },
  groups: readonly ClaimGroup[],
): Claim[] {
  const claims: Claim[] = (document.lookFor ?? []).map((text, index) => ({
    key: lookForKey(index),
    sourceIds: citationIds(text),
  }));
  const byId = new Map(groups.map((group) => [group.id, group]));
  for (const id of groupParts(groups).flatMap((part) => part.groupIds)) {
    const attention = byId.get(id)?.attention;
    if (attention !== undefined) {
      claims.push({ key: attentionKey(id), groupId: id, sourceIds: citationIds(attention.note) });
    }
  }
  return claims;
}

export type SourceOpenTarget = {
  selection: Selection;
  claimKey?: string;
  commentId?: string;
};

function claimTarget(claim: Claim): SourceOpenTarget {
  return {
    selection:
      claim.groupId === undefined ? { kind: "overview" } : { kind: "group", id: claim.groupId },
    claimKey: claim.key,
  };
}

export function openTargetForSource(
  source: Source,
  claims: readonly Claim[],
  document: ReviewDocument,
  currentGroupId?: string,
  renames?: ReadonlyMap<string, string>,
): SourceOpenTarget {
  if (isLinePinned(source)) {
    const groupId = groupIdForPinnedSource(document, source, renames);
    if (groupId !== undefined) {
      return { selection: { kind: "group", id: groupId }, commentId: source.id };
    }
  }
  const citing = claims.filter((claim) => claim.sourceIds.includes(source.id));
  const currentClaim = citing.find(
    (claim) => claim.groupId !== undefined && claim.groupId === currentGroupId,
  );
  if (currentClaim !== undefined) {
    return claimTarget(currentClaim);
  }
  if (currentGroupId !== undefined) {
    const current = document.groups.find((group) => group.id === currentGroupId);
    if (current !== undefined && groupSourceIds(current).includes(source.id)) {
      return { selection: { kind: "group", id: currentGroupId } };
    }
  }
  const groupClaim = citing.find((claim) => claim.groupId !== undefined);
  if (groupClaim !== undefined) {
    return claimTarget(groupClaim);
  }
  const named = document.groups.find((group) => (group.sources ?? []).includes(source.id));
  if (named !== undefined) {
    return { selection: { kind: "group", id: named.id } };
  }
  const documentClaim = citing.find((claim) => claim.groupId === undefined);
  if (documentClaim !== undefined) {
    return claimTarget(documentClaim);
  }
  return { selection: { kind: "overview" } };
}
