import { useEffect, type RefObject } from "react";

type ScrollAxis = "x" | "y";

type ScrollSpan = { offset: number; view: number; content: number };

const spanOf = {
  y: (node) => ({ offset: node.scrollTop, view: node.clientHeight, content: node.scrollHeight }),
  x: (node) => ({ offset: node.scrollLeft, view: node.clientWidth, content: node.scrollWidth }),
} satisfies Record<ScrollAxis, (node: HTMLElement) => ScrollSpan>;

/** Content hides before the start edge, or after the end edge. One pixel of slack absorbs subpixel layout. */
export function scrollEdges(span: ScrollSpan): { scrolled: boolean; more: boolean } {
  return {
    scrolled: span.offset > 0,
    more: span.offset + span.view < span.content - 1,
  };
}

/** Sets `data-scrolled` and `data-more` on a scroll area, for `scrollFade`. On `x`, they mean left and right. */
export function useScrollEdges(ref: RefObject<HTMLElement | null>, axis: ScrollAxis = "y"): void {
  useEffect(() => {
    const node = ref.current;
    if (node === null) {
      return;
    }
    const update = () => {
      const edges = scrollEdges(spanOf[axis](node));
      node.toggleAttribute("data-scrolled", edges.scrolled);
      node.toggleAttribute("data-more", edges.more);
    };
    update();
    node.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(node);
    const mutation = new MutationObserver(update);
    mutation.observe(node, { childList: true, subtree: true, characterData: true });
    return () => {
      node.removeEventListener("scroll", update);
      resize.disconnect();
      mutation.disconnect();
    };
  }, [ref, axis]);
}
