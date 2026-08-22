# Example review.json

Pointers and prose only. The `@@` numbers must come from `comprehende index`, not from reading the patch. Shape: [review.schema.json](./review.schema.json).

`login` depends on `cookie`; both use `part` "Session cookie". `docs` is a separate part, last in `suggestedOrder`, because it could have been its own pull request. The ticket belongs to "Session cookie". Ticket #12 names why this work exists, so document `why` is present. The README part does not cancel it. Document `summary` still names both stories. Each layer has its own `why`. `cookie` enables `login`. `login` `summary` names how those hunks meet. `login` `lookFor` is a predicted trace, a claim to check against live git. `docs` has no `lookFor`. The live diff is the whole story.

```json
{
  "version": 1,
  "source": {
    "baseRef": "origin/main",
    "headRef": "HEAD",
    "range": "origin/main...HEAD"
  },
  "size": "small",
  "why": "Session cookies must be HttpOnly so client scripts cannot read them.",
  "summary": "HttpOnly session cookie helper and login route, plus a separate README wording change.",
  "tickets": [
    {
      "id": "#12",
      "title": "HttpOnly session cookies",
      "part": "Session cookie"
    }
  ],
  "groups": [
    {
      "id": "cookie",
      "title": "Session cookie helper",
      "why": "Later layers set the cookie. The helper has to exist first.",
      "summary": "Cookie options live in `session.ts`. The login route calls `setSessionCookie`.",
      "part": "Session cookie",
      "lookFor": [
        "Breaking. Cookies without HttpOnly are rejected."
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
      "why": "#12 is the cookie. The route must use the helper so the session is never readable from script.",
      "summary": "The login route in `login.ts` sets the session through `setSessionCookie`.",
      "part": "Session cookie",
      "lookFor": [
        "Trace a login with remember-me off: old path set a readable cookie, new path sets HttpOnly and omits Max-Age."
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
      "why": "Separate story. The cookie does not depend on this.",
      "summary": "Docs only. The cookie does not depend on this.",
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
