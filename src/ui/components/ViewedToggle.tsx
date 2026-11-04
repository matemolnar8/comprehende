import { CheckIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import { Kbd } from "./Kbd.tsx";

/** The one Viewed control per file. The word stays at every width, so touch readers know what it does. */
export function ViewedToggle(props: { viewed: boolean; onChange: (viewed: boolean) => void }) {
  const { viewed, onChange } = props;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          role="checkbox"
          aria-checked={viewed}
          onClick={() => onChange(!viewed)}
          className={cn(
            "-my-1 flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50",
            viewed ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-[var(--motion)]",
              viewed ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card",
            )}
          >
            {viewed ? <CheckIcon className="size-3" strokeWidth={3} /> : null}
          </span>
          Viewed
        </button>
      </TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        {viewed ? "Mark as not viewed" : "Mark as viewed"}
        <Kbd>v</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
