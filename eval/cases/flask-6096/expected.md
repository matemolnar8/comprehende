# flask-6096: Fix `.partition(":")` usage on potential IPv6 addresses

PR #6096 fixes issue #6093. Four author review comments and three conversation comments. A small bug fix in two places, each with a new test.

## Story

- Title: the PR title.
- Why: present. Issue #6093 says `.partition(":")` breaks `session_transaction` and `Flask.run()` with `SERVER_NAME` on IPv6 addresses. The PR body says it fixes two usages and links the issue. One story.
- Size: small. Four files and 23 added lines. Two short fixes, each with a test.
- Parts: one story, so zero or one part. Groups: 1 or 2.

## Groups

1. Run with an IPv6 `SERVER_NAME`: `src/flask/app.py`, `tests/test_basic.py`. `Flask.run` parses `SERVER_NAME` with `urlsplit`, and the new `test_run_from_config` case checks `[::1]:8080`.
2. Session transaction cookies on an IPv6 host: `src/flask/testing.py`, `tests/test_testing.py`. `session_transaction` takes the cookie domain from `urlsplit(...).hostname`, and `test_session_transaction_ipv6` checks it.

One group that holds all four files is equally good, because both hunks fix the same pattern for the same issue. Each test stays with the code it checks.

## Must

- `Flask.run` now parses `SERVER_NAME` with `urlsplit(f"//{server_name}")`, so `[::1]:8080` gives host `::1` and int port `8080`, where the old `partition(":")` split at the first colon inside the brackets.
- `session_transaction` now passes `urlsplit(ctx.request.host_url).hostname` as the cookie domain, so a base URL like `http://[::1]:8000/` stores the session cookie for `::1` and the next request sends it back, where the old `partition(":")[0]` gave `[`.
- The new `test_run_from_config` case `(None, None, "[::1]:8080", "::1", 8080)` and the new `test_session_transaction_ipv6` are the two failing tests from issue #6093.

## Good

- `sn_port` is now an `int` or `None`, so the check changes to `elif sn_port is not None` to keep `SERVER_NAME="localhost:0"` on port `0`, because `0` is falsy.
- The `//` prefix makes `urlsplit` read `SERVER_NAME` as a netloc; without it, `urlsplit("localhost:8080")` reads `localhost` as the scheme and returns no hostname or port.
- The `or "localhost"` fallback applies only when `hostname` is `None`, which happens for an empty host, and the author took it from the Werkzeug change the maintainer named.
- The removed `t.cast(str, host)` has no runtime effect; mypy reported it as redundant because `host` is already narrowed to `str`.
- `urlsplit(...).hostname` lowercases the host, so a mixed-case `SERVER_NAME` such as `MyHost:5000` now passes `myhost` to `run_simple`; no source mentions this.
- The "Development Versions" CI failure is not caused by this change; the maintainer says dev tests fail until the next Werkzeug release.

## Must not

- Do not say the `"localhost"` fallback is what makes IPv6 session cookies work; `hostname` strips the brackets and the port, and that is the fix.
- Do not say the old `Flask.run` started a server on a wrong host for `[::1]:8080`; the old code raised `ValueError` from `int(":1]:8080")` before `run_simple`.
- Do not put a test in a different group from the code it checks, or make one group per file.
- Do not split the change into two parts; one issue names both fixes as one story.
- Do not present the "Development Versions" CI failure as a defect of this change.

## Notes

The old expected outcome had a claim that IPv6 cookies work "because the cookie domain falls back to localhost". That causation is wrong, and it is now a `Must not`. The three past runs missed that claim every time, partly because it was false.

The `sn_port is not None` and `//` claims sit in `Good`. The diff and the author's review comments show them, but a reader who misses them does not misjudge the fix. The lowercase claim needs knowledge of `urlsplit` beyond the diff.

`groups` allows 3 as slack. A third group is unusual for four files, and `together` still catches a test that leaves its code. No `apart` pair: one group and two groups are both good, so no pair must stay apart.
