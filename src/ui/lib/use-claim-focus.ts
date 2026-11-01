import { useEffect } from "react";

/** Scrolls the `[data-claim]` element with this key into view when the key changes. */
export function useClaimFocus(focusKey: string | undefined): void {
  useEffect(() => {
    if (focusKey === undefined) {
      return;
    }
    const el = document.querySelector(`[data-claim="${CSS.escape(focusKey)}"]`);
    if (!(el instanceof HTMLElement)) {
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduce ? "instant" : "smooth" });
  }, [focusKey]);
}
