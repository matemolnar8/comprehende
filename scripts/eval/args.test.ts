import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAddCaseArgv, parseEvalArgv } from "./args.ts";
import { DEFAULT_GRADER_MODEL, DEFAULT_PRODUCER_MODEL } from "./constants.ts";

describe("eval argv", () => {
  it("parses run flags", () => {
    const req = parseEvalArgv(["--tag", "smoke", "--case", "comprehende-50", "--json", "--sandbox"]);
    assert.deepEqual(req, {
      kind: "run",
      ids: ["comprehende-50"],
      tag: "smoke",
      baseline: undefined,
      json: true,
      producerModel: DEFAULT_PRODUCER_MODEL,
      graderModel: DEFAULT_GRADER_MODEL,
      sandbox: true,
    });
  });

  it("rejects unknown options", () => {
    assert.equal(parseEvalArgv(["--nope"]).kind, "error");
  });

  it("parses add-case --pr", () => {
    const req = parseAddCaseArgv(["--pr", "https://github.com/matemolnar8/comprehende/pull/47"]);
    assert.deepEqual(req, {
      kind: "add",
      prUrl: "https://github.com/matemolnar8/comprehende/pull/47",
      id: undefined,
    });
  });
});
