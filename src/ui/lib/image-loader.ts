import { useCallback, useEffect, useSyncExternalStore } from "react";

/** How much a card wants its images: on the screen, close to it, or some time later. */
export type Priority = "visible" | "near" | "background";

export type LoadedImage = {
  /** The network URL it came from. */
  url: string;
  /** An object URL: showing the image again never goes back to the network. */
  src: string;
  /** For the pixel diff worker, so it does not fetch the image again. */
  file: Blob;
  width: number;
  height: number;
};

/** Undefined while the image is not loaded yet. */
export type ImageState = LoadedImage | "error" | undefined;

type Want = { priority: Priority; seq: number };

type Entry = {
  url: string;
  state: ImageState;
  wants: Set<Want>;
  listeners: Set<() => void>;
  loading?: { controller: AbortController; background: boolean };
};

// A link fills faster with a few images at once than with many: each one arrives sooner, and the
// browser keeps a connection free for the rest of the page. One more slot fills the rest of the
// group in the background, one image at a time.
const FOREGROUND_SLOTS = 4;
const BACKGROUND_SLOTS = 1;

const entries = new Map<string, Entry>();
let nextSeq = 0;
let scheduled = false;

function entryFor(url: string): Entry {
  let entry = entries.get(url);
  if (entry === undefined) {
    entry = { url, state: undefined, wants: new Set(), listeners: new Set() };
    entries.set(url, entry);
  }
  return entry;
}

/**
 * Load an image once and keep it. Images on the screen load first, then the ones near it, then the
 * rest of the page. An image that leaves the screen and its margin before it arrives stops
 * loading, so the place a fast scroll stops at does not wait for the places it passed.
 */
export function useImage(url: string | undefined, priority: Priority): ImageState {
  const subscribe = useCallback(
    (listener: () => void) => {
      if (url === undefined) {
        return () => {};
      }
      const { listeners } = entryFor(url);
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    [url],
  );
  const state = useSyncExternalStore(subscribe, () =>
    url === undefined ? undefined : entries.get(url)?.state,
  );

  useEffect(() => {
    if (url === undefined) {
      return;
    }
    const entry = entryFor(url);
    const want: Want = { priority, seq: nextSeq++ };
    entry.wants.add(want);
    schedule();
    return () => {
      entry.wants.delete(want);
      schedule();
    };
  }, [priority, url]);

  return state;
}

// Wants change in bursts (a card's old want goes, its new one comes), so look once after a burst.
function schedule(): void {
  if (!scheduled) {
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      pump();
    });
  }
}

function pump(): void {
  const waiting: { entry: Entry; rank: number; seq: number }[] = [];
  const nearLoading: Entry[] = [];
  const backgroundLoading: Entry[] = [];
  let foregroundBusy = 0;
  let backgroundBusy = 0;
  // The best rank still missing anywhere. Only that rank starts, so images further down the list
  // never take bandwidth from the ones the reader looks at.
  let top = rank("background");

  for (const entry of entries.values()) {
    const best = bestWant(entry);
    if (best === undefined) {
      entry.loading?.controller.abort();
      entry.loading = undefined;
      // Nobody shows it now, so the next card that does may try an image that failed again.
      if (entry.state === "error") {
        entry.state = undefined;
      }
      continue;
    }
    if (entry.state !== undefined) {
      continue;
    }
    top = Math.min(top, rank(best.priority));
    if (entry.loading === undefined) {
      waiting.push({ entry, rank: rank(best.priority), seq: best.seq });
    } else if (entry.loading.background) {
      backgroundBusy++;
      if (best.priority === "background") {
        backgroundLoading.push(entry);
      }
    } else if (best.priority === "background") {
      // A screen image the reader has left gives its slot to the images now on the screen.
      entry.loading.controller.abort();
      entry.loading = undefined;
      waiting.push({ entry, rank: rank(best.priority), seq: best.seq });
    } else {
      foregroundBusy++;
      if (best.priority === "near") {
        nearLoading.push(entry);
      }
    }
  }

  // Oldest first: page order on the first render, and while a scroll runs, the cards that came
  // into range first, which are the closest to the screen.
  const next = waiting.filter((item) => item.rank === top).sort((a, b) => a.seq - b.seq);
  if (top < rank("background")) {
    // The background fill waits while the reader waits. Cards also mount as background before
    // their observers report, so this stops a fill that started on a card far from the screen.
    for (const entry of backgroundLoading) {
      entry.loading?.controller.abort();
      entry.loading = undefined;
    }
    // An image on the screen takes the slot of one that is only near it.
    if (top === rank("visible")) {
      const short = next.length - (FOREGROUND_SLOTS - foregroundBusy);
      for (const entry of nearLoading.slice(0, Math.max(0, short))) {
        entry.loading?.controller.abort();
        entry.loading = undefined;
        foregroundBusy--;
      }
    }
    for (const { entry } of next.slice(0, FOREGROUND_SLOTS - foregroundBusy)) {
      start(entry, false);
    }
  } else {
    for (const { entry } of next.slice(0, BACKGROUND_SLOTS - backgroundBusy)) {
      start(entry, true);
    }
  }
}

/** The strongest want, and the latest of those: the card's current place. */
function bestWant(entry: Entry): Want | undefined {
  let best: Want | undefined;
  for (const want of entry.wants) {
    if (
      best === undefined ||
      rank(want.priority) < rank(best.priority) ||
      (rank(want.priority) === rank(best.priority) && want.seq > best.seq)
    ) {
      best = want;
    }
  }
  return best;
}

function rank(priority: Priority): number {
  return priority === "visible" ? 0 : priority === "near" ? 1 : 2;
}

function start(entry: Entry, background: boolean): void {
  const controller = new AbortController();
  const loading = { controller, background };
  entry.loading = loading;
  load(entry.url, controller.signal).then(
    (image) => {
      if (entry.loading === loading) {
        settle(entry, image);
      } else {
        URL.revokeObjectURL(image.src);
      }
    },
    () => {
      if (entry.loading === loading) {
        settle(entry, "error");
      }
    },
  );
}

function settle(entry: Entry, state: ImageState): void {
  entry.loading = undefined;
  entry.state = state;
  for (const listener of entry.listeners) {
    listener();
  }
  schedule();
}

async function load(url: string, signal: AbortSignal): Promise<LoadedImage> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`image ${response.status}`);
  }
  const file = await response.blob();
  const src = URL.createObjectURL(file);
  try {
    const { naturalWidth, naturalHeight } = await readImage(src);
    return { url, src, file, width: naturalWidth, height: naturalHeight };
  } catch (cause: unknown) {
    URL.revokeObjectURL(src);
    throw cause;
  }
}

function readImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image load failed"));
    image.src = src;
  });
}
