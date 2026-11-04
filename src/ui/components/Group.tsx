import { type ReviewMeta } from "../api.ts";
import { REVIEW_BUCKETS, type ReviewBucket } from "../../api/types.ts";
import type { GroupFile } from "../lib/group-files.ts";
import type { FileComment } from "../lib/source-display.ts";
import { useNarrow } from "../lib/narrow.ts";
import { waitCopy } from "../lib/wait.ts";
import { Brief, GroupBrief } from "./GroupBrief.tsx";
import { FileList, FileRail, FileStrip } from "./FileNav.tsx";
import { HunkView } from "./HunkView.tsx";
import { letterNotes } from "../lib/focus.ts";
import { WaitMark } from "./WaitMark.tsx";
import {
  briefProse,
  briefRail,
  contentColumn,
  metaText,
  scrollFade,
  splitAside,
  splitAsideHeight,
  splitMain,
  splitRoot,
  splitRow,
  splitWide,
  stackedNoFade,
} from "./Kicker.tsx";
import { HashLink } from "./HashLink.tsx";
import type { Selection } from "../lib/selection.ts";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { useEffect, useMemo, useRef } from "react";
import { useScrollEdges } from "../lib/scroll-edges.ts";

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
  focusClaimKey?: string;
  next: Selection;
  nextLabel: string;
  onSelect: (selection: Selection) => void;
}) {
  const {
    group,
    bucket,
    groups,
    strandColor,
    loading,
    hunkError,
    files,
    activeHunk,
    split,
    splitRatio,
    wrap,
    viewedPaths,
  } = props;
  const lockfiles = bucket === REVIEW_BUCKETS.lockfiles;
  const strand = strandColor ?? "var(--muted-foreground)";

  const listed = props.document.groups.find((item) => item.id === group?.id);
  const notes = useMemo(() => letterNotes(listed?.notes ?? []), [listed]);
  const narrow = useNarrow();
  const briefRef = useRef<HTMLDivElement>(null);
  useScrollEdges(briefRef);

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
      active={
        multi && activeHunk >= file.firstIndex && activeHunk < file.firstIndex + file.hunkCount
      }
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
      focus={listed?.focus}
      notes={notes}
      fileNote={listed?.fileNotes?.[file.path]}
    />
  ));
  const brief =
    group !== null ? (
      <GroupBrief
        group={group}
        groups={groups}
        document={props.document}
        onOpenGroup={props.onOpenGroup}
        focusClaimKey={props.focusClaimKey}
      />
    ) : lockfiles ? (
      <Brief title="Lockfiles">
        <p className={briefProse}>A package manager writes these files.</p>
      </Brief>
    ) : (
      <Brief title="Unassigned">
        <p className={briefProse}>No group in the review covers these hunks.</p>
      </Brief>
    );

  return (
    <div className={splitRoot}>
      <div className={splitRow}>
        <aside
          className={cn(
            splitAside(),
            "mb-2 flex items-stretch gap-3 min-[800px]:mb-3 min-[800px]:gap-4 @min-[60rem]/review:mb-0 @min-[60rem]/review:overflow-hidden",
          )}
        >
          <span
            className={cn(
              briefRail,
              "[[data-motion=group]_&]:[view-transition-name:review-strand]",
            )}
            style={{ backgroundColor: strand }}
            aria-hidden
          />
          <div
            className={cn(
              splitAsideHeight,
              "flex min-w-0 flex-1 flex-col [[data-motion=group]_&]:[view-transition-name:review-copy]",
            )}
          >
            {/* The brief keeps its height unless it alone overflows the column; the file list scrolls on its own. */}
            <div
              ref={briefRef}
              className={cn(
                "min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:thin]",
                scrollFade,
                stackedNoFade,
              )}
            >
              {brief}
            </div>
            {!loading && multi && !narrow ? (
              <FileList
                files={files}
                activeHunk={activeHunk}
                viewedPaths={viewedPaths}
                onSelect={props.onScrollToHunk}
                className={cn(splitWide, "border-t border-border pt-4")}
              />
            ) : null}
          </div>
        </aside>
        <div className={splitMain}>
          {hunkError !== null ? (
            <p className="mt-4 text-warn @min-[60rem]/review:mt-0">{hunkError}</p>
          ) : null}
          {loading ? (
            <article className="mt-8 overflow-hidden rounded-lg border border-border bg-card @min-[60rem]/review:mt-0">
              <WaitMark label={waitCopy.group} />
            </article>
          ) : null}
          {!loading && files.length === 0 && hunkError === null ? (
            <p className="mt-8 text-muted-foreground @min-[60rem]/review:mt-0">
              No hunks in this group.
            </p>
          ) : null}

          {!loading && files.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3 @min-[60rem]/review:mt-0">
              {multi ? (
                narrow ? (
                  <FileStrip
                    files={files}
                    activeHunk={activeHunk}
                    viewedPaths={viewedPaths}
                    onSelect={props.onScrollToHunk}
                  >
                    {fileNodes}
                  </FileStrip>
                ) : (
                  <FileRail
                    files={files}
                    activeHunk={activeHunk}
                    viewedPaths={viewedPaths}
                    onSelect={props.onScrollToHunk}
                  >
                    {fileNodes}
                  </FileRail>
                )
              ) : (
                fileNodes
              )}
            </div>
          ) : null}
          {!loading ? (
            <NextPage next={props.next} label={props.nextLabel} onSelect={props.onSelect} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function NextPage(props: { next: Selection; label: string; onSelect: (next: Selection) => void }) {
  const overview = props.next.kind === "overview";
  return (
    <nav
      aria-label="Next page"
      className={cn(
        contentColumn,
        "mt-8 border-t border-border pt-4 @min-[60rem]/review:max-w-none",
      )}
    >
      <HashLink
        selection={props.next}
        onSelect={props.onSelect}
        className="group/next -mx-2 flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent"
      >
        <span className={cn(metaText, "shrink-0")}>{overview ? "Back to" : "Next"}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {props.label}
        </span>
        <ArrowRightIcon
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/next:translate-x-0.5 group-hover/next:text-foreground"
        />
      </HashLink>
    </nav>
  );
}
