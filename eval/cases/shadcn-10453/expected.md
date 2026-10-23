# shadcn-10453: Add SOCKS proxy support

PR #10453. No linked ticket file; the body says the work is part of the gap tracked in #5952. Ten review comments and eleven issue comments. The PR was rescoped twice: the undici swap and HTTP proxy handling shipped in #10905, and PAC support was removed to a follow-up at the maintainer's request.

## Story

- Title: the PR title.
- Why: present, from the PR body. The registry HTTP stack has no SOCKS support, the most requested gap in proxy coverage.
- Size: small or medium. The code change is one factory of about 80 lines in `proxy.ts`. The 380 added test lines include a hand-rolled SOCKS5 server, which reads slower than the code.
- Parts: one story. Groups: 1 or 2.

## Groups

1. SOCKS dispatcher and its tests: `packages/shadcn/src/registry/proxy.ts`, `packages/shadcn/src/registry/proxy.test.ts`, `packages/shadcn/src/registry/proxy.integration.test.ts`, the `socks` line in `packages/shadcn/package.json`, and `.changeset/socks-proxy-support.md`. The unit tests call the factory directly and the integration tests route real requests through it. A review may hold the integration harness in a second group, since it adds local CONNECT and SOCKS5 servers that are a read of their own.
2. `pnpm-lock.yaml` has no hunk refs and sits in no group. The CLI leaves lockfiles out of the draft.

## Must

- `createProxyDispatcher` returns a SOCKS `Agent` only when `ALL_PROXY` or `all_proxy` holds a URL with scheme `socks`, `socks4`, `socks4a`, `socks5`, or `socks5h`. Any other `ALL_PROXY` value is ignored and the `HTTP_PROXY` and `HTTPS_PROXY` variables decide.
- SOCKS wins when `ALL_PROXY` holds a socks URL and an HTTP proxy variable is also set, because the factory checks `ALL_PROXY` first.
- `fetchWithProxy`, `fetchOnce`, and `getFailureReason` are the same as at base apart from the module-level dispatcher now coming from `createProxyDispatcher()` and one comment in `fetchOnce`, so the cross-origin redirect handling from #11196 is untouched.
- The SOCKS branch has no `NO_PROXY` bypass. Only `EnvHttpProxyAgent` honors `no_proxy`, and the factory returns the SOCKS `Agent` before that branch, so every request goes through the SOCKS proxy when `ALL_PROXY` is a socks URL.

## Good

- `parseSocksUrl` defaults the port to 1080 and maps URL user info to `userId` and `password` after `decodeURIComponent`.
- The HTTP branch tests the injected `env` to decide, but constructs `EnvHttpProxyAgent` with no arguments, so the agent itself reads `process.env` at request time.
- `proxyDispatcher` is still built once at module load, so `fetchWithProxy` does not see proxy variables set after the module is imported.
- The lockfile diff is only the `socks` promotion: `socks` 2.8.6 to 2.8.9, `ip-address` 9.0.5 to 10.4.0, and the dropped `jsbn` and `sprintf-js` 1.1.3 transitives.
- The integration test proxy answers non-CONNECT requests with 502 and a contract test pins that, which resolves pomeh's review comment about the unused `proxy-direct` body.
- The `fetchOnce` comment says the global `fetch` binding must stay because MSW patches `globalThis.fetch`.

## Must not

- Say PAC support, `PAC_URL`, or `pac-resolver` is part of this change.
- Say `ALL_PROXY=http://...` configures an HTTP proxy.
- Say the HTTP proxy handling, the redirect logic, or `getFailureReason` changed.
- Split `proxy.ts` from `proxy.test.ts`, or make one group per file.
- Say `NO_PROXY` applies to the SOCKS path.

## Notes

- The `NO_PROXY` gap is `Must` because the diff shows the early return and the PR matrix lists `NO_PROXY` bypass as unchanged, which is true only for the HTTP branch.
- The `EnvHttpProxyAgent` with no arguments and the module-load timing are `Good` because they need undici knowledge or the unchanged lines around the hunk.
- `groups` 1 to 3: one group is best, two for a separate integration harness, three is slack. `parts` 0 to 1. `size` small or medium.
- Past runs stated the three old claims in 1 of 3 runs or fewer. Graders flagged summaries that listed paths and a `lookFor` that restated the test plan.
