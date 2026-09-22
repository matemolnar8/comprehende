# Example review.json

Pointers and prose only. Paths come from `comprehende review`. When a file is split, `oldStart` and `newStart` come from that hunk's `@@` header.

- `login` depends on `cookie`. Both use `part` "Session cookie".
- `docs` is a separate part, last in `suggestedOrder`, because it could have been its own pull request.
- Ticket #12 names why this work exists, so document `why` is present. Document `title` keeps the ticket title. Document `summary` names both stories. Document `parts` holds a one-sentence what per story. The why cites the ticket with `[#12](source:s1)`.
- `login` `summary` names how those hunks meet. `login` `lookFor` is a predicted trace. `docs` has no `lookFor`.
- Document `lookFor` compares ticket #12 with the diff: work the ticket asks for that no hunk does, and one claim about the whole change. Both cite `[#12](source:s1)`. Group `lookFor` stays inside its hunks.
- Each group holds every hunk of its file, so each `hunkRefs` entry is that path. A split file uses `path@oldStart+newStart` (`old/path -> new/path@oldStart+newStart` when renamed). The object form still validates.

```json
{
  "version": 1,
  "source": {
    "baseRef": "origin/main",
    "headRef": "HEAD",
    "range": "origin/main...HEAD"
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
    "Subtle. [#12](source:s1) wants sessions that client scripts cannot read. Sessions issued before this change keep their old cookie until it expires; no hunk rotates them."
  ],
  "groups": [
    {
      "id": "cookie",
      "title": "Session cookie helper",
      "why": "The login route needs one helper to apply the session cookie options.",
      "summary": "`setSessionCookie` applies the required options to session cookies.",
      "part": "Session cookie",
      "lookFor": [
        "Breaking. `setSessionCookie` throws when the caller passes `httpOnly: false`."
      ],
      "suggestedOrder": 0,
      "hunkRefs": ["src/auth/session.ts"]
    },
    {
      "id": "login",
      "title": "Login route",
      "why": "[#12](source:s1) requires HttpOnly session cookies. The route must set them through the helper.",
      "summary": "The login route in `login.ts` uses `setSessionCookie` from `session.ts`.",
      "part": "Session cookie",
      "sources": ["s1"],
      "lookFor": [
        "For `rememberMe = false`, compare the cookie: old code permits script access; new code sets `HttpOnly` and omits `Max-Age`."
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
