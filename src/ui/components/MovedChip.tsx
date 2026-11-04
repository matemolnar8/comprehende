import { ArrowRightLeftIcon } from "lucide-react";
import type { MovedLabel } from "../lib/relocation.ts";

/** Sits just above a moved block, whose lines carry the slate moved wash. */
export function MovedChip(props: { label: MovedLabel }) {
  const { text, path } = props.label;
  return (
    <p className="flex items-center gap-1.5 border-l-2 border-[var(--moved)] bg-[var(--diff-canvas)] px-2.5 py-1 font-sans text-xs text-muted-foreground">
      <ArrowRightLeftIcon aria-hidden className="size-3.5 shrink-0 text-[var(--moved)]" />
      <span className="min-w-0 truncate">
        {text}
        {path !== undefined ? (
          <>
            {" "}
            <span className="font-mono text-foreground">{path}</span>
          </>
        ) : null}
      </span>
    </p>
  );
}
