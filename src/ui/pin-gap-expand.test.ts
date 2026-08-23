import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COUNT_SELECTOR,
  PIN_STALE_MS,
  parseExpandClick,
  pinScrollAfterExpand,
  restorePinnedExpand,
  shouldPinExpand,
  type PendingPin,
} from "./lib/pin-gap-expand.ts";

type FakeAttrs = Record<string, string>;

type FakeEl = {
  attrs: FakeAttrs
  parent: FakeEl | undefined
  getAttribute: (name: string) => string | null
  closest: (selector: string) => FakeEl | null
  querySelector: (selector: string) => FakeEl | null
  getBoundingClientRect: () => { top: number }
  children: FakeEl[]
  top: number
}

function el(attrs: FakeAttrs, children: FakeEl[] = [], top = 0): FakeEl {
  const node: FakeEl = {
    attrs,
    parent: undefined,
    children,
    top,
    getAttribute(name) {
      return name in this.attrs ? this.attrs[name] : null;
    },
    closest(selector) {
      let current: FakeEl | undefined = this;
      while (current) {
        if (matches(current, selector)) return current;
        current = current.parent;
      }
      return null;
    },
    querySelector(selector) {
      const queue = [...this.children];
      while (queue.length > 0) {
        const current = queue.shift();
        if (current === undefined) break;
        if (matches(current, selector)) return current;
        queue.push(...current.children);
      }
      return null;
    },
    getBoundingClientRect() {
      return { top: this.top };
    },
  };
  for (const child of children) child.parent = node;
  return node;
}

function matches(node: FakeEl, selector: string): boolean {
  return selector.split(",").some((part) => {
    const name = part.trim().match(/^\[([^\]]+)\]$/)?.[1];
    return name !== undefined && name in node.attrs;
  });
}

function bar(index: string, tops = { up: 200, down: 200, count: 200, all: 200 }) {
  const up = el({ "data-expand-up": "", "data-expand-button": "" }, [], tops.up);
  const down = el({ "data-expand-down": "", "data-expand-button": "" }, [], tops.down);
  const count = el({ "data-unmodified-lines": "" }, [], tops.count);
  const all = el({ "data-expand-all-button": "" }, [], tops.all);
  const sep = el({ "data-expand-index": index }, [up, down, count, all]);
  return { sep, up, down, count, all };
}

function pin(partial: Partial<PendingPin> & Pick<PendingPin, "scroller">): PendingPin {
  return {
    top: 200,
    index: "1",
    selector: "[data-expand-up]",
    createdAt: Date.now(),
    ...partial,
  };
}

describe("gap expand pin", () => {
  it("pins up and both, not down", () => {
    assert.equal(shouldPinExpand("up"), true);
    assert.equal(shouldPinExpand("both"), true);
    assert.equal(shouldPinExpand("down"), false);
  });

  it("reads Pierre's expand direction from the composed path", () => {
    const { up, down, count, all } = bar("3");
    assert.equal(parseExpandClick([up])?.kind, "up");
    assert.equal(parseExpandClick([up])?.index, "3");
    assert.equal(parseExpandClick([up])?.selector, "[data-expand-up]");
    assert.equal(parseExpandClick([down])?.kind, "down");
    assert.equal(parseExpandClick([count])?.kind, "both");
    assert.equal(parseExpandClick([count])?.selector, COUNT_SELECTOR);
    assert.equal(parseExpandClick([all])?.kind, "both");
    assert.equal(parseExpandClick([all])?.selector, "[data-expand-all-button]");
  });

  it("ignores clicks that are not on a gap control", () => {
    assert.equal(parseExpandClick([]), undefined);
    assert.equal(parseExpandClick([el({ "data-line": "8" })]), undefined);
  });

  it("shifts the scrollport by how far the control moved", () => {
    const scroller = { scrollTop: 400 };
    pinScrollAfterExpand(scroller as HTMLElement, 200, 360);
    assert.equal(scroller.scrollTop, 560);
  });

  it("leaves the scrollport alone when the control did not move", () => {
    const scroller = { scrollTop: 400 };
    pinScrollAfterExpand(scroller as HTMLElement, 200, 200);
    assert.equal(scroller.scrollTop, 400);
  });

  it("waits when the bar has not moved yet", () => {
    const { sep, up } = bar("1", { up: 200, down: 200, count: 200, all: 200 });
    const scroller = { scrollTop: 80 };
    const result = restorePinnedExpand(pin({ scroller: scroller as HTMLElement, top: 200 }), {
      shadowRoot: { querySelector: () => sep },
    } as unknown as HTMLElement);
    assert.equal(result, "pending");
    assert.equal(scroller.scrollTop, 80);
    assert.equal(up.top, 200);
  });

  it("pins the up arrow after lines appear above the bar", () => {
    const { sep } = bar("1", { up: 380, down: 380, count: 380, all: 380 });
    const scroller = { scrollTop: 80 };
    const result = restorePinnedExpand(pin({ scroller: scroller as HTMLElement, top: 200 }), {
      shadowRoot: { querySelector: () => sep },
    } as unknown as HTMLElement);
    assert.equal(result, "restored");
    assert.equal(scroller.scrollTop, 260);
  });

  it("drops the pin when the gap is fully open", () => {
    const scroller = { scrollTop: 80 };
    const result = restorePinnedExpand(pin({ scroller: scroller as HTMLElement }), {
      shadowRoot: { querySelector: () => null },
    } as unknown as HTMLElement);
    assert.equal(result, "gone");
    assert.equal(scroller.scrollTop, 80);
  });

  it("drops a stale pin", () => {
    const { sep } = bar("1", { up: 380, down: 380, count: 380, all: 380 });
    const scroller = { scrollTop: 80 };
    const result = restorePinnedExpand(
      pin({ scroller: scroller as HTMLElement, createdAt: Date.now() - PIN_STALE_MS - 1 }),
      { shadowRoot: { querySelector: () => sep } } as unknown as HTMLElement,
    );
    assert.equal(result, "gone");
    assert.equal(scroller.scrollTop, 80);
  });
});
