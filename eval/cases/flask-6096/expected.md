# flask-6096: Fix partition on IPv6 addresses

PR #6096, fixes issue #6093. Four review comments and three conversation comments.

## Story

- Title: the PR title.
- Why: present. Issue #6093 says partition breaks session_transaction and Flask.run with SERVER_NAME. PR body says fix two usages and links the issue. One story.
- Size: small. Four files and about 23 added lines. Two one line fixes with tests.
- Parts: one story. Groups: 1 or 2.

## Groups

1. Run with SERVER_NAME: `src/flask/app.py`, `tests/test_basic.py`. Urlsplit parses the name so IPv6 hosts work.
2. Session transaction cookies: `src/flask/testing.py`, `tests/test_testing.py`. Hostname comes from urlsplit with localhost fallback.

One group with all four files is best. The concern is one pattern in two places. Two groups split as above are also good.

## Must state

- SERVER_NAME with an IPv6 address and port parses to the right host and int port in Flask.run, covered for [::1]:8080.
- session_transaction keeps cookies for IPv6 base URLs because the cookie domain falls back to localhost instead of an empty string.

## Good to state

- The // prefix lets urlsplit read SERVER_NAME as a netloc. The author notes this choice in review comments.
- Host fallback is localhost when hostname is None. The author follows Werkzeug behavior here.
- Dev job failures are expected until the next Werkzeug release. The maintainer says so in conversation comments.

## Must not

- Do not make a group per file or per test file. Each test stays with its source.
- Do not add lookFor for resolved review notes or CI noise. No open concern remains.
- Do not invent motive beyond the issue and PR. One story covers both fixes.
- Do not repeat PR text as fact. Check each claim at head.

## Baseline

- First musecode run: 2 groups in the split shape, parts 0, size small, claims 0 of 2 at the old code level wording. The review stated both fixes, so the claims moved to reader takeaway level.
- Second musecode run: same shape, still 0 of 2. The review states locations and coverage but not outcomes. The misses read as thin lookFors plus a strict grader. Claims stay.
- Third musecode run: same shape, claims 1 of 2. One reworded takeaway lands.

## case.json

- `why` is present. Issue and PR name one story.
- `parts` 0 to 1. One story means zero or one part.
- `groups` 1 to 3. Story allows 1 or 2, with slack.
- `size` trivial or small. Best estimate is small.
- `sourceKinds` ticket and pr. Both name the story.
- `together` pairs each source with its test. This holds for one group and for two groups.
- No `apart`. No pair must stay apart in a good review.
- Added the two claims from Must state.
