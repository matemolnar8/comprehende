import type { ReactNode } from "react";
import { PinIcon, type LucideIcon } from "lucide-react";
import type { LetteredNote } from "../lib/focus.ts";
import { cn } from "@/lib/utils.ts";
import { InlineMd } from "./InlineMd.tsx";

/** A note's letter chip, on its pin and where a gap row names a note it hides. */
export function NoteLetter(props: { letter: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-[4px] bg-primary/15 px-1 text-xs leading-none font-semibold text-primary uppercase"
    >
      {props.letter}
    </span>
  );
}

/** "Agent note [A]", "PR comment · reviewer". */
export function PinKicker(props: { kind: string; who?: string; children?: ReactNode }) {
  return (
    <>
      <span className="font-semibold text-foreground/75">{props.kind}</span>
      {props.who !== undefined ? (
        <>
          <span aria-hidden> · </span>
          <span>{props.who}</span>
        </>
      ) : null}
      {props.children}
    </>
  );
}

/**
 * The row an agent note and a PR comment share inside a diff. It sits on the canvas with one left
 * rule, so the code stays the loudest thing in the card. The rule says who spoke.
 */
export function PinCard({
  icon: Icon,
  ...props
}: {
  tone: "agent" | "person";
  icon: LucideIcon;
  kicker: ReactNode;
  children: ReactNode;
  className?: string;
  label?: string;
  action?: ReactNode;
}) {
  return (
    <aside
      aria-label={props.label}
      className={cn(
        "border-l-2 py-1 pr-3 pl-1.5 font-sans text-[13px] leading-relaxed text-foreground min-[800px]:pl-3",
        props.tone === "agent" ? "border-primary" : "border-foreground/45",
        props.className,
      )}
    >
      <p className="flex items-center gap-1.5 text-xs leading-5 text-muted-foreground">
        <Icon
          aria-hidden
          className={cn(
            "size-3.5 shrink-0",
            props.tone === "agent" ? "text-primary" : "text-foreground/70",
          )}
        />
        <span className="min-w-0 truncate">{props.kicker}</span>
        {props.action !== undefined ? (
          <span className="ml-auto shrink-0">{props.action}</span>
        ) : null}
      </p>
      <div className="space-y-1.5">{props.children}</div>
    </aside>
  );
}

export function NotePin(props: { notes: readonly LetteredNote[] }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      {props.notes.map((note) => (
        <PinCard
          key={note.letter}
          tone="agent"
          label={`Agent note ${note.letter}`}
          icon={PinIcon}
          kicker={
            <PinKicker kind="Agent note">
              {" "}
              <NoteLetter letter={note.letter} />
            </PinKicker>
          }
        >
          <p>
            <InlineMd text={note.body} />
          </p>
        </PinCard>
      ))}
    </div>
  );
}
