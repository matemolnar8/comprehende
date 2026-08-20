# Example review.json

Pointers and prose only. The `@@` numbers must come from `comprehende index`, not from reading the patch. Shape: [review.schema.json](./review.schema.json).

`git` depends on `contracts`; both use `part` "Hunk identity". `docs` is a separate part. The ticket belongs to "Hunk identity". There is no `walkthrough`. Independent stories must not share one smashed why. Overview shows the ticket as the why. Commit messages come from live git. A coding-agent transcript is another why source when you have one; it is not stored in this file.

```json
{
  "version": 1,
  "source": {
    "baseRef": "origin/main",
    "headRef": "HEAD",
    "range": "origin/main...HEAD"
  },
  "size": "small",
  "tickets": [
    {
      "id": "#12",
      "title": "Split the git index from the UI",
      "part": "Hunk identity"
    }
  ],
  "groups": [
    {
      "id": "contracts",
      "title": "Review document contract",
      "summary": "Hunk refs are identity; no patch fields on the document.",
      "part": "Hunk identity",
      "lookFor": [
        "Unknown fields on the document must fail validation.",
        "Foundation: later layers depend on these shapes."
      ],
      "suggestedOrder": 0,
      "hunkRefs": [
        {
          "path": "src/schema/types.ts",
          "oldStart": 1,
          "oldLines": 20,
          "newStart": 1,
          "newLines": 40
        }
      ]
    },
    {
      "id": "git",
      "title": "Live git join",
      "summary": "Serve-time diff is joined by (path, oldStart, newStart).",
      "part": "Hunk identity",
      "lookFor": ["Stale refs are flagged; git still wins."],
      "dependsOn": ["contracts"],
      "suggestedOrder": 1,
      "hunkRefs": [
        {
          "path": "src/git/diff.ts",
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
      "summary": "Docs only; the contract does not depend on this.",
      "part": "README",
      "lookFor": ["No code imports this file."],
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
