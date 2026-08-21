import { join } from "node:path";
import { findPackageRoot } from "../package-root.ts";

export function skillPaths(root = findPackageRoot()) {
  return {
    canonicalSchema: join(root, "src/schema/review.schema.json"),
    nextSkill: join(root, "skills-next/comprehende"),
    publishedSkill: join(root, "skills/comprehende"),
    installedSkill: join(root, ".agents/skills/comprehende"),
    nextSchema: join(root, "skills-next/comprehende/references/review.schema.json"),
  };
}
