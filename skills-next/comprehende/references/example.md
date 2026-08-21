# Example review.json

Pointers and prose only. The `@@` numbers must come from `comprehende index`, not from reading the patch. Shape: [review.schema.json](./review.schema.json).

`git` depends on `contracts`; both use `part` "Hunk identity". `docs` is a separate part. The ticket belongs to "Hunk identity". Ticket #12 names why this work exists, so document `why` is present. The README part does not cancel it. Document `summary` still names both stories. Each layer has its own `why`. `contracts` enables `git`. `docs` is a separate story.

```json
{
  "version": 1,
  "source": {
    "baseRef": "origin/main",
    "headRef": "HEAD",
    "range": "origin/main...HEAD"
  },
  "size": "small",
  "why": "The review document must not store a patch. Serve joins live git by hunk identity.",
  "summary": "Hunk identity contract and live git join, plus a separate README wording change.",
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
      "why": "Later layers join live git by hunk identity. That contract has to exist first.",
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
      "why": "#12 is the split: serve must join by those refs so the UI never stores a patch.",
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
      "why": "Separate story. The contract does not depend on this.",
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
