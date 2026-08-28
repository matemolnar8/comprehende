import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { copyText } from "./copy-text.ts";

describe("copyText", () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, "navigator");
    Reflect.deleteProperty(globalThis, "document");
  });

  it("writes through the clipboard API", async () => {
    const writes: string[] = [];
    stubClipboard(async (text) => {
      writes.push(text);
    });
    await copyText("hello");
    assert.deepEqual(writes, ["hello"]);
  });

  it("falls back when clipboard write fails", async () => {
    stubClipboard(async () => {
      throw new Error("denied");
    });
    const fallback = stubFallback(true);
    await copyText("hello");
    assert.equal(fallback.value, "hello");
    assert.equal(fallback.copied, true);
  });

  it("rejects when both clipboard and fallback fail", async () => {
    stubClipboard(async () => {
      throw new Error("denied");
    });
    stubFallback(false);
    await assert.rejects(() => copyText("hello"), /copy failed/);
  });
});

function stubClipboard(writeText: (text: string) => Promise<void>): void {
  Object.defineProperty(globalThis, "navigator", {
    value: { clipboard: { writeText } },
    configurable: true,
  });
}

function stubFallback(ok: boolean): { value: string; copied: boolean } {
  const state = { value: "", copied: false };
  const el = {
    value: "",
    style: {} as CSSStyleDeclaration,
    setAttribute: () => undefined,
    select: () => {
      state.value = el.value;
    },
    remove: () => undefined,
  };
  Object.defineProperty(globalThis, "document", {
    value: {
      createElement: () => el,
      body: { append: () => undefined },
      execCommand: (command: string) => {
        state.copied = command === "copy" && ok;
        return ok;
      },
    },
    configurable: true,
  });
  return state;
}
