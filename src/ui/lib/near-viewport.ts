import { useEffect, useState, type RefObject } from "react";
import type { Priority } from "./image-loader.ts";

// One and a half screens above and below, so pixels are ready before a card scrolls in.
const NEAR_MARGIN = "150% 0px";

/**
 * Where the node sits against its scroll container: on the screen, near it, or far away. The
 * names are image load priorities: a far card still loads, in the background.
 */
export function useViewportPriority(ref: RefObject<Element | null>): Priority {
  const [visible, setVisible] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (node === null) {
      return;
    }
    // The margin only grows the root, and a scroll container clips what lies past its edge.
    const root = scrollRoot(node);
    const observers = [
      observe(node, root, "0px", setVisible),
      observe(node, root, NEAR_MARGIN, setNear),
    ];
    return () => {
      for (const observer of observers) {
        observer.disconnect();
      }
    };
  }, [ref]);

  return visible ? "visible" : near ? "near" : "background";
}

function observe(
  node: Element,
  root: Element | null,
  rootMargin: string,
  onChange: (intersecting: boolean) => void,
): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries.at(-1);
      if (entry !== undefined) {
        onChange(entry.isIntersecting);
      }
    },
    { root, rootMargin },
  );
  observer.observe(node);
  return observer;
}

function scrollRoot(node: Element): Element | null {
  for (let parent = node.parentElement; parent !== null; parent = parent.parentElement) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll") {
      return parent;
    }
  }
  return null;
}
