#!/usr/bin/env node

import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgv, USAGE } from "./args.ts";
import { cmdIndex, cmdValidate, loadDocument, resolveDataPath } from "./commands.ts";
import { resolveSource } from "../git/diff.ts";
import { coverReview, coverageErrors } from "../review/coverage.ts";
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
        const document = await loadDocument(dataPath);
        await resolveSource(request.cwd, document.source.baseRef, document.source.headRef);
        const { coverage } = await coverReview(request.cwd, document);
        const problems = coverageErrors(coverage);
        if (problems.length > 0) {
          console.error(`coverage issues (serve continues; git wins, unassigned/stale are visible):\n${problems.join("\n\n")}`);
        }
        const running = await startServer({ cwd: request.cwd, dataPath, port: request.port });
        console.log(running.url);
        console.error(`serving ${dataPath}  cwd=${request.cwd}  localhost only`);
        if (request.open) {
          openUrl(running.url);
        }
        await waitForClose(running.server);
        return 0;
      }
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
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

const thisFile = fileURLToPath(import.meta.url).replaceAll("\\", "/");
const entry = process.argv[1];
const isDirect =
  entry !== undefined &&
  (thisFile === resolve(entry).replaceAll("\\", "/") ||
    /(?:^|\/)src\/cli\/main\.ts$/.test(resolve(entry)) ||
    /(?:^|\/)dist\/cli\/main\.js$/.test(resolve(entry)));
if (isDirect) {
  process.exitCode = await run(process.argv.slice(2));
}
