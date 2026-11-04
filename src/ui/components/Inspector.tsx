import { useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchBlame, fetchFile, resourceHref } from "../api.ts";
import type { ApiBlameLine, FileSide } from "../../api/types.ts";
import { isImagePath } from "../../schema/image.ts";
import { groupBlameRuns } from "../../schema/blame-runs.ts";
import {
  BlameStamp,
  InReviewBadge,
  PierreFile,
  blameGutterCss,
  type FileAnnotation,
} from "../PierreDiff.tsx";
import { waitCopy } from "../lib/wait.ts";
import { Button } from "@/components/ui/button.tsx";
import { Segmented, SegmentedItem } from "@/components/ui/segmented.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { ArrowLeftIcon } from "lucide-react";
import { Kbd } from "./Kbd.tsx";
import { WaitMark } from "./WaitMark.tsx";

export type InspectorState = {
  path: string;
  mode: "file" | "blame";
  side: FileSide;
};

export function Inspector(props: {
  inspector: InspectorState;
  wrap: boolean;
  setInspector: (inspector: InspectorState) => void;
  onClose: () => void;
  /** Full SHAs of the commits under review. Blame marks the lines they last changed. */
  rangeShas?: ReadonlySet<string>;
}) {
  const { inspector, wrap, setInspector, onClose, rangeShas } = props;
  const image = isImagePath(inspector.path);
  const [content, setContent] = useState<string>("");
  const [blame, setBlame] = useState<ApiBlameLine[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gutterWidth, setGutterWidth] = useState(0);
  const blameContents = useMemo(
    () => (blame === null ? "" : blame.map((line) => line.text).join("\n")),
    [blame],
  );
  // Each stamp heads the run below it: it sits after the last line of the run before.
  // The first run has no line above it, so its stamp sits over the file.
  const blameStamps = useMemo(() => {
    if (blame === null) {
      return undefined;
    }
    const runs: FileAnnotation[] = groupBlameRuns(blame).map((run) => ({
      lineNumber: run.lineNumber - 1,
      metadata: {
        sha: run.sha,
        author: run.author,
        timestamp: run.timestamp,
        summary: run.summary,
        lines: run.lines,
        start: run.lineNumber,
        inRange: rangeShas?.has(run.sha) === true,
      },
    }));
    const [first, ...rest] = runs;
    if (first === undefined) {
      return undefined;
    }
    const gutterCss = blameGutterCss(runs.map((run) => run.metadata));
    const anyInRange = runs.some((run) => run.metadata.inRange);
    return { first: first.metadata, rest, gutterCss, anyInRange };
  }, [blame, rangeShas]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setLoading(true);
    setContent("");
    setBlame(null);
    if (image) {
      setLoading(false);
      return;
    }
    if (inspector.mode === "file") {
      void fetchFile(inspector.path, inspector.side)
        .then((payload) => {
          if (!cancelled) {
            setContent(payload.content);
            setLoading(false);
          }
        })
        .catch((cause: unknown) => {
          if (!cancelled) {
            setError(cause instanceof Error ? cause.message : String(cause));
            setLoading(false);
          }
        });
    } else {
      void fetchBlame(inspector.path, inspector.side)
        .then((payload) => {
          if (!cancelled) {
            setBlame(payload.lines);
            setLoading(false);
          }
        })
        .catch((cause: unknown) => {
          if (!cancelled) {
            setError(cause instanceof Error ? cause.message : String(cause));
            setLoading(false);
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [image, inspector]);

  return (
    <div className="review-inspector flex h-full min-h-0 flex-col" aria-busy={loading}>
      <div className="flex flex-wrap items-center gap-3 px-4 pt-3 pb-3 min-[800px]:px-8 min-[800px]:pt-6 min-[800px]:pb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="sm" variant="outline" onClick={onClose}>
              <ArrowLeftIcon />
              Back
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            Back to the diff
            <Kbd>esc</Kbd>
          </TooltipContent>
        </Tooltip>
        <strong className="min-w-0 truncate font-mono text-sm font-medium">{inspector.path}</strong>
        <div className="ml-auto flex items-center gap-3 max-[800px]:items-end">
          <Control caption="Version">
            <Segmented label="Version">
              <SegmentedItem
                active={inspector.side === "old"}
                onClick={() => setInspector({ ...inspector, side: "old" })}
                hint="The file at base"
              >
                Base
              </SegmentedItem>
              <SegmentedItem
                active={inspector.side === "new"}
                onClick={() => setInspector({ ...inspector, side: "new" })}
                hint="The file at head"
              >
                Head
              </SegmentedItem>
            </Segmented>
          </Control>
          {image ? null : (
            <>
              <span aria-hidden className="h-5 w-px bg-border max-[800px]:mb-1.5" />
              <Control caption="Mode">
                <Segmented label="Mode">
                  <SegmentedItem
                    active={inspector.mode === "file"}
                    onClick={() => setInspector({ ...inspector, mode: "file" })}
                    hint="Show the whole file"
                  >
                    File
                  </SegmentedItem>
                  <SegmentedItem
                    active={inspector.mode === "blame"}
                    onClick={() => setInspector({ ...inspector, mode: "blame" })}
                    hint="Show who changed each line last"
                  >
                    Blame
                  </SegmentedItem>
                </Segmented>
              </Control>
            </>
          )}
        </div>
      </div>
      {error !== null ? <p className="px-4 text-warn min-[800px]:px-8">{error}</p> : null}
      {loading && error === null && !image ? (
        <div className="px-4 pt-2 min-[800px]:px-8">
          <WaitMark label={inspector.mode === "file" ? waitCopy.file : waitCopy.blame} />
        </div>
      ) : null}
      {image ? (
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-8 min-[800px]:px-8">
          <img
            src={resourceHref({ kind: "image", path: inspector.path, side: inspector.side })}
            alt={`${inspector.side === "old" ? "Base" : "Head"} ${inspector.path}`}
            className="h-auto max-w-full rounded-lg border border-border bg-[var(--diff-canvas)]"
          />
        </div>
      ) : null}
      {!image && inspector.mode === "file" && error === null && !loading ? (
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-8 min-[800px]:px-8">
          <div className="overflow-hidden rounded-lg border border-border">
            <PierreFile path={inspector.path} contents={content} wrap={wrap} />
          </div>
        </div>
      ) : null}
      {!image && inspector.mode === "blame" && error === null && !loading && blame !== null ? (
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-8 min-[800px]:px-8">
          {blameStamps?.anyInRange === true ? (
            <p className="m-0 mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <InReviewBadge />
              Last changed by a commit in this review.
            </p>
          ) : null}
          <div className="overflow-hidden rounded-lg border border-border bg-[var(--diff-canvas)]">
            {blameStamps !== undefined ? (
              <BlameStamp meta={blameStamps.first} indent={gutterWidth} />
            ) : null}
            <PierreFile
              path={inspector.path}
              contents={blameContents}
              wrap={wrap}
              annotations={blameStamps?.rest}
              extraCss={blameStamps?.gutterCss}
              onGutterWidth={setGutterWidth}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** A caption next to its control. Under 800px the caption stacks above it. */
function Control(props: { caption: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 max-[800px]:flex-col max-[800px]:items-start max-[800px]:gap-1">
      <span aria-hidden className="text-xs text-muted-foreground">
        {props.caption}
      </span>
      {props.children}
    </div>
  );
}
