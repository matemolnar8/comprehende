import { addedSymbols, hunkRangeLabel } from "../../schema/hunk-meta.ts";
import { PierreFileDiff } from "../PierreDiff.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import type { LayerFile } from "../lib/layer-files.ts";

export function HunkView(props: {
  file: LayerFile;
  active: boolean;
  index: number;
  split: boolean;
  splitRatio: number;
  wrap: boolean;
  onSplitRatio: (ratio: number) => void;
  onOpen: (path: string) => void;
}) {
  const { file, active, index, split, splitRatio, wrap, onSplitRatio, onOpen } = props;
  const first = file.hunks[0];
  const symbols = addedSymbols(
    file.hunks.flatMap((hunk) => hunk.lines.filter((line) => line.kind === "add").map((line) => line.text)),
  );
  const label = file.oldPath !== undefined ? `${file.oldPath} → ${file.path}` : file.path;
  return (
    <article
      className={cn("overflow-hidden rounded-lg border bg-card", active ? "border-primary" : "border-border")}
      data-hunk={index}
    >
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-card px-4 py-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="link" className="h-auto p-0 font-mono text-sm" onClick={() => onOpen(file.path)}>
              {label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open file</TooltipContent>
        </Tooltip>
        <code className="font-mono text-xs text-muted-foreground">
          {file.hunkCount === 1 && first !== undefined ? hunkRangeLabel(first.header) : `${file.hunkCount} hunks`}
        </code>
        <span className="ml-auto font-mono text-[11px] tabular-nums">
          <span className="text-del">−{file.removed}</span> <span className="text-add">+{file.added}</span>
        </span>
        {symbols.length > 0
          ? symbols.map((name) => (
              <Badge key={name} variant="outline" className="font-mono font-normal">
                {name}
              </Badge>
            ))
          : null}
      </header>
      <PierreFileDiff
        patch={file.patch}
        split={split}
        wrap={wrap}
        splitRatio={splitRatio}
        onSplitRatio={onSplitRatio}
      />
    </article>
  );
}
