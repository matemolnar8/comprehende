import type { CSSProperties } from "react";
import { padIndex, sizeLabel, type ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { agentPrompt } from "../lib/agent-prompt.ts";
import { isMixedReview, partColor, type Part } from "../lib/parts.ts";
import { CopyPrompt } from "./CopyPrompt.tsx";
import { InlineMd } from "./InlineMd.tsx";

export function Overview(props: {
  meta: ReviewMeta;
  parts: Part[];
  onOpenGroup: (id: string) => void;
}) {
  const { meta, parts, onOpenGroup } = props;
  const mixed = isMixedReview(parts);
  const byId = new Map(meta.groups.map((group) => [group.id, group]));
  const tickets = meta.document.tickets ?? [];
  const why = meta.document.why;
  const ticketList = tickets.length > 0 ? <TicketList tickets={tickets} mixed={mixed} parts={parts} /> : null;
  const prompt = agentPrompt(meta, { kind: "overview" }) ?? "";
  const ask = <CopyPrompt prompt={prompt} scope="overview" />;

  return (
    <div className="mb-8 [[data-motion=group]_&]:[view-transition-name:review-overview]">
      {why !== undefined ? (
        <section className="mb-12" aria-labelledby="review-why">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p id="review-why" className="font-mono text-[11px] tracking-wide text-muted-foreground">
              Why
            </p>
            {ask}
          </div>
          <h1 className="mb-4 font-serif text-[1.75rem] leading-snug text-foreground">
            <InlineMd text={why} />
          </h1>
          {ticketList}
        </section>
      ) : ticketList !== null ? (
        <div className="mb-8">{ticketList}</div>
      ) : null}

      <section aria-labelledby="review-what">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p id="review-what" className="font-mono text-[11px] tracking-wide text-muted-foreground">
            What · {sizeLabel(meta.document.size)} · {meta.files.length} files
          </p>
          {why === undefined ? ask : null}
        </div>
        {why !== undefined ? (
          <p className="mb-4 font-serif text-lg leading-relaxed text-foreground">
            <InlineMd text={meta.document.summary} />
          </p>
        ) : (
          <h1 className="mb-4 font-serif text-[1.75rem] leading-snug text-foreground">
            <InlineMd text={meta.document.summary} />
          </h1>
        )}
        <div
          className={
            mixed ? "grid grid-flow-col auto-cols-[minmax(16rem,1fr)] items-start gap-4 overflow-x-auto pb-1" : undefined
          }
        >
          {parts.map((part) => (
            <PartColumn
              key={part.groupIds.join("\0")}
              part={part}
              mixed={mixed}
              groups={meta.groups}
              byId={byId}
              onOpenGroup={onOpenGroup}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function TicketList(props: { tickets: NonNullable<ReviewMeta["document"]["tickets"]>; mixed: boolean; parts: Part[] }) {
  const { tickets, mixed, parts } = props;
  return (
    <ul className="space-y-1 font-mono text-[11px] tracking-wide text-muted-foreground">
      {tickets.map((ticket) => {
        const strand = mixed ? parts.find((part) => part.title === ticket.part) : undefined;
        return (
          <li key={ticket.id} className="flex items-center gap-2">
            {strand !== undefined ? (
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: partColor(strand.colorIndex) }}
              />
            ) : null}
            {ticket.url !== undefined ? (
              <a className="text-primary hover:underline" href={ticket.url} target="_blank" rel="noreferrer">
                {ticket.id}
              </a>
            ) : (
              <span>{ticket.id}</span>
            )}
            {ticket.title !== undefined ? <span>{ticket.title}</span> : null}
            {ticket.part !== undefined ? <span>· {ticket.part}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

function PartColumn(props: {
  part: Part;
  mixed: boolean;
  groups: ReviewMeta["groups"];
  byId: Map<string, ReviewMeta["groups"][number]>;
  onOpenGroup: (id: string) => void;
}) {
  const { part, mixed, groups, byId, onOpenGroup } = props;
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
        {part.groupIds.map((id) => {
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
                onClick={() => onOpenGroup(group.id)}
              >
                <span className="mt-0.5 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                  {padIndex(index)}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block font-medium text-foreground">{group.title}</strong>
                  <span className="mt-1 block leading-relaxed text-muted-foreground">
                    <InlineMd text={group.summary} />
                  </span>
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
