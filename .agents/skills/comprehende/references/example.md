# Example review.json

Pointers and prose only. The `@@` numbers must come from `comprehende index`, not from reading the patch.

```json
{
  "version": 1,
  "source": {
    "baseRef": "origin/main",
    "headRef": "HEAD",
    "range": "origin/main...HEAD"
  },
  "tickets": [{ "id": "#12", "title": "Split the git index from the UI" }],
  "groups": [
    {
      "id": "contracts",
      "title": "Review document contract",
      "summary": "Hunk refs are identity; no patch fields on the document.",
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
