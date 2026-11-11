import type { MdRow } from "./markdown-diff.ts";
import MarkdownWorker from "./markdown.worker.ts?worker";
import type { MarkdownJob, MarkdownReply, MarkdownRequest } from "./markdown.worker.ts";

let worker: Worker | undefined;
let nextId = 0;
const waiting = new Map<number, (rows: MdRow[] | null) => void>();

function settleAll(): void {
  for (const settle of waiting.values()) {
    settle(null);
  }
  waiting.clear();
}

/**
 * Reads Markdown into rows off the main thread: a long rewrite takes most of a second to compare
 * word by word, and the page must not stop for it. Null when the file cannot be read as Markdown.
 */
export function markdownRowsJob(job: MarkdownJob): Promise<MdRow[] | null> {
  if (worker === undefined) {
    worker = new MarkdownWorker();
    worker.addEventListener("message", (event: MessageEvent<MarkdownReply>) => {
      waiting.get(event.data.id)?.(event.data.rows);
      waiting.delete(event.data.id);
    });
    // The worker did not load, or it stopped. No answer will come for the jobs it holds.
    worker.addEventListener("error", (event) => {
      console.error(event);
      worker = undefined;
      settleAll();
    });
  }
  const request: MarkdownRequest = { id: nextId++, job };
  return new Promise((resolve) => {
    waiting.set(request.id, resolve);
    worker?.postMessage(request);
  });
}
