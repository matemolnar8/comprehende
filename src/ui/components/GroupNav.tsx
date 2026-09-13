import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { neighborSelection, selectionNavLabel, type Selection } from "../lib/selection.ts";

export function GroupNav(props: {
  meta: ReviewMeta;
  selection: Selection | null;
  onSelect: (selection: Selection) => void;
  className?: string;
}) {
  if (props.meta.groups.length === 0) {
    return null;
  }
  const previous = neighborSelection(props.meta, props.selection, -1);
  const next = neighborSelection(props.meta, props.selection, 1);
  return (
    <nav aria-label="Previous and next group" className={props.className ?? "flex shrink-0 items-center gap-0.5"}>
      <NavControl direction="prev" target={previous} meta={props.meta} onSelect={props.onSelect} />
      <NavControl direction="next" target={next} meta={props.meta} onSelect={props.onSelect} />
    </nav>
  );
}

function NavControl(props: {
  direction: "prev" | "next";
  target: Selection | undefined;
  meta: ReviewMeta;
  onSelect: (selection: Selection) => void;
}) {
  const disabled = props.target === undefined;
  const name = props.direction === "prev" ? "Previous" : "Next";
  const shortcut = props.direction === "prev" ? "[" : "]";
  const destination = props.target !== undefined ? selectionNavLabel(props.meta, props.target) : undefined;
  const hint = destination !== undefined ? `${name}: ${destination} ${shortcut}` : `${name} ${shortcut}`;
  const button = (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      disabled={disabled}
      aria-label={hint}
      data-group-nav={props.direction}
      onClick={() => {
        if (props.target !== undefined) {
          props.onSelect(props.target);
        }
      }}
    >
      {props.direction === "prev" ? <ChevronLeftIcon className="size-3.5" /> : <ChevronRightIcon className="size-3.5" />}
    </Button>
  );
  if (disabled) {
    return button;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}
