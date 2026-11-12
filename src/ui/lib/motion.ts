import { flushSync } from "react-dom";

export type MotionKind = "group" | "scene";

let motionGeneration = 0;

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** lib.dom types the method as always present; Firefox before 144 and Safari before 18 lack it. */
function viewTransitionStart(): Document["startViewTransition"] | undefined {
  if (typeof document === "undefined" || prefersReducedMotion()) {
    return undefined;
  }
  const maybe: Partial<Pick<Document, "startViewTransition">> = document;
  return maybe.startViewTransition?.bind(document);
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
  const start = viewTransitionStart();
  if (kind === null || start === undefined) {
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
