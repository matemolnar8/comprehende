import type { CSSProperties } from "react";
import { CheckIcon } from "lucide-react";
import { readingStatus } from "../lib/reading-progress.ts";
import { cn } from "@/lib/utils.ts";

export function ReadingMark(props: {
  paths: readonly string[];
  viewed: ReadonlySet<string>;
  /** Use the noun when the mark stands alone. Rows stay short and stay empty until the reader starts. */
  noun?: boolean;
  className?: string;
}) {
  const status = readingStatus(props.paths, props.viewed);
  if (status === null) {
    return null;
  }
  const done = status.left === 0;
  if (props.noun !== true && status.viewed === 0) {
    return null;
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground",
        props.className,
      )}
      title={props.noun === true ? undefined : status.filesLabel}
    >
      {done ? <CheckIcon aria-hidden className="size-3.5 text-add" /> : null}
      {props.noun === true ? (
        status.filesLabel
      ) : done ? (
        <span className="sr-only">{status.label}</span>
      ) : (
        status.label
      )}
    </span>
  );
}

/** A thin meter for files viewed. The text next to it, or its parent's label, says what it counts. */
export function ProgressBar(props: { value: number; done: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("relative block h-1 overflow-hidden rounded-full bg-muted", props.className)}
      style={{ "--progress": `${Math.min(1, Math.max(0, props.value)) * 100}%` } as CSSProperties}
    >
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-(--progress) rounded-full transition-[width] duration-[var(--motion)] ease-[var(--motion-ease)]",
          props.done ? "bg-add" : "bg-primary",
        )}
      />
    </span>
  );
}
