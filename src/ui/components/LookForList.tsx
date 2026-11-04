import { cn } from "@/lib/utils.ts";
import { lookForKey } from "../lib/claims.ts";
import { useClaimFocus } from "../lib/use-claim-focus.ts";
import { InlineMd } from "./InlineMd.tsx";
import { BriefField, briefProse } from "./Kicker.tsx";

/** Document lookFor: source verdicts and manual steps. */
export function LookForList(props: {
  items: readonly string[];
  focusKey?: string;
  className?: string;
}) {
  const { items, focusKey, className } = props;
  useClaimFocus(focusKey);
  if (items.length === 0) {
    return null;
  }
  return (
    <BriefField kicker="Things to check" className={className}>
      <ul className="m-0 list-none space-y-3 p-0">
        {items.map((text, index) => {
          const key = lookForKey(index);
          const focused = key === focusKey;
          return (
            <li
              key={key}
              data-claim={key}
              aria-current={focused ? "location" : undefined}
              className={cn(
                "flex gap-2.5",
                focused && "rounded-sm bg-accent shadow-[0_0_0_6px_var(--accent)]",
              )}
            >
              <span
                aria-hidden
                className="mt-[calc(0.75em-2px)] size-1 shrink-0 rounded-full bg-muted-foreground"
              />
              <div className={cn("min-w-0", briefProse)}>
                <InlineMd text={text} />
              </div>
            </li>
          );
        })}
      </ul>
    </BriefField>
  );
}
