import { groupParts, isMixedReview, type Part } from "./parts.ts";

export type StoryGroup = {
  id: string;
  title: string;
  part?: string;
  suggestedOrder?: number;
  dependsOn?: readonly string[];
};

export type StoryHop = {
  id: string;
  title: string;
  axis: "group" | "part";
  partTitle?: string;
};

export type StoryNav = {
  partTitle?: string;
  previous?: StoryHop;
  next?: StoryHop;
  previousPart?: StoryHop;
  nextPart?: StoryHop;
  dependsOn: StoryHop[];
  dependents: StoryHop[];
};

export function storyNav(groups: readonly StoryGroup[], groupId: string): StoryNav {
  return storyNavFromParts(groups, groupParts(groups), groupId);
}

export function storyNavFromParts(groups: readonly StoryGroup[], parts: readonly Part[], groupId: string): StoryNav {
  const byId = new Map(groups.map((group) => [group.id, group]));
  const partIndex = parts.findIndex((part) => part.groupIds.includes(groupId));
  const part = parts[partIndex];
  if (part === undefined) {
    return { dependsOn: [], dependents: [] };
  }

  const mixed = isMixedReview(parts);
  const index = part.groupIds.indexOf(groupId);
  const group = byId.get(groupId);
  const previous = groupHop(byId, part.groupIds[index - 1]);
  const next = groupHop(byId, part.groupIds[index + 1]);
  const previousPart = mixed ? partHop(byId, parts[partIndex - 1]) : undefined;
  const nextPart = mixed ? partHop(byId, parts[partIndex + 1]) : undefined;

  return {
    ...(part.title !== undefined ? { partTitle: part.title } : {}),
    ...(previous !== undefined ? { previous } : {}),
    ...(next !== undefined ? { next } : {}),
    ...(previousPart !== undefined ? { previousPart } : {}),
    ...(nextPart !== undefined ? { nextPart } : {}),
    dependsOn: (group?.dependsOn ?? []).flatMap((id) => {
      const hop = groupHop(byId, id);
      return hop === undefined ? [] : [hop];
    }),
    dependents: groups.flatMap((item) => {
      if (!(item.dependsOn ?? []).includes(groupId)) {
        return [];
      }
      const hop = groupHop(byId, item.id);
      return hop === undefined ? [] : [hop];
    }),
  };
}

function groupHop(byId: Map<string, StoryGroup>, id: string | undefined): StoryHop | undefined {
  if (id === undefined) {
    return undefined;
  }
  const group = byId.get(id);
  if (group === undefined) {
    return undefined;
  }
  return { id, title: group.title, axis: "group" };
}

function partHop(byId: Map<string, StoryGroup>, part: Part | undefined): StoryHop | undefined {
  const id = part?.groupIds[0];
  if (part === undefined || id === undefined) {
    return undefined;
  }
  const group = byId.get(id);
  if (group === undefined) {
    return undefined;
  }
  return {
    id,
    title: group.title,
    axis: "part",
    ...(part.title !== undefined ? { partTitle: part.title } : {}),
  };
}
