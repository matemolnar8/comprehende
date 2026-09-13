import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import {
  lookForBuckets,
  lookForOwnerLabel,
  type LookForClaim,
  type LookForTag,
} from "../lib/look-for.ts";
import { InlineMd } from "./InlineMd.tsx";
import { Kicker } from "./Kicker.tsx";

export function LookForList(props: {
  claims: readonly LookForClaim[];
  heading?: boolean;
  focusKey?: string;
  className?: string;
}) {
  const { claims, heading = true, focusKey, className } = props;
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

  const list = (
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
            <LookForTag tag={claim.tag} className="mb-1 block" />
            <div className="leading-relaxed text-pretty text-foreground">
              <InlineMd text={claim.body} />
            </div>
          </li>
        );
      })}
    </ol>
  );

  if (!heading) {
    return <div className={className}>{list}</div>;
  }

  return (
    <section className={cn("mb-5", className)} aria-labelledby={headingId}>
      <Kicker id={headingId} className="mb-2">
        Look for
      </Kicker>
      {list}
    </section>
  );
}

export function LookForIndex(props: {
  claims: readonly LookForClaim[];
  focusKey?: string;
  onOpen?: (claim: LookForClaim) => void;
  className?: string;
}) {
  const { claims, focusKey, onOpen, className } = props;
  const headingId = useId();
  const documentRef = useRef<HTMLDetailsElement>(null);
  const buckets = lookForBuckets(claims);
  const documentBucket = buckets.find((bucket) => bucket.owner.kind === "document");
  const documentFocus = documentBucket?.claims.some((claim) => claim.key === focusKey) ?? false;

  useEffect(() => {
    if (documentFocus && documentRef.current !== null) {
      documentRef.current.open = true;
    }
  }, [documentFocus]);

  if (buckets.length === 0) {
    return null;
  }

  return (
    <section className={cn("mb-5", className)} aria-labelledby={headingId}>
      <Kicker id={headingId} className="mb-2">
        Look for
      </Kicker>
      <ul className="m-0 list-none divide-y divide-border border-y border-border p-0">
        {buckets.map((bucket) => {
          const first = bucket.claims[0];
          if (first === undefined) {
            return null;
          }
          if (bucket.owner.kind === "document") {
            return (
              <li key="document">
                <details ref={documentRef}>
                  <summary className="flex cursor-pointer items-baseline gap-2 py-1.5">
                    <BucketLabel bucket={bucket} />
                  </summary>
                  <LookForList
                    claims={bucket.claims}
                    heading={false}
                    focusKey={focusKey}
                    className="pb-2"
                  />
                </details>
              </li>
            );
          }
          return (
            <li key={bucket.owner.id}>
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full min-w-0 items-baseline justify-start gap-2 py-1.5 pr-0 pl-0 font-normal whitespace-normal hover:bg-transparent"
                onClick={() => onOpen?.(first)}
                aria-label={`Open ${lookForOwnerLabel(bucket.owner)}, ${bucket.claims.length} look for`}
              >
                <BucketLabel bucket={bucket} />
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function BucketLabel(props: { bucket: { owner: LookForClaim["owner"]; claims: readonly LookForClaim[]; tags: readonly LookForTag[] } }) {
  const { bucket } = props;
  return (
    <>
      <span className="min-w-0 flex-1 truncate text-left font-mono text-[11px] tracking-wide text-foreground">
        {lookForOwnerLabel(bucket.owner)}
      </span>
      <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">{bucket.claims.length}</span>
      {bucket.tags.length > 0 ? (
        <span className="flex shrink-0 gap-2">
          {bucket.tags.map((tag) => (
            <LookForTag key={tag} tag={tag} />
          ))}
        </span>
      ) : null}
    </>
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
        "font-mono text-[11px] tracking-[0.14em] uppercase",
        warn ? "text-warn" : "text-muted-foreground",
        props.className,
      )}
    >
      {props.tag}
    </span>
  );
}
