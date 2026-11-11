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

- `createProxyDispatcher` returns a SOCKS `Agent` only for an `ALL_PROXY` or `all_proxy` URL with a `socks`, `socks4`, `socks4a`, `socks5`, or `socks5h` scheme.
- SOCKS wins over `HTTP_PROXY` and `HTTPS_PROXY` when `ALL_PROXY` is a socks URL, so the PR body's "strict superset of the previous behavior" claim is false for users who set both.
- The SOCKS branch returns before `EnvHttpProxyAgent`, so `NO_PROXY` never bypasses the SOCKS proxy.
- The PR body's "23 unit tests" for `createProxyDispatcher` and "33" new proxy tests include the 5 existing `fetchWithProxy` redirect tests; head adds 18 dispatcher cases and 28 tests in total.

## Good

- An `ALL_PROXY` value with another scheme, such as `http://`, is ignored, and the `HTTP_PROXY` and `HTTPS_PROXY` variables decide.
- `parseSocksUrl` defaults the port to 1080 when the URL has none.
- The HTTP branch decides from the injected `env` but builds `EnvHttpProxyAgent()` with no arguments, so the proxy URLs come from `process.env`, not from `env`.
- `proxyDispatcher` is still built once at module load, so `fetchWithProxy` does not see proxy variables set after the module is imported.
- The lockfile diff only promotes `socks` from 2.8.6 to 2.8.9, which moves `ip-address` from 9.0.5 to 10.4.0 and drops `jsbn` 1.1.0 and `sprintf-js` 1.1.3.
- The integration test proxy answers non-CONNECT requests with 502 and a contract test pins that, which resolves pomeh's review comment about the unused `proxy-direct` body.
- The `fetchOnce` comment says the global `fetch` binding must stay because MSW patches `globalThis.fetch`.
- The redirect and error code in `proxy.ts` is unchanged; only the dispatcher line and one `fetchOnce` comment change.
- The SOCKS `connect` callback returns the raw SOCKS socket with no TLS, and the integration tests only fetch an `http://` origin.
- The SOCKS `connect` callback passes `Number(opts.port)` as the destination port, which is 0 for a URL with no explicit port, such as the default `https://ui.shadcn.com/r` registry.

## Must not

- Say PAC support, `PAC_URL`, or `pac-resolver` is part of this change.
- Say `ALL_PROXY=http://...` configures an HTTP proxy.
- Say the redirect logic, `getFailureReason`, or the `EnvHttpProxyAgent` gate on the four HTTP proxy variables changed.
- Say `NO_PROXY` applies to the SOCKS path.
- Write a group attention that asks for a test of `parseSocksUrl`, a lazy dispatcher, or a rename of `createProxyDispatcher`; a missing test, a refactor idea, and a nit are not attentions.
- Write a group question that asks why PAC support or the HTTP proxy handling is not in this change; the conversation comments move PAC to a follow-up and the HTTP proxy work to #10905.

## Notes

- The `NO_PROXY` gap is `Must` because the diff shows the early return and the PR matrix lists `NO_PROXY` bypass as unchanged, which is true only for the HTTP branch.
- The "strict superset" claim and the test counts are `Must` because the PR body says one thing and head does another.
- The `EnvHttpProxyAgent` with no arguments, the module-load timing, the missing TLS, and the port 0 are `Good` because they need undici knowledge or the unchanged lines around the hunk. undici skips its own TLS connector when an `Agent` gets a custom `connect` function, and it passes `port` as `""` for a URL with no port.
- `together` keeps `proxy.ts` with `proxy.test.ts`. The integration harness may sit in the same group or its own, so no pair checks it.
- `groups` 1 to 3: one group is best, two for a separate integration harness, three is slack. `parts` 0 to 1. `size` small or medium.
- Graders flagged summaries that listed paths and a group `lookFor` bullet that restated the test plan.
- Homes: the missing `NO_PROXY` bypass on the SOCKS path fits a `contract` or `risk` attention, and SOCKS winning over the HTTP variables fits a `contract` attention. Only one goes on the group; the other lives in the summary. The untouched redirect handling lives in the summary.
