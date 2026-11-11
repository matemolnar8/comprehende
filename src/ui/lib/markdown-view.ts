import { useSyncExternalStore } from "react";
import { readKey, writeKey } from "./storage.ts";

export type MarkdownView = "rendered" | "source";

export const MARKDOWN_VIEW_STORAGE_KEY = "comprehende.markdown-view";

export function parseMarkdownView(raw: string | null): MarkdownView {
  return raw === "source" ? "source" : "rendered";
}

// One choice for every Markdown file: switching one card switches them all.
const listeners = new Set<() => void>();
let view: MarkdownView | undefined;

function currentMarkdownView(): MarkdownView {
  view ??= parseMarkdownView(readKey(localStorage, MARKDOWN_VIEW_STORAGE_KEY));
  return view;
}

export function setMarkdownView(next: MarkdownView): void {
  view = next;
  writeKey(localStorage, MARKDOWN_VIEW_STORAGE_KEY, next);
  for (const listener of listeners) {
    listener();
  }
}

export function toggleMarkdownView(): void {
  setMarkdownView(currentMarkdownView() === "rendered" ? "source" : "rendered");
}

export function useMarkdownView(): MarkdownView {
  return useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, currentMarkdownView);
}
