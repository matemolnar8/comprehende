import { useEffect, useId, useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import {
  lookForBuckets,
  lookForOwnerLabel,
  selectionForLookFor,
  type LookForClaim,
  type LookForTag,
} from "../lib/look-for.ts";
import { HashLink } from "./HashLink.tsx";
import { InlineMd } from "./InlineMd.tsx";
import { BriefField, briefProse, briefRows } from "./Kicker.tsx";
import styles from "./LookForList.module.css";

const indexRowClass =
  "-mx-2 flex w-[calc(100%+1rem)] min-w-0 items-baseline gap-2 rounded-sm px-2 py-1 hover:bg-accent";

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

  const tagged = claims.some((claim) => claim.tag !== undefined);
  const list = (
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
  );

  if (!heading) {
    return <div className={className}>{list}</div>;
  }

  return (
    <BriefField kicker="Look for" kickerId={headingId} className={className}>
      {list}
    </BriefField>
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
  const buckets = lookForBuckets(claims);
  const documentBucket = buckets.find((bucket) => bucket.owner.kind === "document");
  const documentFocus = documentBucket?.claims.some((claim) => claim.key === focusKey) ?? false;
  const [documentOpen, setDocumentOpen] = useState(documentFocus);

  useEffect(() => {
    if (documentFocus) {
      setDocumentOpen(true);
    }
  }, [documentFocus]);

  if (buckets.length === 0) {
    return null;
  }

  return (
    <BriefField kicker="Look for" kickerId={headingId} className={className}>
      <ul className={briefRows}>
        {buckets.map((bucket) => {
          const first = bucket.claims[0];
          if (first === undefined) {
            return null;
          }
          if (bucket.owner.kind === "document") {
            return (
              <li key="document">
                <details
                  className={styles.disclosure}
                  open={documentOpen}
                  onToggle={(event) => setDocumentOpen(event.currentTarget.open)}
                >
                  <summary className={cn(styles.summary, indexRowClass, "cursor-pointer")}>
                    <ChevronRightIcon
                      aria-hidden
                      className={cn(styles.chevron, "size-3 shrink-0 translate-y-[0.15em] text-muted-foreground")}
                    />
                    <BucketLabel bucket={bucket} />
                  </summary>
                  <LookForList
                    claims={bucket.claims}
                    heading={false}
                    focusKey={focusKey}
                    className="pl-5"
                  />
                </details>
              </li>
            );
          }
          return (
            <li key={bucket.owner.id}>
              <HashLink
                selection={selectionForLookFor(bucket.owner)}
                onSelect={() => onOpen?.(first)}
                className={indexRowClass}
                ariaLabel={`Open ${lookForOwnerLabel(bucket.owner)}, ${bucket.claims.length} look for`}
              >
                <BucketLabel bucket={bucket} />
              </HashLink>
            </li>
          );
        })}
      </ul>
    </BriefField>
  );
}

function BucketLabel(props: {
  bucket: { owner: LookForClaim["owner"]; claims: readonly LookForClaim[]; tags: readonly LookForTag[] };
}) {
  const { bucket } = props;
  return (
    <>
      <span className="min-w-0 flex-1 truncate text-left text-foreground">{lookForOwnerLabel(bucket.owner)}</span>
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
