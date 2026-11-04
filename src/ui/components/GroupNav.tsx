import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import { padIndex } from "../../schema/types.ts";
import { groupOrderIndex, groupParts } from "../lib/parts.ts";
import {
  neighborSelection,
  selectionCaption,
  selectionNavLabel,
  type Selection,
} from "../lib/selection.ts";
import { HintWithKey } from "./Kbd.tsx";

export function GroupNav(props: {
  meta: ReviewMeta;
  selection: Selection | null;
  onSelect: (selection: Selection) => void;
  /** Show where the reader is between the arrows, such as "Group 02 of 07". */
  position?: boolean;
  className?: string;
  buttonClassName?: string;
}) {
  if (props.meta.groups.length === 0) {
    return null;
  }
  const previous = neighborSelection(props.meta, props.selection, -1);
  const next = neighborSelection(props.meta, props.selection, 1);
  return (
    <nav
      aria-label="Previous and next group"
      className={cn("flex shrink-0 items-center gap-0.5", props.className)}
    >
      <NavControl
        direction="prev"
        target={previous}
        meta={props.meta}
        onSelect={props.onSelect}
        className={props.buttonClassName}
      />
      {props.position === true ? (
        <GroupPosition
          meta={props.meta}
          selection={props.selection}
          className="min-w-[7.5rem] px-1 text-center"
        />
      ) : null}
      <NavControl
        direction="next"
        target={next}
        meta={props.meta}
        onSelect={props.onSelect}
        className={props.buttonClassName}
      />
    </nav>
  );
}

/** The title of the page the next arrow opens. */
export function NextTitle(props: { meta: ReviewMeta; selection: Selection | null }) {
  const next = neighborSelection(props.meta, props.selection, 1);
  if (next === undefined) {
    return null;
  }
  return (
    <span
      aria-hidden
      className="-ml-2 hidden max-w-56 truncate text-xs text-muted-foreground min-[1280px]:block"
    >
      {selectionCaption(props.meta, next).title}
    </span>
  );
}

/** "Group 02 of 07" on a group page, else the page name. The page title carries the group name. */
export function GroupPosition(props: {
  meta: ReviewMeta;
  selection: Selection | null;
  className?: string;
}) {
  if (props.selection?.kind === "group") {
    const index = groupOrderIndex(groupParts(props.meta.groups), props.selection.id);
    if (index > 0) {
      return (
        <span
          className={cn(
            "text-[13px] whitespace-nowrap text-muted-foreground tabular-nums",
            props.className,
          )}
        >
          Group <span className="font-medium text-foreground">{padIndex(index)}</span> of{" "}
          {padIndex(props.meta.groups.length)}
        </span>
      );
    }
  }
  return (
    <span
      className={cn("text-[13px] font-medium whitespace-nowrap text-foreground", props.className)}
    >
      {selectionCaption(props.meta, props.selection).title}
    </span>
  );
}

function NavControl(props: {
  direction: "prev" | "next";
  target: Selection | undefined;
  meta: ReviewMeta;
  onSelect: (selection: Selection) => void;
  className?: string;
}) {
  const disabled = props.target === undefined;
  const name = props.direction === "prev" ? "Previous" : "Next";
  const shortcut = props.direction === "prev" ? "[" : "]";
  const destination =
    props.target !== undefined ? selectionNavLabel(props.meta, props.target) : undefined;
  const hint = destination !== undefined ? `${name}: ${destination}` : name;
  const button = (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      disabled={disabled}
      aria-label={hint}
      aria-keyshortcuts={shortcut}
      className={cn("text-muted-foreground hover:text-foreground", props.className)}
      data-group-nav={props.direction}
      onClick={() => {
        if (props.target !== undefined) {
          props.onSelect(props.target);
        }
      }}
    >
      {props.direction === "prev" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </Button>
  );
  if (disabled) {
    return button;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>
        <HintWithKey text={hint} shortcut={shortcut} />
      </TooltipContent>
    </Tooltip>
  );
}
