import { useId } from "react";
import type { Attention, AttentionKind } from "../../schema/types.ts";
import { cn } from "@/lib/utils.ts";
import { attentionKey } from "../lib/claims.ts";
import { useClaimFocus } from "../lib/use-claim-focus.ts";
import { InlineMd } from "./InlineMd.tsx";
import { briefProse } from "./Kicker.tsx";

export const ATTENTION_TITLES: Record<AttentionKind, string> = {
  contract: "A contract to check",
  tradeoff: "A tradeoff to weigh",
  product: "A product call",
  risk: "A risk to judge",
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
  return (
    <section
      role="note"
      aria-labelledby={headingId}
      data-claim={key}
      aria-current={focusKey === key ? "location" : undefined}
      className={cn(
        "mb-4 max-w-[calc(68ch+1.5rem)] rounded-md border border-warn/30 bg-warn/[0.06] px-3 py-2.5 last:mb-0",
        focusKey === key && "ring-2 ring-warn/40",
      )}
    >
      <h2
        id={headingId}
        className="mb-1 flex items-center gap-2 font-mono text-[11px] font-normal leading-[1.45] text-warn"
      >
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
        {ATTENTION_TITLES[attention.kind]}
      </h2>
      <p className={briefProse}>
        <InlineMd text={attention.note} />
      </p>
    </section>
  );
}

export function LookClosely(props: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[11px] leading-snug text-warn",
        props.className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
      Look closely
    </span>
  );
}
