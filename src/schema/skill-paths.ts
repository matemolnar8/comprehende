import { join } from "node:path";
import { findPackageRoot } from "../package-root.ts";

export function skillPaths(root = findPackageRoot()) {
  return {
    canonicalSchema: join(root, "src/schema/review.schema.json"),
    publishedSkill: join(root, "skills/comprehende"),
    installedSkill: join(root, ".agents/skills/comprehende"),
    publishedSchema: join(root, "skills/comprehende/references/review.schema.json"),
    installedSchema: join(root, ".agents/skills/comprehende/references/review.schema.json"),
  };
}
