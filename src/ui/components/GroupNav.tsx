import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import {
  neighborSelection,
  selectionNavLabel,
  type Selection,
} from "../lib/selection.ts";
import { Kbd } from "./Kbd.tsx";

export function GroupNav(props: {
  meta: ReviewMeta;
  selection: Selection | null;
  onSelect: (selection: Selection) => void;
  variant: "bar" | "icons";
  className?: string;
}) {
  if (props.meta.groups.length === 0) {
    return null;
  }
  const previous = neighborSelection(props.meta, props.selection, -1);
  const next = neighborSelection(props.meta, props.selection, 1);
  return (
    <nav
      aria-label="Previous and next group"
      className={cn(
        props.variant === "bar"
          ? "flex shrink-0 items-center gap-2 border-t border-border bg-card px-3 py-2 min-[800px]:px-5"
          : "flex shrink-0 items-center gap-0.5",
        props.className,
      )}
    >
      <NavControl
        direction="prev"
        target={previous}
        meta={props.meta}
        onSelect={props.onSelect}
        variant={props.variant}
      />
      <NavControl
        direction="next"
        target={next}
        meta={props.meta}
        onSelect={props.onSelect}
        variant={props.variant}
        className={props.variant === "bar" ? "ml-auto" : undefined}
      />
    </nav>
  );
}

function NavControl(props: {
  direction: "prev" | "next";
  target: Selection | undefined;
  meta: ReviewMeta;
  onSelect: (selection: Selection) => void;
  variant: "bar" | "icons";
  className?: string;
}) {
  const disabled = props.target === undefined;
  const name = props.direction === "prev" ? "Previous" : "Next";
  const shortcut = props.direction === "prev" ? "[" : "]";
  const destination = props.target !== undefined ? selectionNavLabel(props.meta, props.target) : undefined;
  const label = destination !== undefined ? `${name}: ${destination}` : name;
  const chevron =
    props.direction === "prev" ? <ChevronLeftIcon className="size-3.5" /> : <ChevronRightIcon className="size-3.5" />;
  const button = (
    <Button
      type="button"
      size={props.variant === "icons" ? "icon-sm" : "sm"}
      variant={props.variant === "icons" ? "ghost" : "outline"}
      disabled={disabled}
      aria-label={label}
      data-group-nav={props.direction}
      className={cn(props.variant === "bar" && "min-w-0 max-w-[min(100%,20rem)]", props.className)}
      onClick={() => {
        if (props.target !== undefined) {
          props.onSelect(props.target);
        }
      }}
    >
      {props.direction === "prev" ? chevron : null}
      {props.variant === "bar" ? (
        <span className="min-w-0 truncate">{destination ?? name}</span>
      ) : null}
      {props.variant === "bar" ? <Kbd className="max-[799px]:hidden">{shortcut}</Kbd> : null}
      {props.direction === "next" ? chevron : null}
    </Button>
  );
  if (disabled) {
    return button;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
