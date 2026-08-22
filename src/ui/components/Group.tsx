import { groupIndex, type ReviewMeta } from "../api.ts";
import type { GroupFile } from "../lib/group-files.ts";
import { waitCopy } from "../lib/wait.ts";
import { Brief, GroupBrief } from "./GroupBrief.tsx";
import { HunkView } from "./HunkView.tsx";
import { WaitMark } from "./WaitMark.tsx";

export function Group(props: {
  group: ReviewMeta["groups"][number] | null;
  bucket?: "unassigned" | "lockfiles";
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
  onOpenGroup: (id: string) => void;
  onOpenFile: (path: string) => void;
  onSplitRatio: (ratio: number) => void;
  onViewed: (path: string, viewed: boolean) => void;
}) {
  const { group, bucket, groups, mixed, strandColor, loading, hunkError, files, activeHunk, split, splitRatio, wrap, viewedPaths } =
    props;
  const lockfiles = bucket === "lockfiles";
  const showStrand = strandColor !== undefined || lockfiles;

  return (
    <>
      <div className="review-brief">
        {showStrand ? (
          <span
            className="review-brief-strand"
            style={strandColor !== undefined ? { backgroundColor: strandColor } : undefined}
            aria-hidden
          />
        ) : null}
        <div className="review-brief-copy">
          {group !== null ? (
            <GroupBrief
              group={group}
              index={groupIndex(groups, group.id)}
              groups={groups}
              partTitle={mixed ? group.part : undefined}
              onOpenGroup={props.onOpenGroup}
            />
          ) : lockfiles ? (
            <Brief kicker="Lockfiles" title="Generated lockfiles" />
          ) : (
            <Brief kicker="Unassigned" title="Not in any group">
              <p className="font-serif text-lg leading-relaxed text-foreground">
                These hunks are in git and in no group. Fix the review document. Never the diff.
              </p>
            </Brief>
          )}
        </div>
      </div>
      {hunkError !== null ? <p className="mt-4 text-warn">{hunkError}</p> : null}
      {loading ? (
        <article className="hunk-card mt-8 overflow-hidden rounded-lg border border-border bg-card">
          <WaitMark label={waitCopy.group} />
        </article>
      ) : null}
      {!loading && files.length === 0 && hunkError === null ? (
        <p className="mt-8 text-muted-foreground">No hunks in this group.</p>
      ) : null}
      {!loading && files.length > 0 ? (
        <p className="mt-8 font-mono text-xs tabular-nums text-muted-foreground">
          {files.filter((file) => viewedPaths.has(file.path)).length} of {files.length} files viewed
        </p>
      ) : null}
      {!loading && files.length > 0 ? (
        <div className="mt-4 space-y-8">
          {files.map((file) => (
            <HunkView
              key={file.path}
              file={file}
              active={activeHunk >= file.firstIndex && activeHunk < file.firstIndex + file.hunkCount}
              index={file.firstIndex}
              split={split}
              splitRatio={splitRatio}
              wrap={wrap}
              viewed={viewedPaths.has(file.path)}
              onSplitRatio={props.onSplitRatio}
              onOpen={props.onOpenFile}
              onViewed={props.onViewed}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
