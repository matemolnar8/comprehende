import type { MouseEvent, ReactNode } from "react";
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
    "cursor-pointer font-medium text-primary underline-offset-2 hover:underline",
    stale && "text-warn",
  );

  const onClick = (event: MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (jump) {
      onCite?.(source);
      return;
    }
    if (source.url !== undefined) {
      window.open(source.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span role="link" tabIndex={0} className={className} onClick={onClick}>
          <Icon aria-hidden className="mr-[0.18em] inline size-[0.8em] align-[-0.12em]" />
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm space-y-1 bg-popover px-3 py-2 text-popover-foreground">
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
          {SOURCE_KIND_LABEL[source.kind]}
        </p>
        <p className="font-medium text-foreground">{source.label}</p>
        {source.gist !== undefined ? <p className="text-muted-foreground">{source.gist}</p> : null}
        {stale ? <p className="text-warn">This source id is missing from the review document.</p> : null}
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
