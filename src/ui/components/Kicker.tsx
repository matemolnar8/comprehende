import { useId, type ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";

export const briefProse = "m-0 leading-[1.5] text-pretty text-foreground";
export const briefRows = "m-0 list-none divide-y divide-border p-0";
/** The reading column when the page stacks: brief, Overview, Changes. Diff cards stay full width. */
export const contentColumn = "max-w-[38rem]";

/*
 * A wide stage splits in two: a sticky context column (the brief, then the files) beside the main
 * column (diff cards, or the Overview stories). The named container `review` sits on the page root;
 * `splitWide` and `splitStacked` show a part in only one of the two layouts.
 * Sticky offsets count from the stage content box, so `top-0` already sits below the stage padding.
 * `7rem` is the header (h-14) plus the stage padding above and below (py-7).
 */
export const splitRoot = "@container/review";
/** The height cap of the sticky column. A flex column inside it with the same cap gives the free height to one scroll area. */
export const splitAsideHeight = "@min-[60rem]/review:max-h-[calc(100dvh-7rem)]";
export const splitRow =
  "flex flex-col @min-[60rem]/review:flex-row @min-[60rem]/review:items-start @min-[60rem]/review:gap-7 @min-[80rem]/review:gap-10";
const splitAsideWidth = {
  group: "@min-[60rem]/review:w-[21rem] @min-[80rem]/review:w-[24rem]",
  /** The Overview has no diff column, so its brief takes more room. */
  overview: "@min-[60rem]/review:w-[27rem]",
};
export function splitAside(width: keyof typeof splitAsideWidth = "group") {
  return cn(
    contentColumn,
    splitAsideHeight,
    splitAsideWidth[width],
    "@min-[60rem]/review:sticky @min-[60rem]/review:top-0 @min-[60rem]/review:max-w-none @min-[60rem]/review:shrink-0 @min-[60rem]/review:overflow-y-auto @min-[60rem]/review:overscroll-contain @min-[60rem]/review:pr-1 @min-[60rem]/review:[scrollbar-width:thin]",
  );
}
export const splitMain = "min-w-0 flex-1";
export const splitWide = "hidden @min-[60rem]/review:flex";
export const splitStacked = "@min-[60rem]/review:hidden";

/**
 * The edge fades of a scroll area. `useScrollEdges` sets the attributes: `data-scrolled` fades the top, `data-more` the bottom.
 * An edge fades to 35%, not to 0, so a row there stays readable.
 * The bottom padding is the fade plus 0.5rem, so the last row never sits in the fade.
 */
export const scrollFade =
  "data-more:[mask-image:linear-gradient(to_bottom,black_calc(100%-1.25rem),rgb(0_0_0/0.5))] data-scrolled:[mask-image:linear-gradient(to_bottom,rgb(0_0_0/0.5),black_1.5rem)] data-scrolled:data-more:[mask-image:linear-gradient(to_bottom,rgb(0_0_0/0.5),black_1.5rem,black_calc(100%-1.25rem),rgb(0_0_0/0.5))] pb-7";
/** `scrollFade` without the top fade, for a list whose sticky headings mark the top edge. */
export const scrollFadeBottom =
  "data-more:[mask-image:linear-gradient(to_bottom,black_calc(100%-1.25rem),rgb(0_0_0/0.5))] pb-7";
/** A split aside part scrolls only when wide. Stacked, it drops the fade and its padding. */
export const stackedNoFade = "@max-[60rem]/review:pb-0 @max-[60rem]/review:[mask-image:none]";

/** Section labels: Why, What, Questions, Sources, Needed by, Things to check. */
export const labelText =
  "text-xs leading-[1.45] font-semibold tracking-[0.02em] text-foreground/70";
/** Space between brief blocks. A label sits closer to its content than to the block above. */
export const blockGap = "mb-5 last:mb-0";
export const briefRail = "w-[3px] flex-none rounded-px";
export const metaText = "text-xs leading-[1.45] text-muted-foreground";

export function Kicker(props: { children: ReactNode; id?: string; className?: string }) {
  return (
    <p
      id={props.id}
      className={cn("m-0 flex items-center gap-1.5 font-medium", metaText, props.className)}
    >
      {props.children}
    </p>
  );
}

export function BriefField(props: {
  kicker: string;
  kickerId?: string;
  children: ReactNode;
  className?: string;
}) {
  const generatedId = useId();
  const id = props.kickerId ?? generatedId;
  return (
    <section className={cn(blockGap, props.className)} aria-labelledby={id}>
      <h2 id={id} className={cn("mb-1", labelText)}>
        {props.kicker}
      </h2>
      <div className="min-w-0">{props.children}</div>
    </section>
  );
}

const motion = "duration-[var(--motion)] ease-[var(--motion-ease)]";

/** The toggle of a collapsed brief block, such as Sources. Put it in the block's heading. */
export function DisclosureToggle(props: {
  label: string;
  count: number;
  open: boolean;
  controls: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-1 rounded-sm border-0 bg-transparent p-0 text-left text-inherit outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
        motion,
      )}
      aria-expanded={props.open}
      aria-controls={props.open ? props.controls : undefined}
      onClick={props.onToggle}
    >
      <ChevronDownIcon
        aria-hidden
        className={cn(
          "size-3.5 shrink-0 transition-transform",
          motion,
          !props.open && "-rotate-90",
        )}
      />
      <span>{props.label}</span>
      <Badge variant="neutral" size="sm" className="ml-0.5 tabular-nums">
        {props.count}
      </Badge>
    </button>
  );
}
