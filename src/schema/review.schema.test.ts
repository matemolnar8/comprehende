import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { findPackageRoot } from "../package-root.ts";
import { reviewJsonSchema, reviewJsonSchemaText } from "./review.ts";
import { skillPaths } from "./skill-paths.ts";

describe("review JSON Schema", () => {
  it("matches the committed file", async () => {
    const committed = await readFile(skillPaths(findPackageRoot()).canonicalSchema, "utf8");
    assert.equal(committed, reviewJsonSchemaText());
  });

  it("is draft 2020-12 with $defs for source and hunkRef", () => {
    const schema = reviewJsonSchema();
    assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
    assert.equal(schema.additionalProperties, false);
    assert.ok(isRecord(schema.$defs));
    assert.ok(isRecord(schema.$defs.source));
    assert.equal(schema.$defs.source.additionalProperties, false);
    assert.ok(isRecord(schema.$defs.hunkRef));
    assert.equal(schema.$defs.hunkRef.additionalProperties, false);
    assert.ok(isRecord(schema.properties));
    assert.equal("tickets" in schema.properties, false);
  });
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
