import { ArrowUpRightIcon, MessageSquareIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import type { FileComment } from "../lib/source-display.ts";
import { InlineMd } from "./InlineMd.tsx";
import { PinCard, PinKicker } from "./NotePin.tsx";

export function CommentPin(props: { comments: readonly FileComment[]; focusId?: string }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      {props.comments.map((comment) => (
        <div key={comment.id} data-source-id={comment.id}>
          <PinCard
            tone="person"
            label={comment.author === undefined ? "PR comment" : `PR comment by ${comment.author}`}
            icon={MessageSquareIcon}
            kicker={
              <PinKicker kind="PR comment" who={comment.author}>
                {comment.stale ? (
                  <span className="text-warn"> · Pin does not match live git.</span>
                ) : null}
              </PinKicker>
            }
            action={
              comment.url !== undefined ? (
                <a
                  className="inline-flex items-center gap-0.5 rounded-sm text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                  href={comment.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open comment"
                >
                  <ArrowUpRightIcon className="size-3.5" />
                </a>
              ) : undefined
            }
            className={cn(
              comment.stale && "border-warn",
              props.focusId === comment.id && "rounded-r-md ring-2 ring-ring/60",
            )}
          >
            {paragraphs(comment.body).map((text, index) => (
              <p key={index}>
                <InlineMd text={text} />
              </p>
            ))}
          </PinCard>
        </div>
      ))}
    </div>
  );
}

function paragraphs(body: string | undefined): string[] {
  return (body ?? "")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter((part) => part !== "");
}
