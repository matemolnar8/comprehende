import type { HunkFocus, LetteredNote, LineSpan } from "../lib/focus.ts";
import { ChevronsUpDownIcon } from "lucide-react";
import { InlineMd } from "./InlineMd.tsx";
import { NoteLetter } from "./NotePin.tsx";

/** The agent's reason to read a hunk's focus ranges, above that hunk. */
export function FocusBar(props: { focus: HunkFocus; whole: boolean; onToggle: () => void }) {
  const { focus, whole, onToggle } = props;
  return (
    <div className="flex items-start gap-3 border-l-2 border-primary bg-[var(--diff-canvas)] px-3 py-1.5">
      <ul className="min-w-0 flex-1 space-y-1.5">
        {focus.ranges.map((range) => (
          <li key={`${range.side}:${range.start}`}>
            <p className="text-xs leading-5 text-muted-foreground tabular-nums">
              <span className="font-semibold text-foreground/75">Agent focus</span>
              {" · "}
              {rangeLabel(range)}
            </p>
            <p className="text-sm leading-snug text-foreground">
              <InlineMd text={range.caption} />
            </p>
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-expanded={whole}
        className="shrink-0 rounded-sm text-xs leading-5 font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        onClick={onToggle}
      >
        {whole ? "Show focus only" : "Show whole hunk"}
      </button>
    </div>
  );
}

function rangeLabel(range: { side: "old" | "new"; start: number; end: number }): string {
  const lines = spanLabel({ from: range.start, to: range.end });
  return range.side === "old" ? `Old ${lines.toLowerCase()}` : lines;
}

function spanLabel(span: LineSpan): string {
  return span.from === span.to ? `Line ${span.from}` : `Lines ${span.from}–${span.to}`;
}

/** Lines of a cut hunk that the focus leaves out. It opens only its own lines. */
export function HiddenLines(props: {
  count: number;
  notes: readonly LetteredNote[];
  onShow: () => void;
}) {
  const { count, notes, onShow } = props;
  const show = `Show ${count} more ${count === 1 ? "line" : "lines"}`;
  const letters = notes.map((note) => note.letter).join(", ");
  const noteWord = notes.length === 1 ? "Note" : "Notes";
  const where = notes.length === 1 ? "is in these lines" : "are in these lines";
  return (
    <button
      type="button"
      aria-label={notes.length > 0 ? `${show}. ${noteWord} ${letters} ${where}` : undefined}
      className="flex min-h-7 w-full items-center gap-1.5 bg-[var(--diff-canvas)] px-3 py-1 text-left text-xs leading-5 tabular-nums text-muted-foreground transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      onClick={onShow}
    >
      <ChevronsUpDownIcon aria-hidden className="size-3.5 shrink-0 text-primary" />
      <span className="shrink-0 font-medium text-primary">{show}</span>
      {notes.length > 0 ? (
        <>
          <span aria-hidden>·</span>
          <span className="inline-flex min-w-0 items-center gap-1">
            {noteWord}
            {notes.map((note) => (
              <NoteLetter key={note.letter} letter={note.letter} />
            ))}
            {where}
          </span>
        </>
      ) : null}
    </button>
  );
}

/** Lines between two hunks that no hunk holds. Live git has them; the diff does not. */
export function HunkGap(props: { lines: LineSpan }) {
  return (
    <p className="border-y border-dashed border-border bg-[var(--diff-canvas)] px-3 py-0.5 text-center text-xs leading-5 tabular-nums text-muted-foreground">
      {spanLabel(props.lines)} unchanged
    </p>
  );
}
