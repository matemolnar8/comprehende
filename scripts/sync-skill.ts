#!/usr/bin/env node

import { syncNextSkill } from "../src/schema/skill-sync.ts";

const logs = await syncNextSkill({ release: process.argv.includes("--release") });
for (const line of logs) {
  console.log(line);
}
