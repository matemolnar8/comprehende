# cigster-99: Multi-browser living-room E2E + rename visual→e2e (#98)

PR #99 implements ticket #98 in 15 commits. One bot comment (Netlify deploy preview), no review comments. The PR is mixed: the ticket story, the harness work that enables it, a production QR hook fix, a dependency refresh, and a standalone audit report.

## Story

- Title: the PR title, or a close paraphrase that names the living-room E2E and the rename.
- Why: either. When present, it comes from #98 (catch integration bugs that single-surface visual goldens cannot catch) and covers only the living-room story. The dependency refresh and the rename have no stated reason. Commit `45459d8` ties the QR fix to QR readiness before goldens, and commit `ecb9dfd` says the audit lists page-object refactors for an agent to implement.
- Size: large or very-large. The 135 pure moves, `pnpm-lock.yaml`, and the reordered `src/routeTree.gen.ts` add little burden, but about 2,000 lines of new page objects, the living-room spec and seed, and the new local Convex startup remain.
- Parts: about 5. The living-room story; the page objects with the visual specs migrated onto them, which can be their own refactor part or sit in the story part; the harness (rename, local Convex startup, platform snapshot folders), which can also sit inside the story part; the QR hook fix; the dependency refresh; the audit report. Groups: about 8.

## Groups

1. Page objects (foundation of the story): `e2e/pages/*` except `living-room.ts`, including `media.ts` (`prepareMediaPage`), `music-player.ts`, `types.ts`, and `e2e/pages/README.md`. The living-room night and the migrated visual specs both build on them. With group 3 it can be its own refactor part.
2. Living-room night (#98): `e2e/live/living-room.spec.ts`, `e2e/seed/living-room.ts`, `e2e/pages/living-room.ts`, and `e2e/seed/reset.ts` (`resetLivingRoomSeeds`). Depends on group 1 when they share a part.
3. Visual specs on page objects: `e2e/visual/*.spec.ts`, including the MusicBrainz pin in `admin.spec.ts`. Depends on group 1, same part.
4. Rename visual→e2e: `.github/workflows/e2e.yml`, `compose.yaml`, `e2e/docker/run.sh`, `e2e/docker/update-all.sh`, `e2e/docker/Dockerfile` (`E2E_DOCKER`, `CMD`), `.cursor/CLOUD.md`, `e2e/README.md`, `docs/css-modules-migration-plan.md`, `e2e/auth/global.setup.ts`, the script hunk of `package.json`.
5. Local Convex and env startup: `e2e/docker/server.sh`, `e2e/playwright.config.ts` (env file loading, `webServer`, `reuseExistingServer`), `e2e/seed/_run.ts`, `e2e/seed/_clerk-auth.ts`, `.dockerignore`. Groups 4 and 5 can merge into one harness group.
6. Platform snapshot folders (mechanical): the 135 pure moves to `e2e/snapshots/linux/`, `snapshotPathTemplate`, `.gitignore`, and the snapshot-path comment in `e2e/visual/_helpers.ts`. Last in its part.
7. QR hook fix: `src/lib/shared/useQRCodeSVG.ts`. Production code, its own part.
8. Dependency refresh: the dependency hunk of `package.json`, `pnpm-lock.yaml`, `.nvmrc`, the Playwright pin in `e2e/docker/Dockerfile`, `src/routeTree.gen.ts`. Independent policy work, its own part.
9. Page-object audit report: `docs/audits/e2e-pageobject-audit.html`. Independent documentation, last.

`package.json` has one hunk that holds both the script rename and the dependency refresh. The group that holds it names both.

The three changed goldens `tv-lobby-landscape.png`, `tv-break-landscape.png`, and `remote-break-portrait.png` under `e2e/snapshots/linux/` can sit in group 6 or group 7. Commit `45459d8` changed them together with the QR hook, the QR readiness waits in the page objects, and the Playwright bump.

## Must

- `src/lib/shared/useQRCodeSVG.ts` is production code in a PR whose ticket and PR body are about tests.
- The `useQRCodeSVG` effect now depends on the primitive option values instead of the `options` object, so a new `options` object on each render no longer regenerates the QR code.
- The PR says `pnpm test:e2e:ui` sets `E2E_UI=1` and skips the webServer, but at head nothing reads `E2E_UI` and the webServer still starts unless `E2E_HARNESS_ONLY=1`.
- The PR says to start `pnpm dev` before `pnpm test:e2e:ui`, but at head Playwright then fails on the busy port 3000 unless `E2E_REUSE_SERVER=1` is set.
- `e2e/docker/server.sh` deletes the repo's `.env.local` when it starts and again when it exits, so a developer's local settings in that file are lost.
- After the TV context closes, the host leaves the Remote shell only when something writes to the game, so the spec waits 12.5 seconds and sends a `pause` playback command to force that write.
- #98 asks that round mutations be rejected during break, but the living-room spec enters and resumes break without trying a round mutation.
- The dependency refresh upgrades runtime dependencies such as `convex` from 1.39.1 to ^1.43.0 and `@clerk/clerk-js` from 6.13.0 to ^6.27.1.
- No source asks for the dependency refresh.

## Good

- Every exact version in the `dependencies` and `devDependencies` of `package.json` becomes a caret range.
- The old docs told developers to keep their Clerk keys in `.env.local`, and the new README moves them to `.env`.
- `tv-lobby-landscape.png`, `tv-break-landscape.png`, and `remote-break-portrait.png` are deleted and added again under `e2e/snapshots/linux/` with new content, so they are changed goldens, not moves.
- The only caller of `useQRCodeSVG`, `QRCode`, passes just `width`, `margin`, and `color`, so the options the hook now drops change nothing today.
- After the TV closes, the host page keeps the Remote shell or a muted `MusicPlayer` (`muted={tvConnected}`) until the next game write, so host audio does not come back as #98 asks ("mute off when TV gone").
- #98 asks that root-cause sleeps and races be called out in the PR, but the PR body does not mention the 12.5 second wait or the forced `pause` write; only the spec comment and commit `5a0cd31` do.
- `src/routeTree.gen.ts` holds the same lines in a new order, so it is regenerated output with no route change.
- `@types/node` moves down from 25.5.0 to ^24.13.3, the only downgrade in the dependency refresh.
- The audit report predates commits `d8bc740` and `0880bab`, which already add its suggested `music-player.ts` and `errors.page.ts` modules.

## Must not

- Do not repeat the PR's `E2E_UI` note as what the code does.
- Do not call all snapshot changes identical moves; three PNGs have new content.
- Do not give the group that holds the `package.json` dependency hunk a title and summary that name only the rename.
- Do not describe the `pause` playback command as a fix for the app; it only forces a write so the stale host query runs again.
- Do not write a group attention that asks for a unit test of `useQRCodeSVG`, a rename of the page objects, or a shorter wait than 12.5 seconds; a missing test, a nit, and a fix idea are not attentions.
- Do not write a group question that asks why the living-room spec waits 12.5 seconds and sends `pause`; the spec comment and commit `5a0cd31` give the reason.

## Notes

- The `useQRCodeSVG` claim is Must because the diff shows a file under `src/` in a test PR and the comment in the hunk names the fresh `options` object. The note that the dropped options change nothing today is Good because it needs the caller in `src/components/shared/QRCode.tsx`.
- The muted host audio is Good because it needs `src/routes/game/host.$gameId.tsx`, which the diff does not touch. The Remote shell claim is Must because the spec comment and commit `5a0cd31` state the cause.
- The `E2E_UI` claim comes from commits `94eb489` and `7d22c29`; commit `8133348` removed the skip, and the PR body still describes it. `e2e/README.md` at head says `pnpm test:e2e:ui` uses the same webServer, which matches the code. The busy-port claim rests on the `reuseExistingServer` hunk in `e2e/playwright.config.ts`, which now defaults to false.
- The break claim compares #98 ("round mutations rejected") with `e2e/live/living-room.spec.ts`, where `remote.toggleBreak()` and `remote.resumeGame()` are the only break steps.
- The `.env.local` deletion affects host runs only. Docker runs copy the repo without `.env*` and mount only snapshots and reports.
- Commit `8fa1379` makes the dependency refresh and names it, but gives no reason. Commit `45459d8` gives a reason only for the Playwright pin in the Dockerfile: it aligns the image with `@playwright/test` 1.62.1.
- The page objects and the visual-spec migration could have been their own PR before the living-room spec, so a refactor part for them is fine, even though the living-room spec imports `HostPage`, `TvPage`, `RemotePage`, and `PlayerPage`. Past runs often called the three changed goldens pure moves.
- `parts` 3 to 8 has slack: the harness can fold into the story part, and the snapshot folders or the page objects with the visual-spec migration can stand alone. The QR fix is always its own part. `groups` 6 to 18 has the same slack: groups 4 and 5 can merge, and groups 1 and 3 can merge. Groups 1 and 3 hold over 20 files, so they can also split by surface, each page object with the visual spec that moved onto it, or by layer; past runs did both and reached 17 groups.
- `partsApart` keeps the audit report and the QR hook fix out of the living-room story part. The dependency refresh has no part expect, because no file stands for it alone: `pnpm-lock.yaml` sits in no group, `package.json` and the Dockerfile share a hunk with the rename, and `.nvmrc` can go with a harness that sits in the story part. The page objects and the harness have no part expect, because both homes are fine.
- `together` holds the living-room spec with its seed and factory. `apart` keeps the living-room spec away from the snapshot moves, the audit, and the migrated `admin.spec.ts`, the QR hook away from the snapshot moves, and the audit away from the page objects.
- Homes: the `.env.local` deletion fits a `risk` attention on the startup group, the 12.5 second wait and the forced `pause` write a `tradeoff` attention on the living-room group, and `useQRCodeSVG` and the dependency refresh a `product` attention on their own parts, or each group summary. The `E2E_UI`, busy-port, and break claims are document `lookFor` bullets, because each compares a source with head.
