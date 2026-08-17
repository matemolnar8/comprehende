import { layerIndex, type ReviewMeta } from "../api.ts";
import type { LayerFile } from "../lib/layer-files.ts";
import { HunkView } from "./HunkView.tsx";
import { Brief, LayerBrief } from "./LayerBrief.tsx";

export function Layer(props: {
  group: ReviewMeta["groups"][number] | null;
  groups: ReviewMeta["groups"];
  mixed: boolean;
  strandColor?: string;
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
  const { group, groups, mixed, strandColor, hunkError, files, activeHunk, split, splitRatio, wrap, viewedPaths } =
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
      {files.length === 0 && hunkError === null ? <p className="mt-8 text-muted-foreground">No hunks in this layer.</p> : null}
      {files.length > 0 ? (
        <p className="mt-8 font-mono text-xs tabular-nums text-muted-foreground">
          {files.filter((file) => viewedPaths.has(file.path)).length} of {files.length} files viewed
        </p>
      ) : null}
      <div className={files.length > 0 ? "mt-4 space-y-8" : "mt-8 space-y-8"}>
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
    </>
  );
}
