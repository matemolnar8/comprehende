#!/usr/bin/env node

import { spawn } from "node:child_process";
import { realpathSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgv, USAGE } from "./args.ts";
import { cmdIndex, cmdValidate, resolveDataPath, resolveOutPath } from "./commands.ts";
import { exportStaticSite } from "../api/snapshot.ts";
import { openReview, pinReviewSource } from "../api/live.ts";
import { coverageErrors } from "../review/coverage.ts";
import { assertWorkTree } from "../git/repo.ts";
import { readPackageVersion } from "../package-root.ts";
import { startServer } from "../server/http.ts";

export async function run(argv: string[]): Promise<number> {
  const request = parseArgv(argv);
  if (request.kind === "help") {
    console.log(USAGE);
    return 0;
  }
  if (request.kind === "version") {
    console.log(readPackageVersion());
    return 0;
  }
  if (request.kind === "error") {
    console.error(request.message);
    return 1;
  }

  try {
    await assertWorkTree(request.cwd);
    switch (request.command) {
      case "index": {
        const index = await cmdIndex(request.cwd, request.base, request.head);
        console.log(JSON.stringify(index, null, 2));
        return 0;
      }
      case "validate": {
        const dataPath = resolveDataPath(request.data, request.cwd);
        const { document } = await cmdValidate(request.cwd, dataPath);
        const hunks = document.groups.reduce((sum, group) => sum + group.hunkRefs.length, 0);
        console.log(`ok  ${document.groups.length} groups  ${hunks} hunk refs  ${dataPath}`);
        return 0;
      }
      case "serve": {
        const dataPath = resolveDataPath(request.data, request.cwd);
        const pin = await pinReviewSource(request.cwd, dataPath);
        const ctx = await openReview(request.cwd, dataPath, pin);
        warnCoverage(ctx.coverage, "serve continues; git wins, unassigned/stale are visible");
        const running = await startServer({ cwd: request.cwd, dataPath, port: request.port, pin });
        console.log(running.url);
        console.error(`serving ${dataPath}  cwd=${request.cwd}  localhost only`);
        if (request.open) {
          openUrl(running.url);
        }
        await waitForClose(running.server);
        return 0;
      }
      case "export": {
        const dataPath = resolveDataPath(request.data, request.cwd);
        const outDir = resolveOutPath(request.out, request.cwd);
        const ctx = await openReview(request.cwd, dataPath);
        warnCoverage(ctx.coverage, "export continues; git wins, unassigned/stale are visible");
        const result = await exportStaticSite({ cwd: request.cwd, dataPath, outDir, ctx });
        console.log(result.outDir);
        console.error(`exported ${dataPath}  ${result.apiFiles.length} api files  no git in the folder`);
        return 0;
      }
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

function warnCoverage(coverage: Parameters<typeof coverageErrors>[0], note: string): void {
  const problems = coverageErrors(coverage);
  if (problems.length > 0) {
    console.error(`coverage issues (${note}):\n${problems.join("\n\n")}`);
  }
}

function waitForClose(server: { close: (cb: (error?: Error) => void) => void; on: (event: string, cb: () => void) => void }): Promise<void> {
  return new Promise((resolve) => {
    const shutdown = (): void => {
      server.close(() => resolve());
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    server.on("close", () => resolve());
  });
}

function openUrl(url: string): void {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  spawn(command, args, { stdio: "ignore", detached: true }).unref();
}

const thisFile = fileURLToPath(import.meta.url);
if (isCliEntry(thisFile, process.argv[1])) {
  process.exitCode = await run(process.argv.slice(2));
}

export function isCliEntry(modulePath: string, argv1: string | undefined): boolean {
  if (argv1 === undefined) {
    return false;
  }
  try {
    if (realpathSync(modulePath) === realpathSync(argv1)) {
      return true;
    }
  } catch {
    // argv[1] may not exist as a real path (tsx, some shims)
  }
  const entry = resolve(argv1).replaceAll("\\", "/");
  return (
    /(?:^|\/)src\/cli\/main\.ts$/.test(entry) ||
    /(?:^|\/)dist\/cli\/main\.js$/.test(entry) ||
    /(?:^|\/)comprehende$/.test(entry)
  );
}
