import { useEffect, useMemo, useState } from "react";
import { fetchBlame, fetchFile } from "../api.ts";
import { groupBlameRuns } from "../../schema/blame-runs.ts";
import { PierreFile } from "../PierreDiff.tsx";
import { waitCopy } from "../lib/wait.ts";
import { Button } from "@/components/ui/button.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Kbd } from "./Kbd.tsx";
import { WaitMark } from "./WaitMark.tsx";

export type InspectorState = {
  path: string;
  mode: "file" | "blame";
  side: "old" | "new";
};

export function Inspector(props: {
  inspector: InspectorState;
  wrap: boolean;
  setInspector: (inspector: InspectorState) => void;
  onClose: () => void;
}) {
  const { inspector, wrap, setInspector, onClose } = props;
  const [content, setContent] = useState<string>("");
  const [blame, setBlame] = useState<{ author: string; line: number; text: string; sha: string; timestamp: number }[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const blameContents = useMemo(
    () => (blame === null ? "" : blame.map((line) => line.text).join("\n")),
    [blame],
  );
  const blameAnnotations = useMemo(() => {
    if (blame === null) {
      return undefined;
    }
    return groupBlameRuns(blame).map((run) => ({
      lineNumber: run.lineNumber,
      metadata: {
        sha: run.sha,
        author: run.author,
        timestamp: run.timestamp,
        lines: run.lines,
      },
    }));
  }, [blame]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setLoading(true);
    setContent("");
    setBlame(null);
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
  }, [inspector]);

  return (
    <div className="review-inspector flex h-full min-h-0 flex-col" aria-busy={loading}>
      <div className="flex flex-wrap items-center gap-3 px-8 pt-6 pb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="sm" variant="outline" onClick={onClose}>
              Back
              <Kbd>esc</Kbd>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back to the diff</TooltipContent>
        </Tooltip>
        <strong className="min-w-0 truncate font-mono text-sm font-medium">{inspector.path}</strong>
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant={inspector.mode === "file" ? "secondary" : "ghost"}
            onClick={() => setInspector({ ...inspector, mode: "file" })}
          >
            File
          </Button>
          <Button
            type="button"
            size="sm"
            variant={inspector.mode === "blame" ? "secondary" : "ghost"}
            onClick={() => setInspector({ ...inspector, mode: "blame" })}
          >
            Blame
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button
            type="button"
            size="sm"
            variant={inspector.side === "old" ? "secondary" : "ghost"}
            onClick={() => setInspector({ ...inspector, side: "old" })}
          >
            Old
          </Button>
          <Button
            type="button"
            size="sm"
            variant={inspector.side === "new" ? "secondary" : "ghost"}
            onClick={() => setInspector({ ...inspector, side: "new" })}
          >
            New
          </Button>
        </div>
      </div>
      {error !== null ? <p className="px-8 text-warn">{error}</p> : null}
      {loading && error === null ? (
        <div className="px-8 pt-2">
          <WaitMark
            label={inspector.mode === "file" ? waitCopy.file : waitCopy.blame}
          />
        </div>
      ) : null}
      {inspector.mode === "file" && error === null && !loading ? (
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-8">
          <PierreFile path={inspector.path} contents={content} wrap={wrap} />
        </div>
      ) : null}
      {inspector.mode === "blame" && error === null && !loading && blame !== null ? (
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-8">
          <PierreFile path={inspector.path} contents={blameContents} wrap={wrap} annotations={blameAnnotations} />
        </div>
      ) : null}
    </div>
  );
}
