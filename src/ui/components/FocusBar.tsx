import type { HunkFocus, LetteredNote } from "../lib/focus.ts";
import { InlineMd } from "./InlineMd.tsx";
import { NoteLetter } from "./NotePin.tsx";

/** The agent's reason to read a hunk's focus ranges, above that hunk. */
export function FocusBar(props: { focus: HunkFocus; whole: boolean; onToggle: () => void }) {
  const { focus, whole, onToggle } = props;
  return (
    <div className="flex items-start gap-3 border-y border-primary/25 bg-primary/[0.05] px-3 py-2 first:border-t-0">
      <ul className="min-w-0 flex-1 space-y-1.5 border-l-2 border-primary pl-2.5">
        {focus.ranges.map((range) => (
          <li key={`${range.side}:${range.start}`}>
            <p className="font-mono text-[11px] leading-none text-primary">
              Agent focus
              <span className="text-muted-foreground tabular-nums">
                {" · "}
                {range.side === "old" ? "old " : ""}
                {range.start === range.end
                  ? `line ${range.start}`
                  : `lines ${range.start}–${range.end}`}
              </span>
            </p>
            <p className="mt-1 text-sm leading-snug text-foreground">
              <InlineMd text={range.caption} />
            </p>
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-expanded={whole}
        className="shrink-0 rounded-sm font-mono text-[11px] leading-none text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        onClick={onToggle}
      >
        {whole ? "Show focus only" : "Show whole hunk"}
      </button>
    </div>
  );
}

const WHERE = { above: "above", between: "", below: "below" } as const;

/** A cut edge inside the diff. Opens the whole hunk. */
export function HiddenLines(props: {
  count: number;
  where: keyof typeof WHERE;
  notes: readonly LetteredNote[];
  onShow: () => void;
}) {
  const { count, where, notes, onShow } = props;
  const place = WHERE[where];
  return (
    <button
      type="button"
      className="group flex w-full items-center gap-2 border-y border-dashed border-border bg-[var(--diff-hunk)] px-3 py-1 text-left font-mono text-[11px] tabular-nums text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      onClick={onShow}
    >
      <span aria-hidden className="tracking-widest">
        ⋯
      </span>
      <span>
        {count} {count === 1 ? "line" : "lines"}
        {place === "" ? "" : ` ${place}`} not shown
      </span>
      {notes.length > 0 ? (
        <span className="inline-flex items-center gap-1">
          <span aria-hidden>·</span>
          {notes.map((note) => (
            <NoteLetter key={note.letter} letter={note.letter} />
          ))}
          <span>{notes.length === 1 ? "note" : "notes"}</span>
        </span>
      ) : null}
      <span className="ml-auto opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
        Show whole hunk
      </span>
    </button>
  );
}
