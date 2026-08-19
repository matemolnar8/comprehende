import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LFS_POINTER_VERSION } from "../schema/image.ts";
import { parseLfsPointer } from "./lfs.ts";

describe("parseLfsPointer", () => {
  it("reads oid and size from a pointer blob", () => {
    const oid = "a".repeat(64);
    const pointer = Buffer.from(`${LFS_POINTER_VERSION}\noid sha256:${oid}\nsize 42\n`);
    assert.deepEqual(parseLfsPointer(pointer), { oid, size: 42 });
  });

  it("rejects binary blobs and oversized text", () => {
    assert.equal(parseLfsPointer(Buffer.from([0x89, 0x50, 0x4e, 0x47])), undefined);
    assert.equal(parseLfsPointer(Buffer.alloc(1025, 0x61)), undefined);
  });
});
