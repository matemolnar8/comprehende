import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { describe, it } from "node:test";
import { skillPaths } from "./skill-paths.ts";

const paths = skillPaths();

describe("skill schema sync", () => {
  it("keeps the published and installed skill schemas identical to src/schema/review.schema.json", async () => {
    const canonical = await readFile(paths.canonicalSchema, "utf8");
    const published = await readFile(paths.publishedSchema, "utf8");
    const installed = await readFile(paths.installedSchema, "utf8");
    assert.equal(
      published,
      canonical,
      "skills/comprehende/references/review.schema.json drifted. Run: pnpm sync:skill",
    );
    assert.equal(
      installed,
      canonical,
      ".agents/skills/comprehende/references/review.schema.json drifted. Run: pnpm sync:skill",
    );
  });

  it("mirrors skills/comprehende into .agents/skills/comprehende", async () => {
    const published = await listFiles(paths.publishedSkill);
    const installed = await listFiles(paths.installedSkill);
    assert.deepEqual(
      installed,
      published,
      ".agents/skills/comprehende is not a copy of skills/comprehende. Run: pnpm sync:skill",
    );
    for (const rel of published) {
      const a = await readFile(join(paths.publishedSkill, rel));
      const b = await readFile(join(paths.installedSkill, rel));
      assert.equal(
        b.equals(a),
        true,
        `${rel} differs between skills/ and .agents/. Run: pnpm sync:skill`,
      );
    }
  });
});

async function listFiles(root: string): Promise<string[]> {
  const out: string[] = [];
  const walk = async (dir: string): Promise<void> => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      out.push(relative(root, full));
    }
  };
  await walk(root);
  out.sort();
  return out;
}
