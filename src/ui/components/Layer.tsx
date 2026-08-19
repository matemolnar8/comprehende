import { layerIndex, type ReviewMeta } from "../api.ts";
import type { LayerFile } from "../lib/layer-files.ts";
import { waitCopy } from "../lib/wait.ts";
import { HunkView } from "./HunkView.tsx";
import { Brief, LayerBrief } from "./LayerBrief.tsx";
import { WaitMark } from "./WaitMark.tsx";

export function Layer(props: {
  group: ReviewMeta["groups"][number] | null;
  groups: ReviewMeta["groups"];
  mixed: boolean;
  strandColor?: string;
  loading: boolean;
  hunkError: string | null;
  files: LayerFile[];
  activeHunk: number;
  split: boolean;
  splitRatio: number;
  wrap: boolean;
  viewedPaths: ReadonlySet<string>;
  onOpenLayer: (id: string) => void;
  onOpenFile: (path: string) => void;
  onSplitRatio: (ratio: number) => void;
  onViewed: (path: string, viewed: boolean) => void;
}) {
  const { group, groups, mixed, strandColor, loading, hunkError, files, activeHunk, split, splitRatio, wrap, viewedPaths } =
    props;

  return (
    <>
      <div className="review-brief">
        {strandColor !== undefined ? (
          <span className="review-brief-strand" style={{ backgroundColor: strandColor }} aria-hidden />
        ) : null}
        <div className="review-brief-copy">
          {group !== null ? (
            <LayerBrief
              group={group}
              index={layerIndex(groups, group.id)}
              groups={groups}
              partTitle={mixed ? group.part : undefined}
              onOpenLayer={props.onOpenLayer}
            />
          ) : (
            <Brief kicker="Unassigned" title="Not in any layer">
              <p className="font-serif text-lg leading-relaxed text-foreground">
                These hunks are in git and in no layer. Fix the review document — never the diff.
              </p>
            </Brief>
          )}
        </div>
      </div>
      {hunkError !== null ? <p className="mt-4 text-warn">{hunkError}</p> : null}
      {loading ? (
        <article className="hunk-card mt-8 overflow-hidden rounded-lg border border-border bg-card">
          <WaitMark label={waitCopy.layer} />
        </article>
      ) : null}
      {!loading && files.length === 0 && hunkError === null ? (
        <p className="mt-8 text-muted-foreground">No hunks in this layer.</p>
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
