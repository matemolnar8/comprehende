#!/usr/bin/env node

import { loadStagedSkillSync, loadWorkingTreeSkillSync, skillSyncErrors } from "../src/schema/skill-sync.ts";

const staged = process.argv.includes("--staged");
const input = staged ? loadStagedSkillSync() : await loadWorkingTreeSkillSync();
const errors = skillSyncErrors(input);
if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
}
