# cigster-84: Clerk user fixtures with automatic cleanup

PR #84, closes ticket #82. No review comments.

## Story

- Title: the PR title. Dropping the `test(e2e):` prefix is fine.
- Why: present, from #82. Visual runs in Docker and CI skipped Clerk user deletion, and that filled the Clerk user quota.
- Size: medium. The 20 PNG files are a mechanical rebaseline.
- Parts: one story. Two are acceptable when the synthetic identity work is its own part. Groups: 4 to 6.

## Groups

1. Clerk fixtures: `e2e/auth/fixtures.ts`, `e2e/auth/clerk.ts`, `e2e/visual/clerk-fixture.spec.ts`, `e2e/playwright.config.ts`.
2. Signed-in suites use fixtures: `e2e/visual/admin.spec.ts`, `e2e/visual/host.spec.ts`, `e2e/visual/chrome.spec.ts`, `e2e/seed/admin.ts`, `e2e/seed/host.ts`.
3. Anonymous seeds use a synthetic identity: `e2e/seed/solo.ts`, `e2e/seed/import.ts`, `e2e/seed/player.ts`, and the Clerk cleanup removed from `ingest.spec.ts`, `player.spec.ts`, `solo-play.spec.ts`.
4. Convex teardown always runs: `e2e/visual/_helpers.ts` and the `shouldResetVisualSeeds()` checks removed from the specs. This can merge with group 3 because those spec hunks hold both changes.
5. Golden rebaseline (mechanical, last): the 20 `e2e/snapshots/*.png` files.
6. `e2e/README.md`. This can merge into the groups it documents.

## Must state

- The ticket asks to keep the Convex seed reset skippable in Docker and CI. The change removes `shouldResetVisualSeeds`, so Convex teardown always runs. No source gives a reason.
- Anonymous solo, import, and player seeds no longer create Clerk users. They use a synthetic identity instead. The ticket does not ask for this, but it lowers Clerk use.
- The signed-in chrome tests now fail when a Clerk user cannot be created. Before, they were skipped outside CI.

## Good to state

- The golden PNGs change only because the synthetic seed shows the creator line "by Visual Seed".
- The ticket's optional safety net (sweep users left by a killed run) is not done. A killed run still leaks Clerk users.

## Must not

- Do not cite #82 as the reason Convex teardown always runs. The ticket asks for the opposite.
- Do not list each optional ticket item that is not done as its own bullet.
- Do not chain the goldens or the README to other groups with `dependsOn`.

## Baseline

- 0 of 6 runs stated the Convex reset deviation. 5 of 6 cited #82 as the reason teardown always runs.
- Runs made 5 to 11 groups. The larger ones split each spec into its own group.
- 3 of 6 runs noted the chrome skip-to-fail change.

## case.json

- `parts` max 3 to 2.
- `together`: the fixture and its smoke spec.
- `mechanicalPaths`: two of the rebaselined PNGs, so the goldens stay in one group.
- Added the chrome claim.
