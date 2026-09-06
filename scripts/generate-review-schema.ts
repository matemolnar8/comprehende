#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { findPackageRoot } from "../src/package-root.ts";
import { reviewJsonSchemaText } from "../src/schema/review.ts";
import { skillPaths } from "../src/schema/skill-paths.ts";

const path = skillPaths(findPackageRoot()).canonicalSchema;
await writeFile(path, reviewJsonSchemaText());
console.log(`wrote ${path}`);
