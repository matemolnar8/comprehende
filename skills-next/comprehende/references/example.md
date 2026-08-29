# Example review.json

Pointers and prose only. The `@@` numbers must come from `comprehende index`, not from reading the patch. Shape: [review.schema.json](./review.schema.json).

- `login` depends on `cookie`. Both use `part` "Session cookie".
- `docs` is a separate part, last in `suggestedOrder`, because it could have been its own pull request.
- Ticket #12 names why this work exists, so document `why` is present. Document `title` keeps the ticket title. Document `summary` names both stories. The why cites the ticket with `[#12](source:s1)`.
- `login` `summary` names how those hunks meet. `login` `lookFor` is a predicted trace. `docs` has no `lookFor`.

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
      "hunkRefs": [
        {
          "path": "src/auth/session.ts",
          "oldStart": 1,
          "oldLines": 20,
          "newStart": 1,
          "newLines": 40
        }
      ]
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
      "hunkRefs": [
        {
          "path": "src/api/login.ts",
          "oldStart": 10,
          "oldLines": 8,
          "newStart": 10,
          "newLines": 24
        }
      ]
    },
    {
      "id": "docs",
      "title": "README wording",
      "why": "The README still describes the previous cookie behavior.",
      "summary": "The README section on sessions matches the new cookie behavior.",
      "part": "README",
      "suggestedOrder": 2,
      "hunkRefs": [
        {
          "path": "README.md",
          "oldStart": 1,
          "oldLines": 4,
          "newStart": 1,
          "newLines": 8
        }
      ]
    }
  ]
}
```
