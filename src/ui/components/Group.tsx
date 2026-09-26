import { type ReviewMeta } from "../api.ts";
import { REVIEW_BUCKETS, type ReviewBucket } from "../../api/types.ts";
import type { GroupFile } from "../lib/group-files.ts";
import type { FileComment } from "../lib/source-display.ts";
import { useNarrow } from "../lib/narrow.ts";
import { waitCopy } from "../lib/wait.ts";
import { Brief, GroupBrief } from "./GroupBrief.tsx";
import { FileRail, FileStrip } from "./FileNav.tsx";
import { HunkView } from "./HunkView.tsx";
import { ReadingMark } from "./ReadingMark.tsx";
import { WaitMark } from "./WaitMark.tsx";
import { useEffect } from "react";

export function Group(props: {
  group: ReviewMeta["groups"][number] | null;
  bucket?: ReviewBucket;
  groups: ReviewMeta["groups"];
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
  focusLookForKey?: string;
}) {
  const { group, bucket, groups, strandColor, loading, hunkError, files, activeHunk, split, splitRatio, wrap, viewedPaths } =
    props;
  const lockfiles = bucket === REVIEW_BUCKETS.lockfiles;
  const strand =
    strandColor ??
    (lockfiles ? "var(--muted-foreground)" : bucket === REVIEW_BUCKETS.unassigned ? "var(--warn)" : "var(--primary)");

  const filePaths = files.map((file) => file.path);
  const narrow = useNarrow();

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

  const multi = files.length > 1;
  const fileNodes = files.map((file) => (
    <HunkView
      key={file.path}
      file={file}
      active={multi && activeHunk >= file.firstIndex && activeHunk < file.firstIndex + file.hunkCount}
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
  ));

  return (
    <>
      <div className="mb-4 flex items-stretch gap-3 min-[800px]:mb-5 min-[800px]:gap-4">
        <span
          className="w-[3px] flex-none rounded-px [[data-motion=group]_&]:[view-transition-name:review-strand]"
          style={{ backgroundColor: strand }}
          aria-hidden
        />
        <div className="min-w-0 flex-1 [[data-motion=group]_&]:[view-transition-name:review-copy]">
          {group !== null ? (
            <GroupBrief
              group={group}
              groups={groups}
              document={props.document}
              onOpenGroup={props.onOpenGroup}
              focusLookForKey={props.focusLookForKey}
            />
          ) : lockfiles ? (
            <Brief kicker="Lockfiles" title="Generated lockfiles" />
          ) : (
            <Brief kicker="Unassigned" title="Not in any group">
              <p className="leading-[1.45] text-foreground">
                These hunks are in git and in no group. Fix the review document. Never the diff.
              </p>
            </Brief>
          )}
        </div>
      </div>
      {hunkError !== null ? <p className="mt-4 text-warn">{hunkError}</p> : null}
      {loading ? (
        <article className="mt-8 overflow-hidden rounded-lg border border-border bg-card">
          <WaitMark label={waitCopy.group} />
        </article>
      ) : null}
      {!loading && files.length === 0 && hunkError === null ? (
        <p className="mt-8 text-muted-foreground">No hunks in this group.</p>
      ) : null}

      {!loading && files.length > 0 ? (
        <p className="mt-4 font-mono text-[11px] tabular-nums text-muted-foreground">
          <ReadingMark paths={filePaths} viewed={viewedPaths} noun className="mt-0" />
          {!narrow ? <span> · j/k to move, v to toggle</span> : null}
        </p>
      ) : null}

      {!loading && files.length > 0 ? (
        multi ? (
          narrow ? (
            <FileStrip files={files} activeHunk={activeHunk} viewedPaths={viewedPaths} onSelect={props.onScrollToHunk}>
              {fileNodes}
            </FileStrip>
          ) : (
            <FileRail
              files={files}
              activeHunk={activeHunk}
              viewedPaths={viewedPaths}
              onSelect={props.onScrollToHunk}
              onViewed={props.onViewed}
            >
              {fileNodes}
            </FileRail>
          )
        ) : (
          <div className="mt-4">{fileNodes}</div>
        )
      ) : null}
    </>
  );
}
