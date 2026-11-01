# Example review.json

Optional filled sample. The field shape in `SKILL.md` is enough to write a document. Paths come from the `pregroup` draft, and so does `source`. When a file is split, `oldStart` and `newStart` come from that hunk's `@@` header.

- `login` depends on `cookie`. Both use `part` "Session cookie". The helper's test sits in `cookie` with the helper it checks.
- `docs` is a separate part, last in `suggestedOrder`, because it could have been its own pull request.
- Ticket #12 names why this work exists, so document `why` is present. Document `title` keeps the ticket title. Document `summary` names both stories. Document `parts` holds a one-sentence what per story. The why cites the ticket with `[#12](source:s1)`.
- `login` `summary` names how those hunks meet. `cookie` has a `contract` attention with its predicted trace, and `login` a `product` call. `docs` has no attention.
- `cookie` and `login` each ask one question about a choice that no source explains. Ticket #12 already says why cookies are HttpOnly, so no question asks that; the answer is in `why`.
- `session.ts` is an added file, so `cookie` has no `focus` range. `login` opens the long `login.ts` hunk on the lines where `rememberMe` reaches the helper; the caption says what to check there. Its note sits inside that range, on the line the code alone does not explain. Both copy line numbers from `show`.
- Document `lookFor` compares ticket #12 with the diff: work the ticket asks for that no hunk does, and an item done differently. Both cite `[#12](source:s1)`.
- A refactor idea (`parseCookie` could reuse `splitHeader`), a nit (`opts` is a vague name), and a missing test (expired cookies) are not in the document.
- Each group holds every hunk of its files, so each `hunkRefs` entry is a path. A split file uses `path@oldStart+newStart` (`old/path -> new/path@oldStart+newStart` when renamed). A directory of mechanical files the draft collapsed stays one `dir/` ref.

```json
{
  "version": 1,
  "source": {
    "baseRef": "origin/main",
    "headRef": "HEAD",
    "range": "origin/main...HEAD",
    "baseSha": "3f1c0a9d2b8e4c6f7a1b2c3d4e5f60718293a4b5",
    "headSha": "9b8a7c6d5e4f30211fedcba9876543210fedcba9"
  },
  "size": "small",
  "title": "HttpOnly session cookies",
  "why": "[#12](source:s1) requires login sessions that client scripts cannot read.",
  "summary": "`setSessionCookie` applies HttpOnly cookie options, and the login route uses it. The README documents this behavior.",
  "parts": [
    {
      "name": "Session cookie",
      "summary": "`setSessionCookie` applies HttpOnly cookie options, and the login route uses it."
    },
    {
      "name": "README",
      "summary": "The README documents the new session cookie behavior."
    }
  ],
  "sources": [
    {
      "id": "s1",
      "kind": "ticket",
      "label": "#12",
      "title": "HttpOnly session cookies",
      "gist": "Requires login sessions that client scripts cannot read.",
      "part": "Session cookie"
    }
  ],
  "lookFor": [
    "[#12](source:s1) also asks logout to clear the session cookie. No hunk touches `src/api/logout.ts`.",
    "[#12](source:s1) wants sessions that client scripts cannot read. Sessions issued before this change keep their old cookie until it expires; no hunk rotates them."
  ],
  "groups": [
    {
      "id": "cookie",
      "title": "Session cookie helper",
      "why": "The login route needs one helper to apply the session cookie options.",
      "summary": "`setSessionCookie` applies the required options to session cookies, and its test checks them.",
      "part": "Session cookie",
      "attention": {
        "kind": "contract",
        "note": "`setSessionCookie` throws when a caller passes `httpOnly: false`. A caller that needs a cookie scripts can read now fails at runtime."
      },
      "questions": ["Why does the helper set `SameSite=Lax` and not `Strict`?"],
      "suggestedOrder": 0,
      "hunkRefs": ["src/auth/session.ts", "src/auth/session.test.ts"]
    },
    {
      "id": "login",
      "title": "Login route",
      "why": "[#12](source:s1) requires HttpOnly session cookies. The route must set them through the helper.",
      "summary": "The login route in `login.ts` uses `setSessionCookie` from `session.ts`.",
      "part": "Session cookie",
      "sources": ["s1"],
      "attention": {
        "kind": "product",
        "note": "With `rememberMe = false` the cookie has no `Max-Age`, so the session ends when the browser closes. Decide whether that is the intended behavior."
      },
      "questions": [
        "Why does `rememberMe = false` drop `Max-Age` instead of setting a short expiry?"
      ],
      "focus": [
        {
          "path": "src/api/login.ts",
          "side": "new",
          "start": 40,
          "end": 52,
          "caption": "Check which `rememberMe` value reaches `setSessionCookie`; the rest of the hunk moves request parsing."
        }
      ],
      "notes": [
        {
          "path": "src/api/login.ts",
          "side": "new",
          "line": 47,
          "body": "`rememberMe` maps to `persistent`; the helper picks `Max-Age` from it."
        }
      ],
      "dependsOn": ["cookie"],
      "suggestedOrder": 1,
      "hunkRefs": ["src/api/login.ts"]
    },
    {
      "id": "docs",
      "title": "README wording",
      "why": "The README still describes the previous cookie behavior.",
      "summary": "The README section on sessions matches the new cookie behavior.",
      "part": "README",
      "suggestedOrder": 2,
      "hunkRefs": ["README.md"]
    }
  ]
}
```
