# cigster-99: Multi-browser living-room E2E + rename visual→e2e (#98)

PR #99 implements ticket #98. One bot comment (Netlify deploy preview), no review comments. The PR is mixed: the ticket story, the harness work that enables it, a production QR hook fix, a dependency refresh, and a standalone audit report.

## Story

- Title: the PR title, or a close paraphrase that names the living-room E2E and the rename.
- Why: either. When present, it comes from #98 (catch integration bugs that single-surface visual goldens cannot catch) and covers only the living-room story. The rename, the dependency refresh, the QR fix, and the audit have no source motive.
- Size: very-large. The 135 pure moves, `pnpm-lock.yaml`, and the reordered `src/routeTree.gen.ts` add little burden, but about 2,000 lines of new page objects, the living-room spec and seed, and the new local Convex startup remain.
- Parts: about 5. The living-room story with the page objects it imports; the harness (rename, local Convex startup, platform snapshot folders), which can also sit inside the story part; the QR hook fix; the dependency refresh; the audit report. Groups: about 8.

## Groups

1. Page objects (foundation of the story): `e2e/pages/*` except `living-room.ts`, including `media.ts` (`prepareMediaPage`), `music-player.ts`, `types.ts`, and `e2e/pages/README.md`. The living-room night and the migrated visual specs both build on them.
2. Living-room night (#98): `e2e/live/living-room.spec.ts`, `e2e/seed/living-room.ts`, `e2e/pages/living-room.ts`, and `e2e/seed/reset.ts` (`resetLivingRoomSeeds`). Depends on group 1, same part.
3. Visual specs on page objects: `e2e/visual/*.spec.ts`, including the MusicBrainz pin in `admin.spec.ts`. Depends on group 1, same part.
4. Rename visual→e2e: `.github/workflows/e2e.yml`, `compose.yaml`, `e2e/docker/run.sh`, `e2e/docker/update-all.sh`, `e2e/docker/Dockerfile` (`E2E_DOCKER`, `CMD`), `.cursor/CLOUD.md`, `e2e/README.md`, `docs/css-modules-migration-plan.md`, `e2e/auth/global.setup.ts`, `e2e/visual/_helpers.ts`, the script hunk of `package.json`.
5. Local Convex and env startup: `e2e/docker/server.sh`, `e2e/playwright.config.ts` (env file loading, `webServer`, `reuseExistingServer`), `e2e/seed/_run.ts`, `e2e/seed/_clerk-auth.ts`, `.dockerignore`. Groups 4 and 5 can merge into one harness group.
6. Platform snapshot folders (mechanical): the 135 pure moves to `e2e/snapshots/linux/`, `snapshotPathTemplate`, `.gitignore`. Last in its part.
7. QR hook fix: `src/lib/shared/useQRCodeSVG.ts` and the three changed goldens `tv-lobby-landscape.png`, `tv-break-landscape.png`, `remote-break-portrait.png` under `e2e/snapshots/linux/`. Production code, its own part.
8. Dependency refresh: the dependency hunk of `package.json`, `pnpm-lock.yaml`, `.nvmrc`, the Playwright pin in `e2e/docker/Dockerfile`, `src/routeTree.gen.ts`. Independent policy work, its own part.
9. Page-object audit report: `docs/audits/e2e-pageobject-audit.html`. Independent documentation, last.

`package.json` has one hunk that holds both the script rename and the dependency refresh. The group that holds it names both.

## Must

- `src/lib/shared/useQRCodeSVG.ts` is production code in a PR whose sources are about tests.
- The `useQRCodeSVG` effect now depends on the primitive option values instead of the `options` object, so a new `options` object on each render no longer regenerates the QR code.
- The PR says `pnpm test:e2e:ui` sets `E2E_UI=1` and skips the webServer, but at head nothing reads `E2E_UI` and the webServer still starts unless `E2E_HARNESS_ONLY=1`.
- `e2e/docker/server.sh` deletes the repo's `.env.local` when it starts and again when it exits, so a developer's local settings in that file are lost.
- After the TV context closes, the host leaves the Remote shell only when something writes to the game, so the spec waits 12.5 seconds and sends a `pause` playback command to force that write.
- Every pinned dependency in `package.json` becomes a caret range and most move to newer versions.
- No source asks for the dependency refresh; it is policy work beside the ticket story.

## Good

- Starting `pnpm dev` first, as the PR note says, makes Playwright fail on the busy port 3000 unless `E2E_REUSE_SERVER=1` is set.
- The old docs told developers to keep their Clerk keys in `.env.local`, and the new README moves them to `.env`.
- `tv-lobby-landscape.png`, `tv-break-landscape.png`, and `remote-break-portrait.png` are deleted and added again under `e2e/snapshots/linux/` with new content, so they are changed goldens, not moves.
- `useQRCodeSVG` now forwards only `width`, `margin`, and `color` to `QRCodeLib.toString` and drops a stale result through a `cancelled` flag, and its only caller `QRCode` passes just those options, so the dropped options change nothing today.
- The host page passes `muted={tvConnected}` to `MusicPlayer`, so after the TV closes the host audio stays muted until the next game write, while the ticket asks for "mute off when TV gone" and the spec does not check the mute.
- The ticket asks that root-cause sleeps and races be called out in the PR, and the PR body does not mention the 12.5 second wait or the forced playback write; only the spec comment does.
- `src/routeTree.gen.ts` holds the same lines in a new order, so it is regenerated output with no route change.
- `.nvmrc` is set to `lts/*`, and `@types/node` moves down from 25.5.0 to ^24.13.3 inside the dependency refresh.

## Must not

- Do not repeat the PR's `E2E_UI` note as what the code does.
- Do not call all snapshot changes identical moves; three PNGs have new content.
- Do not put the page objects in a different part from the living-room spec that imports `HostPage`, `TvPage`, `RemotePage`, and `PlayerPage`, and do not chain groups across parts with `dependsOn`.
- Do not fold the dependency refresh into a group titled as the rename without naming it.
- Do not describe the `pause` playback command as a fix for the app; it only forces a write so the stale host query runs again.

## Notes

- The `useQRCodeSVG` claim is Must because the diff shows a file under `src/` in a test PR and the comment in the hunk names the fresh `options` object. The note that the dropped options change nothing today is Good because it needs the caller in `src/components/shared/QRCode.tsx`.
- The muted host audio is Good because it needs `src/routes/game/host.$gameId.tsx`, which the diff does not touch. The Remote shell claim is Must because the spec comment and commit `5a0cd31` state the cause.
- The `E2E_UI` claim comes from commits `94eb489` and `7d22c29`; commit `8133348` removed the skip, and the PR body still describes it. `e2e/README.md` at head says `pnpm test:e2e:ui` uses the same webServer, which matches the code.
- The `.env.local` deletion affects host runs only. Docker runs copy the repo without `.env*` and mount only snapshots and reports.
- Past runs often put the page objects in their own part while the living-room factory imports them, and often called the three changed goldens pure moves.
- `parts` 3 to 8 has slack: the harness can fold into the story part, and the snapshot folders, the QR fix, or the visual-spec migration can stand alone. `groups` 6 to 11 has the same slack: groups 4 and 5 can merge, and groups 1 and 3 can merge.
- `together` holds the living-room spec with its seed and factory. `apart` keeps the living-room spec away from the snapshot moves, the audit, and the migrated `admin.spec.ts`, the QR hook away from the snapshot moves, and the audit away from the page objects.
