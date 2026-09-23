import { readingStatus } from "../lib/reading-progress.ts";
import { cn } from "@/lib/utils.ts";

export function ReadingMark(props: {
  paths: readonly string[];
  viewed: ReadonlySet<string>;
  /** Use the noun when the mark stands alone. Rows stay short. */
  noun?: boolean;
  className?: string;
}) {
  const status = readingStatus(props.paths, props.viewed);
  if (status === null) {
    return null;
  }
  return (
    <span className={cn("mt-px shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground", props.className)}>
      {props.noun === true ? status.filesLabel : status.label}
    </span>
  );
}
