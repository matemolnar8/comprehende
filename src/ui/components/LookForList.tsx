import { cn } from "@/lib/utils.ts";
import { lookForKey } from "../lib/claims.ts";
import { useClaimFocus } from "../lib/use-claim-focus.ts";
import { InlineMd } from "./InlineMd.tsx";
import { BriefField, briefProse, briefRows } from "./Kicker.tsx";

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
    <BriefField kicker="Look for" className={className}>
      <ol className={briefRows}>
        {items.map((text, index) => {
          const key = lookForKey(index);
          const focused = key === focusKey;
          return (
            <li
              key={key}
              data-claim={key}
              aria-current={focused ? "location" : undefined}
              className={cn("-mx-2 rounded-sm px-2 py-2", focused && "bg-accent")}
            >
              <div className={briefProse}>
                <InlineMd text={text} />
              </div>
            </li>
          );
        })}
      </ol>
    </BriefField>
  );
}
