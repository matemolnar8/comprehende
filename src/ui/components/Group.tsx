import { groupIndex, type ReviewMeta } from "../api.ts";
import { REVIEW_BUCKETS, type ReviewBucket } from "../../api/types.ts";
import type { GroupFile } from "../lib/group-files.ts";
import type { FileComment } from "../lib/source-display.ts";
import { waitCopy } from "../lib/wait.ts";
import { Brief, GroupBrief } from "./GroupBrief.tsx";
import { FileRail } from "./FileNav.tsx";
import { HunkView } from "./HunkView.tsx";
import { WaitMark } from "./WaitMark.tsx";
import { useEffect } from "react";

export function Group(props: {
  group: ReviewMeta["groups"][number] | null;
  bucket?: ReviewBucket;
  groups: ReviewMeta["groups"];
  mixed: boolean;
  strandColor?: string;
  loading: boolean;
  hunkError: string | null;
  files: GroupFile[];
  activeHunk: number;
  split: boolean;
  splitRatio: number;
  wrap: boolean;
  viewedPaths: ReadonlySet<string>;
  onScrollToHunk: (index: number) => void;
  onOpenGroup: (id: string) => void;
  onOpenFile: (path: string) => void;
  onSplitRatio: (ratio: number) => void;
  onViewed: (path: string, viewed: boolean) => void;
  document: ReviewMeta["document"];
  comments?: FileComment[];
  focusCommentId?: string;
}) {
  const { group, bucket, groups, mixed, strandColor, loading, hunkError, files, activeHunk, split, splitRatio, wrap, viewedPaths } =
    props;
  const lockfiles = bucket === REVIEW_BUCKETS.lockfiles;
  const strand =
    strandColor ??
    (lockfiles ? "var(--muted-foreground)" : bucket === REVIEW_BUCKETS.unassigned ? "var(--warn)" : "var(--primary)");

  const viewedCount = files.filter((file) => viewedPaths.has(file.path)).length;

  useEffect(() => {
    const id = props.focusCommentId;
    if (id === undefined || loading) {
      return;
    }
    let frames = 0;
    const tick = (): void => {
      const el = document.querySelector(`[data-source-id="${CSS.escape(id)}"]`);
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      frames += 1;
      if (frames < 90) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, [loading, props.focusCommentId, files]);

  const renderFile = (file: GroupFile, active: boolean) => (
    <HunkView
      key={file.path}
      file={file}
      active={active}
      index={file.firstIndex}
      split={split}
      splitRatio={splitRatio}
      wrap={wrap}
      viewed={viewedPaths.has(file.path)}
      onSplitRatio={props.onSplitRatio}
      onOpen={props.onOpenFile}
      onViewed={props.onViewed}
      comments={props.comments}
      focusCommentId={props.focusCommentId}
    />
  );

  return (
    <>
      <div className="mb-8 flex items-stretch gap-4">
        <span
          className="w-[3px] flex-none rounded-px [[data-motion=group]_&]:[view-transition-name:review-strand]"
          style={{ backgroundColor: strand }}
          aria-hidden
        />
        <div className="min-w-0 flex-1 [[data-motion=group]_&]:[view-transition-name:review-copy]">
          {group !== null ? (
            <GroupBrief
              group={group}
              index={groupIndex(groups, group.id)}
              groups={groups}
              document={props.document}
              partTitle={mixed ? group.part : undefined}
              onOpenGroup={props.onOpenGroup}
            />
          ) : lockfiles ? (
            <Brief kicker="Lockfiles" title="Generated lockfiles" />
          ) : (
            <Brief kicker="Unassigned" title="Not in any group">
              <p className="font-display text-xl leading-relaxed text-foreground">
                These hunks are in git and in no group. Fix the review document. Never the diff.
              </p>
            </Brief>
          )}
        </div>
      </div>
      {hunkError !== null ? <p className="mt-4 text-warn">{hunkError}</p> : null}
      {loading ? (
        <article className="mt-8 overflow-hidden rounded-lg border border-border bg-card shadow-card">
          <WaitMark label={waitCopy.group} />
        </article>
      ) : null}
      {!loading && files.length === 0 && hunkError === null ? (
        <p className="mt-8 text-muted-foreground">No hunks in this group.</p>
      ) : null}

      {!loading && files.length > 0 ? (
        <p className="mt-8 font-mono text-xs tabular-nums text-muted-foreground">
          {viewedCount} of {files.length} files viewed
          <span className="hidden sm:inline"> · j/k to move, v to toggle</span>
        </p>
      ) : null}

      {!loading && files.length > 0 ? (
        <FileRail files={files} activeHunk={activeHunk} viewedPaths={viewedPaths} onSelect={props.onScrollToHunk} onViewed={props.onViewed}>
          {files.map((file) => renderFile(file, activeHunk >= file.firstIndex && activeHunk < file.firstIndex + file.hunkCount))}
        </FileRail>
      ) : null}
    </>
  );
}
