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
    options?.startViewTransition ??
    (typeof document === "undefined" ? undefined : document.startViewTransition.bind(document));
  return !reduced && typeof start === "function";
}

/** Narrow screens skip the group motion: iOS Safari can leave the brief unpainted after it (WebKit bug 275698). */
export function selectionMotion(view: {
  inspectorOpen: boolean;
  narrow: boolean;
}): MotionKind | null {
  if (view.inspectorOpen) {
    return "scene";
  }
  return view.narrow ? null : "group";
}

export function runViewTransition(update: () => void, kind: MotionKind | null): void {
  if (kind === null || !shouldViewTransition()) {
    update();
    return;
  }
  const start = document.startViewTransition.bind(document);
  if (typeof start !== "function") {
    update();
    return;
  }
  const root = document.documentElement;
  const token = ++motionGeneration;
  root.dataset.motion = kind;
  try {
    const done = start(() => {
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
