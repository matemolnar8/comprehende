import type { LetteredNote } from "../lib/focus.ts";
import { InlineMd } from "./InlineMd.tsx";

export function NoteLetter(props: { letter: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex size-[1.15rem] shrink-0 items-center justify-center rounded-[0.3rem] bg-primary font-mono text-[10px] font-semibold leading-none text-primary-foreground"
    >
      {props.letter}
    </span>
  );
}

export function NotePin(props: { notes: readonly LetteredNote[] }) {
  return (
    <div className="flex flex-col gap-2 px-2 py-1.5 font-sans">
      {props.notes.map((note) => (
        <aside
          key={note.letter}
          aria-label={`Agent note ${note.letter}`}
          className="flex items-start gap-2 rounded-md border border-primary/30 bg-card px-2.5 py-2 text-xs leading-relaxed text-foreground"
        >
          <NoteLetter letter={note.letter} />
          <div className="min-w-0">
            <p className="mb-0.5 font-mono text-[11px] text-muted-foreground">Agent note</p>
            <p>
              <InlineMd text={note.body} />
            </p>
          </div>
        </aside>
      ))}
    </div>
  );
}
