# Refresh

Carry an existing review over to new commits or a rebase. Prose for a hunk that did not change stays as it is; only the groups the report names get new words. `<cli>` is the CLI command SKILL.md uses: the pinned `npx` command, or the local executable the user named. In PowerShell, `references/powershell.md` replaces the blocks below.

The previous document is the `review.json` the user names, or the `document` field of a hosted export's `api/review.json`. Copy it into a fresh directory first:

```sh
REVIEW_DIR=$(mktemp -d) && echo "$REVIEW_DIR" && node -e 'fetch(process.argv[1]).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((j) => require("fs").writeFileSync(process.argv[2], JSON.stringify(j.document, null, 2)))' "<site-url>/api/review.json" "$REVIEW_DIR/review.json"
```

1. One shell call: fetch the refs, refresh, and print the document. The refs default to the document's own `baseRef` and `headRef`, resolved again; pass `--head` or `--base` when the user names another. When the lower layer of a stack has merged and this request is still open, pass `--base` with the base branch the forge now reports.

   ```sh
   git fetch --quiet <remote> && {
     <cli> refresh --data "$REVIEW_DIR/review.json"
     cat "$REVIEW_DIR/review.json"
   }
   ```

   `refresh` keeps a hunk whose path and changed lines are the same, wherever it now starts, and re-points its ref. A hunk edited in place (same file, same region, other lines) is `changed` and keeps its group; when only whitespace moved it is `reformat`. A ref whose hunk left the diff is dropped. Every hunk no group covers lands in a draft `update` group with stub prose, and so does every new hunk under a directory ref. A focus range or note follows a `same` hunk to its new lines. One on a `changed` or `reformat` hunk is dropped, and the report names its group; one on a `gone` hunk is dropped. A file note stays while every hunk of its file is `same`. When its file gains, edits, or loses a hunk, the note is dropped and the report counts it; one on a file that left the diff is dropped. The report prints the new commit subjects, one line per file whose hunks changed (`new`, `changed`, `reformat`, `same`, `gone`, and the groups it sits in), and per group what moved. "nothing to refresh" means the refs still resolve to the commits the document names: fetch the right remote or name the head, then run it again. Done when the report and the document are in context.

2. Sources as in step 2 of the Workflow, appended to the step-1 shell call. The request body is read again, because document `lookFor` bullets cite it. A comment whose `url` is already in `sources` keeps its entry; copy only its current line and resolved state onto the pin. Read each new comment whole. Commit subjects are in the report. Done when the request body and every new comment and subject are in context.

3. One `show --hunk "<ref>"` per hunk the report marks `new` or `changed`, several per shell call, with `--base` and `--head` set to the new range; `show` reads only its first `--hunk`. When a call cuts its output, fetch the cut hunks again a few at a time. When one hunk is still cut, write `show` to `$REVIEW_DIR/show.txt` and read it in ranges. A `same` or `reformat` hunk is fetched only in a group the report names, when its `attention` rests on that hunk. Done when you have read the full `show` output of every `new` or `changed` hunk.

4. Edit `review.json` in place with your edit tool; untouched groups stay verbatim. Move each `update` ref into the group that holds its concern, or into a new group, then delete `update`. In a group the report names: rewrite `summary` when the new or changed hunks change what the group is; drop an `attention` whose hunks are `gone`; re-check an `attention` on a `changed` hunk against the fetched hunk; re-check each question the report counts, and when a new source answers it, put the answer in `why` and drop the question; write a dropped focus range, note, or file note again from the fetched hunk when that hunk still needs it. A group the report lists under `lookFor to convert to attention` gets its one judgment call as `attention`, and its `lookFor` field goes. A named group whose hunks keep their meaning, such as one with only `reformat` hunks, keeps its prose as it is. Delete a group that is `now empty`, and every `dependsOn` that names it. Retire a document `lookFor` bullet that a new commit resolves; a new comment asking for work the change does not do is a new bullet. `size` moves with the new burden; `title` and `why` change only when a source did. Done when `update` is gone, no group is empty, no stub prose remains, and every named group's prose matches the code at head.

5. Run `<cli> validate --data "$REVIEW_DIR/review.json"` and fix what it names, then step 7 of the Workflow: serve or export to the same place as before. Give the user the URL with `#changes` at the end: that page compares this review with the one `refresh` kept beside it.
