import { useEffect, useState, type RefObject } from "react";

// One and a half screens above and below, so pixels are ready before a card scrolls in.
const NEAR_MARGIN = "150% 0px";

/** True while the node is on screen or close to it, inside its scroll container. */
export function useNearViewport(ref: RefObject<Element | null>): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (node === null) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (entry !== undefined) {
          setNear(entry.isIntersecting);
        }
      },
      // The margin only grows the root, and a scroll container clips what lies past its edge.
      { root: scrollRoot(node), rootMargin: NEAR_MARGIN },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return near;
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

type Waiter = { reveal: () => void };

// Cards not near the screen yet, in mount order (page order on first render). They load one at
// a time while the page is idle, so a fast scroll later finds them ready, and they never slow
// the cards on screen.
const waiting = new Set<Waiter>();
let active: Waiter | undefined;
let scheduled = false;

function pump(): void {
  if (active !== undefined || scheduled || waiting.size === 0) {
    return;
  }
  scheduled = true;
  whenIdle(() => {
    scheduled = false;
    const next = waiting.values().next().value;
    if (active !== undefined || next === undefined) {
      return;
    }
    waiting.delete(next);
    active = next;
    next.reveal();
  });
}

function release(waiter: Waiter): void {
  waiting.delete(waiter);
  if (active === waiter) {
    active = undefined;
  }
  pump();
}

function whenIdle(run: () => void): void {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 50);
  }
}

/**
 * True from the first time the card comes near the screen, or when its turn to load in the
 * background comes. `settled` tells the queue the card is done, so the next one can start. A card
 * that mounts settled, such as one expanded again, starts seen.
 */
export function useSeen(near: boolean, settled: boolean): boolean {
  const [seen, setSeen] = useState(near || settled);
  if (near && !seen) {
    setSeen(true);
  }
  const [waiter] = useState<Waiter>(() => ({ reveal: () => setSeen(true) }));

  useEffect(() => {
    if (!seen) {
      waiting.add(waiter);
      pump();
      return;
    }
    waiting.delete(waiter);
    if (settled) {
      release(waiter);
    }
  }, [seen, settled, waiter]);

  useEffect(() => () => release(waiter), [waiter]);

  return seen;
}
