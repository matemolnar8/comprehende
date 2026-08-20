import type { CSSProperties } from "react";
import { padLayer, sizeLabel, type ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { isMixedReview, partColor, type Part } from "../lib/parts.ts";
import { whyModel, type WhyCommit, type WhyTicket } from "../lib/why.ts";

export function Overview(props: {
  meta: ReviewMeta;
  parts: Part[];
  onOpenLayer: (id: string) => void;
}) {
  const { meta, parts, onOpenLayer } = props;
  const mixed = isMixedReview(parts);
  const byId = new Map(meta.groups.map((group) => [group.id, group]));
  const why = whyModel({
    walkthrough: meta.document.walkthrough,
    tickets: meta.document.tickets,
    commits: meta.commits,
  });

  return (
    <div className="review-overview mb-8">
      <section className="mb-12 max-w-[68ch]" aria-labelledby="review-why">
        <p id="review-why" className="mb-2 font-mono text-[11px] tracking-wide text-muted-foreground">
          Why
        </p>
        {why.heading !== undefined ? (
          <h1 className="mb-4 font-serif text-[1.75rem] leading-snug text-foreground">{why.heading}</h1>
        ) : null}
        {why.tickets.length > 0 || why.commits.length > 0 ? (
          <div className={why.heading !== undefined ? "border-t border-border" : undefined}>
            {why.tickets.map((ticket) => (
              <TicketSource
                key={ticket.id}
                ticket={ticket}
                hideTitle={ticket.id === why.headingTicketId}
                mixed={mixed}
                parts={parts}
              />
            ))}
            {why.commits.map((commit) => (
              <CommitSource key={commit.sha} commit={commit} />
            ))}
          </div>
        ) : null}
        {!why.hasWhy ? (
          <p className="font-serif text-lg leading-relaxed text-foreground">
            No ticket, commit message, or transcript names why this work exists. The diff is not a substitute.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="review-what">
        <p id="review-what" className="mb-6 font-mono text-[11px] tracking-wide text-muted-foreground">
          What · {sizeLabel(meta.document.size)} · {meta.files.length} files
        </p>
        <div
          className={
            mixed ? "grid grid-flow-col auto-cols-[minmax(16rem,1fr)] items-start gap-4 overflow-x-auto pb-1" : undefined
          }
        >
          {parts.map((part) => (
            <PartColumn
              key={part.layerIds.join("\0")}
              part={part}
              mixed={mixed}
              groups={meta.groups}
              byId={byId}
              onOpenLayer={onOpenLayer}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function TicketSource(props: {
  ticket: WhyTicket;
  hideTitle: boolean;
  mixed: boolean;
  parts: Part[];
}) {
  const { ticket, hideTitle, mixed, parts } = props;
  const strand = mixed ? parts.find((part) => part.title === ticket.part) : undefined;
  const color = strand !== undefined ? partColor(strand.colorIndex) : undefined;
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <p className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-muted-foreground">
        {color !== undefined ? (
          <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        ) : null}
        <TicketId ticket={ticket} />
        {ticket.part !== undefined ? <span>· {ticket.part}</span> : null}
      </p>
      {!hideTitle && ticket.title !== undefined ? (
        <p className="mt-1 font-serif text-lg leading-snug text-foreground">{ticket.title}</p>
      ) : null}
    </div>
  );
}

function TicketId(props: { ticket: WhyTicket }) {
  const { ticket } = props;
  if (ticket.url !== undefined) {
    return (
      <a className="text-primary hover:underline" href={ticket.url} target="_blank" rel="noreferrer">
        {ticket.id}
      </a>
    );
  }
  return <span>{ticket.id}</span>;
}

function CommitSource(props: { commit: WhyCommit }) {
  const { commit } = props;
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
        <code className="text-primary">{commit.shortSha}</code>
        {commit.date !== "" ? <span> · {commit.date}</span> : null}
      </p>
      <p className="mt-1 text-foreground">{commit.subject}</p>
      {commit.body !== "" ? (
        <p className="mt-2 whitespace-pre-wrap leading-relaxed text-muted-foreground">{commit.body}</p>
      ) : null}
    </div>
  );
}

function PartColumn(props: {
  part: Part;
  mixed: boolean;
  groups: ReviewMeta["groups"];
  byId: Map<string, ReviewMeta["groups"][number]>;
  onOpenLayer: (id: string) => void;
}) {
  const { part, mixed, groups, byId, onOpenLayer } = props;
  const color = partColor(part.colorIndex);
  return (
    <section
      className={cn("min-w-0", mixed && "rounded-md border border-border py-2")}
      style={mixed ? partStyle(color) : undefined}
      aria-label={part.title}
    >
      {mixed && part.title !== undefined ? (
        <p className="mb-1 flex items-center gap-2 px-4 pt-2 font-mono text-[11px] tracking-wide text-muted-foreground">
          <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          {part.title}
        </p>
      ) : null}
      <ol className="m-0 list-none p-0">
        {part.layerIds.map((id) => {
          const group = byId.get(id);
          if (group === undefined) {
            return null;
          }
          const index = groups.findIndex((item) => item.id === id) + 1;
          return (
            <li key={group.id} className="mb-2 last:mb-0">
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full min-w-0 items-start justify-start gap-4 rounded-md px-4 py-4 text-left font-normal whitespace-normal"
                onClick={() => onOpenLayer(group.id)}
              >
                <span className="mt-0.5 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                  {padLayer(index)}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block font-medium text-foreground">{group.title}</strong>
                  <span className="mt-1 block leading-relaxed text-muted-foreground">{group.summary}</span>
                </span>
              </Button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function partStyle(color: string): CSSProperties {
  return {
    "--strand": color,
    borderLeftWidth: 3,
    borderLeftColor: color,
    backgroundColor: `color-mix(in srgb, ${color} 8%, var(--card))`,
  } as CSSProperties;
}
