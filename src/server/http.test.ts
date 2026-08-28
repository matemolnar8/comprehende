import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import { cmdIndex } from "../cli/commands.ts";
import { writeCoveringDocument } from "../test/covering-document.ts";
import { startServer } from "./http.ts";
import { apiHref } from "../api/paths.ts";
import { createExampleRepo, SECRET_ADD, SECRET_DEL } from "../test/example-repo.ts";
import { git } from "../git/exec.ts";
import { showFile } from "../git/show.ts";

const roots: string[] = [];
const servers: { close: (cb: (error?: Error) => void) => void }[] = [];

after(async () => {
  await Promise.all(
    servers.map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("serve API", () => {
  it("joins live git hunks and keeps patch text out of the review document", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-serve-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const dataPath = join(root, "review.json");
    const index = await cmdIndex(repo.root, repo.base, repo.head);
    const document = await writeCoveringDocument(dataPath, index);
    const running = await startServer({ cwd: repo.root, dataPath, port: 0 });
    servers.push(running.server);

    const health = await fetch(`${running.url}/api/health`);
    assert.equal(health.status, 200);

    const reviewRes = await fetch(new URL(apiHref({ kind: "review" }), `${running.url}/`));
    assert.equal(reviewRes.status, 200);
    const review = (await reviewRes.json()) as {
      coverage: { totalHunks: number; unassignedCount: number };
      groups: { id: string; why: string; hunkCount: number }[];
      document: { why?: string; title: string; summary: string };
      commits: { subject: string; body: string }[];
    };
    const reviewText = JSON.stringify(review.document);
    assert.equal(reviewText.includes(SECRET_ADD), false);
    assert.equal(reviewText.includes(SECRET_DEL), false);
    assert.equal(review.coverage.unassignedCount, 0);
    assert.equal(review.document.why, undefined);
    assert.equal(review.document.title, "All changes");
    assert.equal(review.document.summary, "Every hunk in the range.");
    assert.equal(review.groups[0]?.why, "Covers every hunk in the range.");
    assert.ok(review.coverage.totalHunks >= 4);
    assert.ok(review.commits.length >= 1);
    assert.equal(typeof review.commits[0]?.body, "string");
    assert.equal(review.commits[0]?.subject, "Split app hunks, rename util, widen Id");

    const group = document.groups[0];
    assert.ok(group);
    const hunksRes = await fetch(new URL(apiHref({ kind: "hunks", group: group.id }), `${running.url}/`));
    assert.equal(hunksRes.status, 200);
    const payload = (await hunksRes.json()) as {
      hunks: { path: string; lines: { text: string }[] }[];
      files: { path: string; patch: string; complete: boolean }[];
    };
    assert.ok(payload.hunks.length > 0);
    assert.ok(payload.files.length > 0);
    assert.equal(payload.files.every((file) => file.complete), true);
    assert.equal(payload.files[0]?.patch.startsWith("diff --git "), true);
    assert.equal(payload.files.some((file) => file.patch.includes("\nindex ")), true);

    const appGroup = document.groups.find((item) => item.hunkRefs.some((ref) => ref.path === "src/app.ts"));
    assert.ok(appGroup);
    const appHunks = await fetch(new URL(apiHref({ kind: "hunks", group: appGroup.id }), `${running.url}/`));
    const appPayload = (await appHunks.json()) as {
      hunks: { lines: { kind: string; text: string }[] }[];
      files: { path: string; patch: string }[];
    };
    const texts = appPayload.hunks.flatMap((hunk) => hunk.lines.map((line) => line.text)).join("\n");
    assert.equal(texts.includes(SECRET_ADD), true);
    const appPatch = appPayload.files.find((file) => file.path === "src/app.ts")?.patch;
    assert.ok(appPatch);
    assert.equal(appPatch.includes(`+${SECRET_ADD}`) || appPatch.includes(SECRET_ADD), true);
    assert.equal(appPatch.startsWith("diff --git "), true);

    const fileRes = await fetch(new URL(apiHref({ kind: "file", path: "src/app.ts", side: "new" }), `${running.url}/`));
    assert.equal(fileRes.status, 200);
    const file = (await fileRes.json()) as { content: string };
    assert.equal(file.content.includes(SECRET_ADD), true);

    const blameRes = await fetch(new URL(apiHref({ kind: "blame", path: "src/app.ts", side: "new" }), `${running.url}/`));
    assert.equal(blameRes.status, 200);
    const blame = (await blameRes.json()) as { lines: unknown[] };
    assert.ok(blame.lines.length > 0);

    const overviewMd = await fetch(new URL(apiHref({ kind: "agent-md", target: "overview" }), `${running.url}/`));
    assert.equal(overviewMd.status, 200);
    assert.match(overviewMd.headers.get("content-type") ?? "", /text\/markdown/);
    const overviewText = await overviewMd.text();
    assert.match(overviewText, /git diff --find-renames/);
    assert.match(overviewText, /All changes \(`all`\)/);
    assert.equal(overviewText.includes("+++"), false);

    const groupMd = await fetch(
      new URL(apiHref({ kind: "agent-md", target: "group", group: group.id }), `${running.url}/`),
    );
    assert.equal(groupMd.status, 200);
    assert.match(await groupMd.text(), /Review concern 01 of 01: All changes \(`all`\)/);

    const missingMd = await fetch(
      new URL(apiHref({ kind: "agent-md", target: "group", group: "nope" }), `${running.url}/`),
    );
    assert.equal(missingMd.status, 404);
  });

  it("keeps file contents at the SHAs captured when serve started", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-serve-pin-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const dataPath = join(root, "review.json");
    const index = await cmdIndex(repo.root, repo.base, repo.head);
    const document = await writeCoveringDocument(dataPath, index);
    document.source = { baseRef: repo.base, headRef: "HEAD", range: `${repo.base}...HEAD` };
    await writeFile(dataPath, `${JSON.stringify(document, null, 2)}\n`);

    const original = await showFile(repo.root, repo.head, "src/app.ts");
    const running = await startServer({ cwd: repo.root, dataPath, port: 0 });
    servers.push(running.server);

    await writeFile(join(repo.root, "src/app.ts"), "export const hijacked = true;\n");
    await git(repo.root, ["add", "src/app.ts"]);
    await git(repo.root, ["commit", "-m", "hijack app after serve"]);

    const reviewRes = await fetch(new URL(apiHref({ kind: "review" }), `${running.url}/`));
    assert.equal(reviewRes.status, 200);
    const review = (await reviewRes.json()) as { resolved: { headSha: string; headRef: string } };
    assert.equal(review.resolved.headRef, "HEAD");
    assert.equal(review.resolved.headSha, repo.head);

    const fileRes = await fetch(new URL(apiHref({ kind: "file", path: "src/app.ts", side: "new" }), `${running.url}/`));
    assert.equal(fileRes.status, 200);
    const file = (await fileRes.json()) as { content: string; ref: string };
    assert.equal(file.content, original);
    assert.equal(file.ref, repo.head);
    assert.equal(file.content.includes("hijacked"), false);
    assert.equal(file.content.includes(SECRET_ADD), true);

    const hunksRes = await fetch(new URL(apiHref({ kind: "hunks", group: document.groups[0]!.id }), `${running.url}/`));
    assert.equal(hunksRes.status, 200);
    const payload = (await hunksRes.json()) as { files: { path: string; patch: string }[] };
    const appPatch = payload.files.find((item) => item.path === "src/app.ts")?.patch;
    assert.ok(appPatch);
    assert.equal(appPatch.includes("hijacked"), false);
    assert.equal(appPatch.includes(SECRET_ADD), true);
  });

  it("marks a file incomplete when a group holds only some of its hunks", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-serve-subset-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const dataPath = join(root, "review.json");
    const index = await cmdIndex(repo.root, repo.base, repo.head);
    const document = await writeCoveringDocument(dataPath, index);
    const appHunks = index.hunks.filter((hunk) => hunk.path === "src/app.ts");
    assert.ok(appHunks.length >= 2);
    const first = appHunks[0];
    assert.ok(first);
    document.groups = [
      {
        id: "app-first",
        title: "First app hunk",
        why: "Only the first hunk of app.ts.",
        summary: "A subset of app.ts.",
        suggestedOrder: 0,
        hunkRefs: [first],
      },
      {
        id: "app-rest",
        title: "Remaining app hunks",
        why: "The rest of app.ts.",
        summary: "The other app.ts hunks.",
        suggestedOrder: 1,
        hunkRefs: appHunks.slice(1),
      },
    ];
    await writeFile(dataPath, `${JSON.stringify(document, null, 2)}\n`);

    const running = await startServer({ cwd: repo.root, dataPath, port: 0 });
    servers.push(running.server);

    const firstRes = await fetch(new URL(apiHref({ kind: "hunks", group: "app-first" }), `${running.url}/`));
    assert.equal(firstRes.status, 200);
    const firstPayload = (await firstRes.json()) as { files: { path: string; complete: boolean }[] };
    assert.equal(firstPayload.files.find((file) => file.path === "src/app.ts")?.complete, false);

    const restRes = await fetch(new URL(apiHref({ kind: "hunks", group: "app-rest" }), `${running.url}/`));
    assert.equal(restRes.status, 200);
    const restPayload = (await restRes.json()) as { files: { path: string; complete: boolean }[] };
    assert.equal(restPayload.files.find((file) => file.path === "src/app.ts")?.complete, false);
  });
});
