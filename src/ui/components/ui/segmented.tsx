import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";

/** One choice out of a few: Unified or Split, File or Blame, Old or New. */
export function Segmented(props: { label: string; children: ReactNode; size?: "sm" }) {
  return (
    <div
      role="group"
      aria-label={props.label}
      data-size={props.size}
      className="group/segmented inline-flex h-8 shrink-0 items-center gap-0.5 rounded-md bg-muted p-0.5 data-[size=sm]:h-7"
    >
      {props.children}
    </div>
  );
}

export function SegmentedItem(props: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  hint?: ReactNode;
}) {
  const button = (
    <button
      type="button"
      aria-pressed={props.active}
      onClick={props.onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-[5px] px-2.5 text-xs group-data-[size=sm]/segmented:h-6 group-data-[size=sm]/segmented:px-2 font-medium whitespace-nowrap text-foreground/70 transition-[color,background-color,box-shadow] duration-[var(--motion)] ease-[var(--motion-ease)] outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
        props.active && "bg-card text-foreground shadow-xs",
      )}
    >
      {props.children}
    </button>
  );
  if (props.hint === undefined) {
    return button;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{props.hint}</TooltipContent>
    </Tooltip>
  );
}
