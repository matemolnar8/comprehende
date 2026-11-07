# cigster-144: Cloud agent environment fixes from the retro

PR #144. No ticket, no comments. One retro over 14 cloud-agent runs motivates four independent items: a stricter golden threshold with the paint fixes it exposed, an approval policy document, a CI workflow that builds the cloud agent image, and agent steering docs.

## Story

- Title: the PR title.
- Why: present. The PR body says it implements items from a retro over the last 14 cloud-agent runs.
- Size: medium to very-large. Most files are regenerated golden PNGs.
- Parts: three to five. The golden threshold work, `APPROVAL_POLICY.md`, the image workflow, and the steering docs could each have been its own PR.
- Groups: 4 to 8. The regenerated goldens are a trailing mechanical group of the golden part.

## Groups

1. Stricter goldens: `e2e/playwright.config.ts`, `e2e/expect.ts`, the seed and visual spec edits, and the paint fixes they exposed.
2. Regenerated goldens: `e2e/snapshots/linux/*.png`, mechanical, last in the golden part.
3. Approval policy: `APPROVAL_POLICY.md`.
4. Cloud agent image CI: `.github/workflows/cloud-agent-image.yml`.
5. Steering: `.cursor/BUGBOT.md`, `.cursor/CLOUD.md`, `AGENTS.md`, `.oxlintrc.json`, `e2e/README.md`.

## Must

- The golden threshold drops from `maxDiffPixelRatio: 0.01` to `0.0003`, and the PR regenerates the goldens.
- A new `Cloud Agent image` workflow builds `.cursor/Dockerfile` when the Dockerfile, `.dockerignore`, `daemon.json`, or `environment.json` changes.
- `APPROVAL_POLICY.md` is a new standalone policy document.
- The golden work, the approval policy, and the image workflow are separate parts with their own `parts[]` entries.

## Good

- `.oxlintrc.json` adds a lint rule against `test.skip`, and `AGENTS.md` drops the lines that lint now enforces.

## Must not

- Do not put the whole PR in one part because one retro motivates it.
- Do not put the regenerated PNGs in the approval policy or image workflow part.

## Notes

- This case checks that items under one retro become separate parts.
