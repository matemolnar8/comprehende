import type { HunkFocus, LetteredNote } from "../lib/focus.ts";
import { InlineMd } from "./InlineMd.tsx";
import { NoteLetter } from "./NotePin.tsx";

export function FocusBar(props: {
  focus: HunkFocus;
  whole: boolean;
  hidden: readonly LetteredNote[];
  onToggle: () => void;
}) {
  const { focus, whole, hidden, onToggle } = props;
  return (
    <div className="border-b border-border bg-primary/[0.04] px-3 py-2">
      {focus.ranges.map((range) => (
        <p
          key={`${range.side}:${range.start}`}
          className="flex items-baseline gap-3 border-l-2 border-primary pl-2.5 text-sm leading-snug text-foreground"
        >
          <span className="min-w-0">
            <InlineMd text={range.caption} />
          </span>
          <span className="ml-auto shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
            {range.side === "old" ? "old " : ""}
            {range.start === range.end
              ? `line ${range.start}`
              : `lines ${range.start}–${range.end}`}
          </span>
        </p>
      ))}
      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 pl-3 font-mono text-[11px] tabular-nums text-muted-foreground">
        {whole ? null : (
          <>
            <span>
              Showing {focus.shown.length} of {focus.total} lines
            </span>
            {hidden.length > 0 ? (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  {hidden.map((note) => (
                    <NoteLetter key={note.letter} letter={note.letter} />
                  ))}
                  <span>{hidden.length === 1 ? "note" : "notes"} in the rest</span>
                </span>
              </>
            ) : null}
            <span aria-hidden>·</span>
          </>
        )}
        <button
          type="button"
          aria-expanded={whole}
          className="rounded-sm text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={onToggle}
        >
          {whole ? "Show focus only" : "Show whole hunk"}
        </button>
      </p>
    </div>
  );
}
