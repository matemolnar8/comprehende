import type { RefObject } from "react";
import type { ReviewMeta } from "../api.ts";
import { REVIEW_BUCKETS } from "../../api/types.ts";
import type { GroupFile } from "../lib/group-files.ts";
import type { FileComment } from "../lib/source-display.ts";
import type { InspectorState } from "./Inspector.tsx";
import { Inspector } from "./Inspector.tsx";
import { Overview } from "./Overview.tsx";
import { Group } from "./Group.tsx";
import { cn } from "@/lib/utils.ts";
import type { Selection } from "../lib/selection.ts";
import type { Part } from "../lib/parts.ts";

export function ReviewStage(props: {
  inspector: InspectorState | null;
  wrap: boolean;
  setInspector: (inspector: InspectorState) => void;
  onCloseInspector: () => void;
  mainRef: RefObject<HTMLElement | null>;
  hunksLoading: boolean;
  compact?: boolean;
  className?: string;
  selection: Selection | null;
  meta: ReviewMeta;
  parts: Part[];
  selectedGroup: ReviewMeta["groups"][number] | null;
  mixed: boolean;
  strandColor?: string;
  hunkError: string | null;
  files: GroupFile[];
  activeHunk: number;
  split: boolean;
  splitRatio: number;
  viewedPaths: ReadonlySet<string>;
  onScrollToHunk: (index: number) => void;
  onSelect: (selection: Selection) => void;
  onOpenFile: (path: string) => void;
  onSplitRatio: (ratio: number) => void;
  onViewed: (path: string, viewed: boolean) => void;
  comments: FileComment[];
  focusCommentId?: string;
}) {
  const pad = props.compact === true ? "px-4 py-4" : "px-10 py-8";
  if (props.inspector !== null) {
    return (
      <Inspector
        inspector={props.inspector}
        wrap={props.wrap}
        setInspector={props.setInspector}
        onClose={props.onCloseInspector}
      />
    );
  }
  return (
    <main
      ref={props.mainRef}
      className={cn("h-full overflow-auto", pad, props.className)}
      aria-busy={props.hunksLoading}
    >
      {props.selection?.kind === "overview" ? (
        <Overview meta={props.meta} parts={props.parts} onOpenGroup={(id) => props.onSelect({ kind: "group", id })} />
      ) : (
        <Group
          group={props.selectedGroup}
          bucket={
            props.selection?.kind === REVIEW_BUCKETS.lockfiles
              ? REVIEW_BUCKETS.lockfiles
              : props.selection?.kind === REVIEW_BUCKETS.unassigned
                ? REVIEW_BUCKETS.unassigned
                : undefined
          }
          groups={props.meta.groups}
          mixed={props.mixed}
          strandColor={props.strandColor}
          loading={props.hunksLoading}
          hunkError={props.hunkError}
          files={props.hunksLoading ? [] : props.files}
          activeHunk={props.activeHunk}
          split={props.split}
          splitRatio={props.splitRatio}
          wrap={props.wrap}
          viewedPaths={props.viewedPaths}
          onScrollToHunk={props.onScrollToHunk}
          onOpenGroup={(id) => props.onSelect({ kind: "group", id })}
          onOpenFile={props.onOpenFile}
          onSplitRatio={props.onSplitRatio}
          onViewed={props.onViewed}
          document={props.meta.document}
          comments={props.comments}
          focusCommentId={props.focusCommentId}
        />
      )}
    </main>
  );
}
