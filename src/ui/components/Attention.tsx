import { useId } from "react";
import {
  FileSignatureIcon,
  LightbulbIcon,
  ScaleIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react";
import type { Attention, AttentionKind } from "../../schema/types.ts";
import { cn } from "@/lib/utils.ts";
import { attentionKey } from "../lib/claims.ts";
import { useClaimFocus } from "../lib/use-claim-focus.ts";
import { InlineMd } from "./InlineMd.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip.tsx";
import { blockGap, briefProse, labelText } from "./Kicker.tsx";

export const ATTENTION_TITLES: Record<AttentionKind, string> = {
  contract: "A contract to check",
  tradeoff: "A tradeoff to weigh",
  product: "A product call",
  risk: "A risk to judge",
};

const ATTENTION_SHORT: Record<AttentionKind, string> = {
  contract: "Contract",
  tradeoff: "Tradeoff",
  product: "Product call",
  risk: "Risk",
};

const ATTENTION_ICONS: Record<AttentionKind, LucideIcon> = {
  contract: FileSignatureIcon,
  tradeoff: ScaleIcon,
  product: LightbulbIcon,
  risk: TriangleAlertIcon,
};

export function AttentionAlert(props: {
  groupId: string;
  attention: Attention;
  focusKey?: string;
}) {
  const { groupId, attention, focusKey } = props;
  const key = attentionKey(groupId);
  const headingId = useId();
  useClaimFocus(focusKey === key ? key : undefined);
  const Icon = ATTENTION_ICONS[attention.kind];
  return (
    <section
      role="note"
      aria-labelledby={headingId}
      data-claim={key}
      aria-current={focusKey === key ? "location" : undefined}
      className={cn(
        "rounded-md border border-warn/30 bg-warn/[0.06] px-3 py-2.5",
        blockGap,
        focusKey === key && "ring-2 ring-warn/40",
      )}
    >
      <h2 id={headingId} className={cn("mb-1 flex items-center gap-1.5", labelText, "text-warn")}>
        <Icon aria-hidden className="size-3.5 shrink-0" />
        {ATTENTION_TITLES[attention.kind]}
      </h2>
      <p className={briefProse}>
        <InlineMd text={attention.note} />
      </p>
    </section>
  );
}

/** The attention glyph and its kind as a word: on Overview rows and in the sidebar. */
export function AttentionMark(props: { kind: AttentionKind; side?: "top" | "right" }) {
  const title = ATTENTION_TITLES[props.kind];
  const Icon = ATTENTION_ICONS[props.kind];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          aria-label={title}
          className="flex h-5 shrink-0 items-center gap-1 text-xs font-medium text-warn"
        >
          <Icon aria-hidden className="size-3.5" />
          {ATTENTION_SHORT[props.kind]}
        </span>
      </TooltipTrigger>
      <TooltipContent side={props.side}>{title}</TooltipContent>
    </Tooltip>
  );
}
