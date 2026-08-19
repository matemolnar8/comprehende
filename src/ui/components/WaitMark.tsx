import { WAIT_REVEAL_MS } from "../lib/wait.ts";
import { useDelayedFlag } from "../lib/use-delayed-flag.ts";
import { cn } from "@/lib/utils.ts";

export function WaitMark(props: {
  label: string;
  layout?: "page" | "well" | "inline";
  delayMs?: number;
  className?: string;
}) {
  const layout = props.layout ?? "well";
  const delayMs = props.delayMs ?? (layout === "page" ? 0 : WAIT_REVEAL_MS);
  const visible = useDelayedFlag(true, delayMs);
  if (!visible) {
    return null;
  }
  return (
    <div
      className={cn("wait-mark", `wait-mark-${layout}`, props.className)}
      role={layout === "inline" ? undefined : "status"}
      aria-live={layout === "inline" ? undefined : "polite"}
    >
      <span className="wait-gutter" aria-hidden>
        <span className="wait-gutter-rail" data-kind="del">
          <span className="wait-gutter-walker" />
        </span>
        <span className="wait-gutter-rail" data-kind="add">
          <span className="wait-gutter-walker" />
        </span>
      </span>
      {layout === "inline" ? <span className="sr-only">{props.label}</span> : <p className="wait-mark-label">{props.label}</p>}
    </div>
  );
}
