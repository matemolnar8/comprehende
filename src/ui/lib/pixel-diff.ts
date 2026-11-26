import PixelDiffWorker from "./pixel-diff.worker.ts?worker";
import type {
  PixelDiffInput,
  PixelDiffReply,
  PixelDiffRequest,
  PixelDiffResult,
} from "./pixel-diff.worker.ts";

export type { PixelDiffResult };

type Job = {
  key: string;
  input: PixelDiffInput;
  done: (result: PixelDiffResult | null) => void;
  cancelled: boolean;
};

// A 2880 × 1800 diff holds about 20 MB, so only the latest dozen stay: about the cards near the screen.
const KEEP = 12;
const results = new Map<string, PixelDiffResult>();
const queue: Job[] = [];
let running: { id: number; job: Job } | undefined;
let worker: Worker | undefined;
let nextId = 0;

const keyOf = (input: PixelDiffInput) =>
  `${input.oldImage.url}\n${input.newImage.url}\n${input.width}x${input.height}`;

/**
 * Diff a pair off the main thread: one large pair takes a third of a second, and a group can hold
 * a hundred. Jobs run one at a time in the order asked. `cancel` drops a job that has not started,
 * so a card that scrolls away before its turn costs nothing.
 */
export function queuePixelDiff(
  input: PixelDiffInput,
  done: (result: PixelDiffResult | null) => void,
): { cancel: () => void } {
  const key = keyOf(input);
  const kept = takeKept(key);
  if (kept !== undefined) {
    done(kept);
    return { cancel: () => {} };
  }
  const job: Job = { key, input, done, cancelled: false };
  queue.push(job);
  pump();
  return {
    cancel: () => {
      job.cancelled = true;
      const index = queue.indexOf(job);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    },
  };
}

function pump(): void {
  if (running !== undefined) {
    return;
  }
  const job = queue.shift();
  if (job === undefined) {
    return;
  }
  // A job asked again while the same pair ran: the first run left its result.
  const kept = takeKept(job.key);
  if (kept !== undefined) {
    try {
      job.done(kept);
    } finally {
      pump();
    }
    return;
  }
  const request: PixelDiffRequest = { id: nextId++, input: job.input };
  running = { id: request.id, job };
  try {
    worker ??= startWorker();
    worker.postMessage(request);
  } catch (cause: unknown) {
    // The browser did not start the worker, or did not take the job.
    console.error(cause);
    finish(request.id, null);
  }
}

/** A kept result, moved to the newest end so the oldest goes first. */
function takeKept(key: string): PixelDiffResult | undefined {
  const kept = results.get(key);
  if (kept !== undefined) {
    results.delete(key);
    results.set(key, kept);
  }
  return kept;
}

function finish(id: number, result: PixelDiffResult | null): void {
  if (running?.id !== id) {
    return;
  }
  const { job } = running;
  running = undefined;
  if (result !== null) {
    results.set(job.key, result);
    while (results.size > KEEP) {
      const oldest = results.keys().next().value;
      if (oldest === undefined) {
        break;
      }
      // The canvas that drew it holds its own copy.
      results.get(oldest)?.bitmap.close();
      results.delete(oldest);
    }
  }
  try {
    if (!job.cancelled) {
      job.done(result);
    }
  } finally {
    pump();
  }
}

function startWorker(): Worker {
  const started = new PixelDiffWorker();
  started.addEventListener("message", (event: MessageEvent<PixelDiffReply>) => {
    finish(event.data.id, event.data.result);
  });
  // The worker did not load, or it stopped. No answer will come for the job it holds.
  started.addEventListener("error", (event) => {
    console.error(event);
    started.terminate();
    worker = undefined;
    if (running !== undefined) {
      finish(running.id, null);
    }
  });
  return started;
}
