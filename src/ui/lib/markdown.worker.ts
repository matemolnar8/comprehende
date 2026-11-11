import { markdownFileRows, markdownRows, type HunkLines, type MdRow } from "./markdown-diff.ts";

export type MarkdownJob =
  | {
      kind: "diff";
      old: string | undefined;
      new: string | undefined;
      hunks: readonly HunkLines[];
    }
  | { kind: "file"; source: string };

export type MarkdownRequest = { id: number; job: MarkdownJob };

/** Null rows: the file could not be read as Markdown. */
export type MarkdownReply = { id: number; rows: MdRow[] | null };

addEventListener("message", (event: MessageEvent<MarkdownRequest>) => {
  const { id, job } = event.data;
  let rows: MdRow[] | null;
  try {
    rows =
      job.kind === "diff"
        ? markdownRows(job.old, job.new, job.hunks)
        : markdownFileRows(job.source);
  } catch (cause: unknown) {
    console.error(cause);
    rows = null;
  }
  const reply: MarkdownReply = { id, rows };
  postMessage(reply);
});
