import { flushSync } from "react-dom";

export type MotionKind = "group" | "scene";

let motionGeneration = 0;

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function shouldViewTransition(options?: {
  reducedMotion?: boolean;
  startViewTransition?: unknown;
}): boolean {
  const reduced = options?.reducedMotion ?? prefersReducedMotion();
  const start =
    options?.startViewTransition ?? (typeof document === "undefined" ? undefined : document.startViewTransition);
  return !reduced && typeof start === "function";
}

export function runViewTransition(update: () => void, kind: MotionKind): void {
  if (!shouldViewTransition()) {
    update();
    return;
  }
  const start = document.startViewTransition;
  if (typeof start !== "function") {
    update();
    return;
  }
  const root = document.documentElement;
  const token = ++motionGeneration;
  root.dataset.motion = kind;
  try {
    const done = start.call(document, () => {
      flushSync(update);
    });
    void done.finished.finally(() => {
      if (token === motionGeneration) {
        delete root.dataset.motion;
      }
    });
  } catch {
    if (token === motionGeneration) {
      delete root.dataset.motion;
    }
    update();
  }
}
