import { padIndex } from "../../schema/types.ts";
import { citationIds, groupIdForPinnedSource, groupSourceIds, isLinePinned } from "../../schema/source.ts";
import type { ReviewDocument, Source } from "../../schema/types.ts";
import { groupOrderIndex, groupParts, type PartGroup } from "./parts.ts";
import type { Selection } from "./selection.ts";

export const LOOK_FOR_TAGS = ["Subtle", "Breaking", "Race", "Perf"] as const;

export type LookForTag = (typeof LOOK_FOR_TAGS)[number];

const LOOK_FOR_TAG_RE = /^(Subtle|Breaking|Race|Perf)\.\s+(.*)$/;

export type LookForOwner =
  | { kind: "document" }
  | { kind: "group"; id: string; title: string; index: number; part?: string };

export type LookForClaim = {
  key: string;
  owner: LookForOwner;
  index: number;
  tag?: LookForTag;
  text: string;
  body: string;
  sourceIds: string[];
};

export type LookForGroup = PartGroup & {
  title: string;
  lookFor?: readonly string[];
};

export function parseLookForBullet(text: string): { tag?: LookForTag; body: string } {
  const match = LOOK_FOR_TAG_RE.exec(text);
  if (match === null) {
    return { body: text };
  }
  const tag = match[1];
  const body = match[2];
  if (tag === undefined || body === undefined || body === "") {
    return { body: text };
  }
  return { tag: tag as LookForTag, body };
}

export function lookForKey(owner: LookForOwner, index: number): string {
  return owner.kind === "document" ? `document:${index}` : `group:${owner.id}:${index}`;
}

export function lookForOwnerLabel(owner: LookForOwner): string {
  if (owner.kind === "document") {
    return "Overview";
  }
  return `${padIndex(owner.index)} ${owner.title}`;
}

export function selectionForLookFor(owner: LookForOwner): Selection {
  return owner.kind === "document" ? { kind: "overview" } : { kind: "group", id: owner.id };
}

export function claimsFromLookFor(owner: LookForOwner, items: readonly string[] | undefined): LookForClaim[] {
  return (items ?? []).map((text, index) => {
    const parsed = parseLookForBullet(text);
    const claim: LookForClaim = {
      key: lookForKey(owner, index),
      owner,
      index,
      text,
      body: parsed.body,
      sourceIds: citationIds(text),
    };
    if (parsed.tag !== undefined) {
      claim.tag = parsed.tag;
    }
    return claim;
  });
}

export function lookForClaims(document: { lookFor?: readonly string[] }, groups: readonly LookForGroup[]): LookForClaim[] {
  const claims = claimsFromLookFor({ kind: "document" }, document.lookFor);
  const parts = groupParts(groups);
  const byId = new Map(groups.map((group) => [group.id, group]));
  for (const part of parts) {
    for (const id of part.groupIds) {
      const group = byId.get(id);
      if (group === undefined) {
        continue;
      }
      const owner: LookForOwner = {
        kind: "group",
        id: group.id,
        title: group.title,
        index: groupOrderIndex(parts, group.id),
      };
      if (group.part !== undefined) {
        owner.part = group.part;
      }
      claims.push(...claimsFromLookFor(owner, group.lookFor));
    }
  }
  return claims;
}

export type LookForBucket = {
  owner: LookForOwner;
  claims: LookForClaim[];
  tags: LookForTag[];
};

export function lookForBuckets(claims: readonly LookForClaim[]): LookForBucket[] {
  const buckets: LookForBucket[] = [];
  for (const claim of claims) {
    const last = buckets[buckets.length - 1];
    const sameOwner =
      last !== undefined &&
      ((claim.owner.kind === "document" && last.owner.kind === "document") ||
        (claim.owner.kind === "group" && last.owner.kind === "group" && last.owner.id === claim.owner.id));
    if (sameOwner && last !== undefined) {
      last.claims.push(claim);
      if (claim.tag !== undefined && !last.tags.includes(claim.tag)) {
        last.tags.push(claim.tag);
      }
      continue;
    }
    buckets.push({
      owner: claim.owner,
      claims: [claim],
      tags: claim.tag !== undefined ? [claim.tag] : [],
    });
  }
  return buckets;
}

export type SourceOpenTarget = {
  selection: Selection;
  lookForKey?: string;
  commentId?: string;
};

export function openTargetForSource(
  source: Source,
  claims: readonly LookForClaim[],
  document: ReviewDocument,
  currentGroupId?: string,
): SourceOpenTarget {
  if (isLinePinned(source)) {
    const groupId = groupIdForPinnedSource(document, source);
    if (groupId !== undefined) {
      return { selection: { kind: "group", id: groupId }, commentId: source.id };
    }
  }
  const citing = claims.filter((claim) => claim.sourceIds.includes(source.id));
  const currentClaim = citing.find(
    (claim) => claim.owner.kind === "group" && claim.owner.id === currentGroupId,
  );
  if (currentClaim !== undefined) {
    return { selection: selectionForLookFor(currentClaim.owner), lookForKey: currentClaim.key };
  }
  if (currentGroupId !== undefined) {
    const current = document.groups.find((group) => group.id === currentGroupId);
    if (current !== undefined && groupSourceIds(current).includes(source.id)) {
      return { selection: { kind: "group", id: currentGroupId } };
    }
  }
  const groupClaim = citing.find((claim) => claim.owner.kind === "group");
  if (groupClaim !== undefined) {
    return { selection: selectionForLookFor(groupClaim.owner), lookForKey: groupClaim.key };
  }
  const named = document.groups.find((group) => (group.sources ?? []).includes(source.id));
  if (named !== undefined) {
    return { selection: { kind: "group", id: named.id } };
  }
  const documentClaim = citing.find((claim) => claim.owner.kind === "document");
  if (documentClaim !== undefined) {
    return { selection: selectionForLookFor(documentClaim.owner), lookForKey: documentClaim.key };
  }
  return { selection: { kind: "overview" } };
}
