# shadcn-10453: Add SOCKS proxy support

PR #10453 adds SOCKS4 and SOCKS5 support through ALL_PROXY. There is no linked issue file. Sources are the PR body, 10 review comments and 11 issue comments. The body says earlier proxy work shipped in other PRs and PAC moved to a follow up.

## Story

- Title: the PR title.
- Why: present, from the PR and its comments. Users need SOCKS proxy coverage in the CLI registry stack. The PR and supporting comments name this gap.
- Size: small or medium. The diff adds 485 lines and removes 32 across 6 files. Most added lines are unit and integration tests, so the burden reads below the line count.
- Parts: one story. Groups: 2.

## Groups

1. SOCKS feature: `packages/shadcn/src/registry/proxy.ts`, `packages/shadcn/src/registry/proxy.test.ts`, `packages/shadcn/src/registry/proxy.integration.test.ts`, `.changeset/socks-proxy-support.md`, the `socks` line in `packages/shadcn/package.json`. The tests check the new factory, so they sit with the code.
2. Lockfile (mechanical, last): `pnpm-lock.yaml`. It moves `socks` from 2.8.6 to 2.8.9 and updates `ip-address`. It drops two unused transitives. The reader can skip it.

## Must state

- ALL_PROXY triggers the SOCKS branch only for socks schemes and a non socks value falls through to HTTP_PROXY or HTTPS_PROXY.
- SOCKS wins when ALL_PROXY socks and HTTP proxy vars are both set.
- fetchWithProxy, fetchOnce and getFailureReason match main apart from the dispatcher swap and one comment, so the redirect hardening is untouched.

## Good to state

- The parser accepts socks, socks4, socks4a, socks5 and socks5h. It defaults the port to 1080. It maps user info to SOCKS auth.
- fetchOnce keeps the global fetch binding so MSW can patch it. A code comment says this.
- The diff keeps the stated scope. It does not repeat the shipped HTTP handling or redirect work. It adds no PAC code.
- The SOCKS branch has no NO_PROXY bypass. EnvHttpProxyAgent honors no_proxy, but the SOCKS return happens first. Verified at head.
- The HTTP branch reads the injected env to decide, but constructs EnvHttpProxyAgent with no arguments. Routing follows process.env while unit tests assert only the agent class. Verified at head.

## Must not

- Do not put either test file in its own group. Both test the one factory.
- Do not link the lockfile group to the feature with dependsOn. It is generated output.
- Do not describe PAC support as part of this change. PAC was removed to a follow up.
- Do not say HTTP proxy handling changed. It still returns the same EnvHttpProxyAgent.

## Baseline

- First musecode run: 3 groups, parts 0, size medium, claims 1 of 3. No expects change.
- Second musecode run: 2 groups, parts 0, size small, claims 1 of 3. Size widened to small. Large dropped with no run behind it.
- Third musecode run: 2 groups, parts 0, size medium, claims 0 of 3.

## case.json

- `why` is present and `sourceKinds` lists pr and pr-comment. The PR names the SOCKS gap and reviewers discuss it.
- `parts` 0 to 1. This is one story, so groups carry no part or one part.
- `groups` 1 to 3. Two is best, with slack for a merged lockfile or split tests.
- `size` is small or medium. Both runs landed inside, one each side.
- `together` holds proxy.ts with proxy.test.ts. The unit test checks the factory directly.
- `apart` holds proxy.ts with pnpm-lock.yaml. The lockfile is a trailing mechanical group.
- Three claims cover SOCKS selection, priority and the untouched redirect path.
