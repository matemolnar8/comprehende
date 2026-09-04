import type { LinePinnedSource, SourceKind } from "../../schema/types.ts";
import {
  BotIcon,
  CircleDotIcon,
  GitCommitHorizontalIcon,
  GitPullRequestIcon,
  MessageSquareIcon,
  type LucideIcon,
} from "lucide-react";

export const SOURCE_KIND_LABEL: Record<SourceKind, string> = {
  ticket: "Ticket",
  pr: "Pull request",
  "pr-comment": "Comment",
  commit: "Commit",
  transcript: "Transcript",
};

export const SOURCE_KIND_ICON: Record<SourceKind, LucideIcon> = {
  ticket: CircleDotIcon,
  pr: GitPullRequestIcon,
  "pr-comment": MessageSquareIcon,
  commit: GitCommitHorizontalIcon,
  transcript: BotIcon,
};

export type FileComment = LinePinnedSource & { stale: boolean };

export function visibleFileComments(
  comments: readonly LinePinnedSource[],
  show: boolean,
  staleIds: ReadonlySet<string>,
): FileComment[] {
  if (!show) {
    return [];
  }
  return comments.map((source) => ({ ...source, stale: staleIds.has(source.id) }));
}

export function commentsByLine(comments: readonly FileComment[]): Map<string, FileComment[]> {
  const map = new Map<string, FileComment[]>();
  for (const comment of comments) {
    const key = `${comment.side}:${comment.line}`;
    const list = map.get(key) ?? [];
    list.push(comment);
    map.set(key, list);
  }
  return map;
}
