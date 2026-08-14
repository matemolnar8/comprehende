# ReviewDocument schema

`version` is `1`. Additional properties are rejected so patch text cannot sneak in.

Identity of a hunk: `(path, oldStart, newStart)` and `oldPath` when the file was renamed.

```ts
type ReviewDocument = {
  version: 1
  source: {
    baseRef: string
    headRef: string
    range?: string
  }
  walkthrough?: string
  tickets?: { id: string; url?: string; title?: string }[]
  groups: ReviewGroup[]
}

type ReviewGroup = {
  id: string
  title: string
  summary: string
  lookFor?: string[]
  dependsOn?: string[]
  suggestedOrder: number
  hunkRefs: HunkRef[]
}

type HunkRef = {
  path: string
  oldPath?: string
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
}
```

- `summary`: one sentence (the intent of the layer).
- `lookFor`: scannable bullets. Not a paragraph.
- `dependsOn`: ids of earlier layers in the stack.
- `walkthrough`: optional one-or-two sentence read of the whole change.

JSON Schema in the package: `src/schema/review.schema.json`.

`comprehende index` prints `{ source, hunks, skipped }` where `hunks` are `HunkRef`s. Copy those objects into groups. Do not add `patch`, `lines`, `diff`, or file bodies.
