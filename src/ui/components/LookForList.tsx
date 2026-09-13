import { useEffect, useId } from "react";
import { cn } from "@/lib/utils.ts";
import { type LookForClaim, type LookForTag } from "../lib/look-for.ts";
import { InlineMd } from "./InlineMd.tsx";
import { BriefField, briefProse, briefRows } from "./Kicker.tsx";

export function LookForList(props: {
  claims: readonly LookForClaim[];
  focusKey?: string;
  className?: string;
}) {
  const { claims, focusKey, className } = props;
  const headingId = useId();
  useEffect(() => {
    if (focusKey === undefined) {
      return;
    }
    const el = document.querySelector(`[data-lookfor="${CSS.escape(focusKey)}"]`);
    if (!(el instanceof HTMLElement)) {
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduce ? "instant" : "smooth" });
  }, [focusKey]);

  if (claims.length === 0) {
    return null;
  }

  const tagged = claims.some((claim) => claim.tag !== undefined);
  return (
    <BriefField kicker="Look for" kickerId={headingId} className={className}>
      <ol className={briefRows}>
        {claims.map((claim) => {
          const focused = claim.key === focusKey;
          return (
            <li
              key={claim.key}
              data-lookfor={claim.key}
              aria-current={focused ? "location" : undefined}
              className={cn(
                "-mx-2 rounded-sm px-2 py-2",
                tagged && "grid grid-cols-[4.75rem_minmax(0,1fr)] items-baseline gap-x-2",
                focused && "bg-accent",
              )}
            >
              {tagged ? <LookForTag tag={claim.tag} /> : null}
              <div className={briefProse}>
                <InlineMd text={claim.body} />
              </div>
            </li>
          );
        })}
      </ol>
    </BriefField>
  );
}

function LookForTag(props: { tag: LookForTag | undefined; className?: string }) {
  if (props.tag === undefined) {
    return <span className={props.className} />;
  }
  const warn = props.tag === "Breaking" || props.tag === "Race";
  return (
    <span
      className={cn(
        "font-mono text-[11px] leading-[1.45] tracking-[0.14em] uppercase",
        warn ? "text-warn" : "text-muted-foreground",
        props.className,
      )}
    >
      {props.tag}
    </span>
  );
}
