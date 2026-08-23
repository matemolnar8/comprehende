import { WAIT_REVEAL_MS } from "../lib/wait.ts";
import { useDelayedFlag } from "../lib/use-delayed-flag.ts";
import { cn } from "@/lib/utils.ts";
import styles from "./WaitMark.module.css";

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
  const Tag = layout === "inline" ? "span" : "div";
  const inline = layout === "inline";
  return (
    <Tag
      className={cn(
        "flex items-center gap-3",
        layout === "well" && "px-3 py-5",
        inline && "shrink-0 gap-0",
        props.className,
      )}
      role={inline ? undefined : "status"}
      aria-live={inline ? undefined : "polite"}
    >
      <span className={cn("flex shrink-0 gap-[0.28rem]", inline ? "h-[1.1rem]" : "h-7")} aria-hidden>
        <Rail kind="del" inline={inline} />
        <Rail kind="add" inline={inline} />
      </span>
      {inline ? (
        <span className="sr-only">{props.label}</span>
      ) : (
        <p className="m-0 font-mono text-[11px] tracking-wide text-muted-foreground">{props.label}</p>
      )}
    </Tag>
  );
}

function Rail(props: { kind: "add" | "del"; inline: boolean }) {
  return (
    <span
      className={cn(
        "relative h-full overflow-hidden rounded-[1px]",
        props.inline ? "w-0.5" : "w-[3px]",
        props.kind === "del" ? "bg-del/38" : "bg-add/38",
      )}
    >
      <span
        className={cn(
          "absolute inset-x-0 top-[28%] h-[44%] rounded-[inherit]",
          styles.walker,
          props.kind === "del" ? "bg-del" : "bg-add",
        )}
      />
    </span>
  );
}
