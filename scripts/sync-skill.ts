#!/usr/bin/env node

import { cp, copyFile, mkdir, rm } from "node:fs/promises";
import { dirname } from "node:path";
import { skillPaths } from "../src/schema/skill-paths.ts";

const paths = skillPaths();
await mkdir(dirname(paths.publishedSchema), { recursive: true });
await copyFile(paths.canonicalSchema, paths.publishedSchema);
await rm(paths.installedSkill, { recursive: true, force: true });
await cp(paths.publishedSkill, paths.installedSkill, { recursive: true });
console.log(`copied ${paths.canonicalSchema} -> ${paths.publishedSchema}`);
console.log(`copied ${paths.publishedSkill} -> ${paths.installedSkill}`);
