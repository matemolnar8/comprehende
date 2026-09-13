export type StoryGroup = {
  id: string;
  title: string;
  dependsOn?: readonly string[];
};

export type StoryHop = {
  id: string;
  title: string;
};

export type StoryNav = {
  dependsOn: StoryHop[];
  dependents: StoryHop[];
};

export function storyNav(groups: readonly StoryGroup[], groupId: string): StoryNav {
  const byId = new Map(groups.map((group) => [group.id, group]));
  const group = byId.get(groupId);
  if (group === undefined) {
    return { dependsOn: [], dependents: [] };
  }
  return {
    dependsOn: (group.dependsOn ?? []).flatMap((id) => hop(byId, id)),
    dependents: groups.flatMap((item) => ((item.dependsOn ?? []).includes(groupId) ? hop(byId, item.id) : [])),
  };
}

function hop(byId: Map<string, StoryGroup>, id: string): StoryHop[] {
  const group = byId.get(id);
  return group === undefined ? [] : [{ id, title: group.title }];
}
