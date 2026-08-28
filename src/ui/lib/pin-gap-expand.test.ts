import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  adjustScroll,
  isPlainDownClick,
  settleGapPin,
  watchGapPin,
  type GapPin,
} from "./pin-gap-expand.ts";

function scroller(scrollTop = 80, scrollHeight = 1000) {
  return { scrollTop, scrollHeight, style: { scrollBehavior: "" } };
}

function pin(partial: Partial<GapPin> & Pick<GapPin, "scroller">): GapPin {
  return {
    top: 200,
    index: "1",
    scrollHeight: 1000,
    createdAt: Date.now(),
    ...partial,
  };
}

function host(sepTop: number | undefined) {
  return {
    shadowRoot: {
      querySelector: () =>
        sepTop === undefined
          ? null
          : { getBoundingClientRect: () => ({ top: sepTop }) },
    },
  } as unknown as HTMLElement;
}

function target(hits: Record<string, boolean>) {
  return {
    closest(selector: string) {
      return hits[selector] === true ? this : null;
    },
  };
}

describe("gap pin", () => {
  it("treats a plain down click as the case that does not insert above", () => {
    assert.equal(isPlainDownClick([target({ "[data-expand-down]": true })], false), true);
    assert.equal(isPlainDownClick([target({ "[data-expand-down]": true })], true), false);
    assert.equal(
      isPlainDownClick([target({ "[data-expand-all-button]": true, "[data-expand-down]": true })], false),
      false,
    );
    assert.equal(isPlainDownClick([target({ "[data-expand-up]": true })], false), false);
  });

  it("shifts the scrollport by the measured delta", () => {
    const next = scroller(400);
    adjustScroll(next as HTMLElement, 160);
    assert.equal(next.scrollTop, 560);
    adjustScroll(next as HTMLElement, 0);
    assert.equal(next.scrollTop, 560);
  });

  it("waits until the separator moves, then holds it", () => {
    const next = scroller(80);
    const current = pin({ scroller: next as HTMLElement });
    assert.equal(settleGapPin(current, host(200)), "ok");
    assert.equal(next.scrollTop, 80);
    assert.equal(settleGapPin(current, host(380)), "wait");
    assert.equal(next.scrollTop, 260);
    assert.equal(settleGapPin(current, host(200)), "ok");
  });

  it("uses the scroller height when the separator is gone", () => {
    const next = scroller(80, 1400);
    const current = pin({ scroller: next as HTMLElement, scrollHeight: 1000 });
    assert.equal(settleGapPin(current, host(undefined)), "done");
    assert.equal(next.scrollTop, 480);
  });

  it("stops an old watcher when a newer pin is live", () => {
    const next = scroller(80);
    const current = pin({ scroller: next as HTMLElement });
    const queued: Array<() => void> = [];
    let gen = 1;
    let done = false;
    watchGapPin(
      current,
      host(380),
      () => gen === 1,
      () => {
        done = true;
      },
      (tick) => {
        queued.push(tick);
      },
    );
    gen = 2;
    queued.shift()?.();
    assert.equal(done, true);
    assert.equal(next.scrollTop, 80);
  });
});
