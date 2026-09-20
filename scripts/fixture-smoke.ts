#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { apiHref } from "../src/api/paths.ts";
import { startServer } from "../src/server/http.ts";
import {
  MIXED_GROUP_APP,
  MIXED_PART_APP,
  MIXED_PART_DOCS,
  MIXED_PART_LIB,
} from "../src/test/covering-document.ts";
import { buildExampleFixture } from "./build-fixture.ts";

export const FIXTURE_SMOKE_PORT = 4579;

type ReviewPayload = {
  document: {
    parts?: { name: string; summary: string }[];
    lookFor?: string[];
    groups: { id: string; dependsOn?: string[]; lookFor?: string[]; part?: string }[];
  };
};

export async function runFixtureSmoke(packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..")): Promise<string> {
  const ui = join(packageRoot, "dist/ui/index.html");
  if (!existsSync(ui)) {
    execFileSync("pnpm", ["build"], { cwd: packageRoot, stdio: "inherit" });
  }
  const built = await buildExampleFixture(packageRoot);
  const running = await startServer({
    cwd: built.repo.root,
    dataPath: built.dataPath,
    port: FIXTURE_SMOKE_PORT,
  });
  try {
    const overviewUrl = `${running.url}/#overview`;
    const groupUrl = `${running.url}/#group/${MIXED_GROUP_APP}`;
    const page = await fetch(overviewUrl);
    assertStatus(page, overviewUrl, 200);
    const html = await page.text();
    if (!html.includes('id="root"')) {
      throw new Error(`${overviewUrl} HTML is missing #root`);
    }

    const groupPage = await fetch(groupUrl);
    assertStatus(groupPage, groupUrl, 200);

    const reviewHref = new URL(apiHref({ kind: "review" }), `${running.url}/`);
    const reviewRes = await fetch(reviewHref);
    assertStatus(reviewRes, reviewHref.href, 200);
    const review = (await reviewRes.json()) as ReviewPayload;
    const names = (review.document.parts ?? []).map((part) => part.name);
    for (const name of [MIXED_PART_APP, MIXED_PART_LIB, MIXED_PART_DOCS]) {
      if (!names.includes(name)) {
        throw new Error(`review.json missing part ${name}`);
      }
    }
    if ((review.document.lookFor ?? []).length === 0) {
      throw new Error("review.json missing document lookFor");
    }
    const app = review.document.groups.find((group) => group.id === MIXED_GROUP_APP);
    if (app?.part !== MIXED_PART_APP) {
      throw new Error(`group ${MIXED_GROUP_APP} missing part ${MIXED_PART_APP}`);
    }
    if (!review.document.groups.some((group) => (group.dependsOn ?? []).length > 0)) {
      throw new Error("review.json missing a dependsOn group");
    }

    const overviewMdHref = new URL(apiHref({ kind: "agent-md", target: "overview" }), `${running.url}/`);
    const overviewMd = await fetch(overviewMdHref);
    assertStatus(overviewMd, overviewMdHref.href, 200);
    const overviewText = await overviewMd.text();
    if (!overviewText.includes("CHANGELOG")) {
      throw new Error("overview.md missing document lookFor");
    }

    const groupMdHref = new URL(
      apiHref({ kind: "agent-md", target: "group", group: MIXED_GROUP_APP }),
      `${running.url}/`,
    );
    const groupMd = await fetch(groupMdHref);
    assertStatus(groupMd, groupMdHref.href, 200);
    const groupText = await groupMd.text();
    if (!groupText.includes(MIXED_PART_APP) || !groupText.includes("Look for:")) {
      throw new Error(`group ${MIXED_GROUP_APP} markdown missing part or lookFor`);
    }

    console.log(`fixture-smoke ok  ${overviewUrl}  ${groupUrl}`);
    return running.url;
  } finally {
    await closeServer(running.server);
  }
}

function assertStatus(res: Response, href: string, expected: number): void {
  if (res.status !== expected) {
    throw new Error(`${href} returned ${res.status}, expected ${expected}`);
  }
}

function closeServer(server: { close: (cb: (error?: Error) => void) => void }): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

const entry = process.argv[1]?.replaceAll("\\", "/");
if (entry !== undefined && /(?:^|\/)fixture-smoke\.(ts|js)$/.test(entry)) {
  try {
    await runFixtureSmoke();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
