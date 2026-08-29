import type { LinePinnedSource, Source, SourceKind, SourceSide } from "../../schema/types.ts";
import { isLinePinned } from "../../schema/source.ts";
import type { AnnotationSide } from "@pierre/diffs";
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

export function pierreSide(side: SourceSide): AnnotationSide {
  return side === "old" ? "deletions" : "additions";
}

export type FileComment = LinePinnedSource & { stale: boolean };

export function commentsForFile(
  sources: readonly Source[],
  staleIds: ReadonlySet<string>,
  path: string,
  oldPath?: string,
): FileComment[] {
  return sources.filter(isLinePinned).flatMap((source) => {
    if (source.path !== path && source.path !== oldPath) {
      return [];
    }
    return [{ ...source, stale: staleIds.has(source.id) }];
  });
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
