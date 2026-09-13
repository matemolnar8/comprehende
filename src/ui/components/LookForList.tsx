import { useEffect, useId } from "react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { lookForOwnerLabel, type LookForClaim, type LookForTag } from "../lib/look-for.ts";
import { InlineMd } from "./InlineMd.tsx";
import { Kicker } from "./Kicker.tsx";

export function LookForList(props: {
  claims: readonly LookForClaim[];
  showOwner?: boolean;
  focusKey?: string;
  onOpen?: (claim: LookForClaim) => void;
  className?: string;
}) {
  const { claims, showOwner = false, focusKey, onOpen, className } = props;
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

  return (
    <section className={cn("mb-5", className)} aria-labelledby={headingId}>
      <Kicker id={headingId} className="mb-2">
        Look for
      </Kicker>
      <ol className="m-0 list-none divide-y divide-border border-y border-border p-0">
        {claims.map((claim) => {
          const focused = claim.key === focusKey;
          return (
            <li
              key={claim.key}
              data-lookfor={claim.key}
              aria-current={focused ? "location" : undefined}
              className={cn("-mx-2 rounded-sm px-2 py-3", focused && "bg-accent")}
            >
              {showOwner ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="mb-1 flex h-auto w-full min-w-0 items-baseline justify-between gap-3 p-0 font-normal whitespace-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
                  onClick={() => onOpen?.(claim)}
                  aria-label={`Open ${lookForOwnerLabel(claim.owner)}`}
                >
                  <span className="truncate font-mono text-[11px] tracking-wide">{lookForOwnerLabel(claim.owner)}</span>
                  <LookForTag tag={claim.tag} />
                </Button>
              ) : (
                <LookForTag tag={claim.tag} className="mb-1" />
              )}
              <div className="leading-relaxed text-pretty text-foreground">
                <InlineMd text={claim.body} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function LookForTag(props: { tag: LookForTag | undefined; className?: string }) {
  if (props.tag === undefined) {
    return null;
  }
  const warn = props.tag === "Breaking" || props.tag === "Race";
  return (
    <span
      className={cn(
        "block font-mono text-[11px] tracking-[0.14em] uppercase",
        warn ? "text-warn" : "text-muted-foreground",
        props.className,
      )}
    >
      {props.tag}
    </span>
  );
}
