import { ArrowUpRightIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import type { FileComment } from "../lib/source-display.ts";

export function CommentPin(props: { comments: readonly FileComment[]; focusId?: string }) {
  return (
    <div className="flex flex-col gap-2 px-2 py-1.5 font-sans">
      {props.comments.map((comment) => (
        <article
          key={comment.id}
          data-source-id={comment.id}
          className={cn(
            "rounded-md border border-border bg-card px-2.5 py-2 text-xs leading-relaxed text-foreground",
            comment.stale && "border-warn",
            props.focusId === comment.id && "ring-2 ring-ring/60",
          )}
        >
          <header className="mb-1 flex items-baseline gap-2 text-muted-foreground">
            <span className="font-medium text-foreground">{comment.author}</span>
            {comment.stale ? <span className="text-warn">Pin does not match live git.</span> : null}
            {comment.url !== undefined ? (
              <a
                className="ml-auto inline-flex items-center gap-0.5 text-primary hover:underline"
                href={comment.url}
                target="_blank"
                rel="noreferrer"
                aria-label="Open comment"
              >
                <ArrowUpRightIcon className="size-3" />
              </a>
            ) : null}
          </header>
          <p className="whitespace-pre-wrap">{comment.body}</p>
        </article>
      ))}
    </div>
  );
}
