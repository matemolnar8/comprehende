# Export

Write a static site and put that folder where the user asked. `<cli>` is the CLI command SKILL.md uses: the pinned `npx` command, or the local executable the user named.

```sh
<cli> export --data "$REVIEW_DIR/review.json" --out "$EXPORT_DIR"
```

`$EXPORT_DIR` is a fresh directory outside the work tree, not a git repository. The folder is the UI plus frozen git payloads. There is no git in it. If `review.json` is still a draft, finish the Workflow through validate, then export. Done when the user has the URL or path they named.
