import { ChevronRightIcon } from "lucide-react";
import type { StoryHop, StoryNav as StoryNavModel } from "../lib/story-nav.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { Kbd } from "./Kbd.tsx";
import { Kicker } from "./Kicker.tsx";

export function StoryNav(props: { nav: StoryNavModel; onOpenGroup: (id: string) => void }) {
  const previous = props.nav.previousPart;
  const next = props.nav.nextPart;
  if (previous === undefined && next === undefined) {
    return null;
  }
  const label = props.nav.partTitle !== undefined ? `Part ${props.nav.partTitle}` : "This story";
  return (
    <nav
      aria-label={label}
      className="mt-6 flex items-start justify-between gap-3 border-t border-border pt-4"
    >
      <HopButton hop={previous} side="previous" onOpen={props.onOpenGroup} />
      <HopButton hop={next} side="next" onOpen={props.onOpenGroup} />
    </nav>
  );
}

function HopButton(props: {
  hop: StoryHop | undefined;
  side: "previous" | "next";
  onOpen: (id: string) => void;
}) {
  const { hop, side, onOpen } = props;
  if (hop === undefined) {
    return <span />;
  }
  const name = hop.partTitle ?? hop.title;
  const kicker = side === "next" ? "Next part" : "Previous part";
  const shortcut = side === "next" ? "}" : "{";
  const direction = side === "next" ? "Next" : "Previous";
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={`${direction} part: ${name}`}
      className={cn(
        "h-auto min-w-0 max-w-[calc(50%-0.375rem)] flex-col gap-1 px-2 py-2 font-normal whitespace-normal",
        side === "previous" ? "items-start" : "items-end",
      )}
      onClick={() => onOpen(hop.id)}
    >
      <Kicker className="mb-0">{kicker}</Kicker>
      <span className="flex min-w-0 items-center gap-1 text-foreground">
        {side === "previous" ? <ChevronRightIcon className="size-4 shrink-0 rotate-180" /> : null}
        <span className="min-w-0 text-left leading-snug">{name}</span>
        {side === "next" ? <ChevronRightIcon className="size-4 shrink-0" /> : null}
        <Kbd className="max-sm:hidden">{shortcut}</Kbd>
      </span>
    </Button>
  );
}
