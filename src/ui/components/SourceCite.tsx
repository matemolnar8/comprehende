import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import type { Source } from "../../schema/types.ts";
import { ArrowUpRightIcon } from "lucide-react";
import { cn } from "../lib/utils.ts";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip.tsx";
import { SOURCE_KIND_ICON, SOURCE_KIND_LABEL } from "../lib/source-display.ts";

export function SourceCite(props: {
  source: Source;
  stale?: boolean;
  onCite?: (source: Source) => void;
  children: ReactNode;
}) {
  const { source, stale = false, onCite, children } = props;
  const Icon = SOURCE_KIND_ICON[source.kind];
  const jump = source.path !== undefined && source.side !== undefined && source.line !== undefined;
  const className = cn(
    "cursor-pointer font-medium whitespace-nowrap text-primary underline-offset-2 hover:underline",
    stale && "text-warn",
  );

  const { url } = source;
  const cite = jump
    ? onCite === undefined
      ? undefined
      : () => onCite(source)
    : url === undefined
      ? undefined
      : () => window.open(url, "_blank", "noopener,noreferrer");

  // Cites sit inside group links: a nested <a> or <button> is invalid, so this stays a span.
  const activate = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    cite?.();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role={cite === undefined ? undefined : "link"}
          tabIndex={0}
          className={className}
          onClick={activate}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              activate(event);
            }
          }}
        >
          <Icon aria-hidden className="mr-0.5 inline-block size-3.5 align-[-0.15em]" />
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm space-y-1 border border-border bg-popover px-3 py-2 text-popover-foreground shadow-card">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon aria-hidden className="size-3.5" />
          {SOURCE_KIND_LABEL[source.kind]}
        </p>
        <p className="font-medium text-foreground">{source.label}</p>
        {source.gist !== undefined ? <p className="text-muted-foreground">{source.gist}</p> : null}
        {stale ? (
          <p className="text-warn">This source id is missing from the review document.</p>
        ) : null}
        {source.url !== undefined ? (
          <a
            className="inline-flex items-center gap-0.5 text-primary hover:underline"
            href={source.url}
            target="_blank"
            rel="noreferrer"
          >
            Open
            <ArrowUpRightIcon className="size-3" />
          </a>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}

export function StaleCite(props: { children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-warn">{props.children}</span>
      </TooltipTrigger>
      <TooltipContent>Unknown source. The id is not in the review document.</TooltipContent>
    </Tooltip>
  );
}
