# Example review.json

Pointers and prose only. The `@@` numbers must come from `comprehende index`, not from reading the patch. Shape: [review.schema.json](./review.schema.json).

```json
{
  "version": 1,
  "source": {
    "baseRef": "origin/main",
    "headRef": "HEAD",
    "range": "origin/main...HEAD"
  },
  "walkthrough": "Hunk refs are identity; serve joins live git.",
  "size": "small",
  "tickets": [{ "id": "#12", "title": "Split the git index from the UI" }],
  "groups": [
    {
      "id": "contracts",
      "title": "Review document contract",
      "summary": "Hunk refs are identity; no patch fields on the document.",
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
    }
  ]
}
```
