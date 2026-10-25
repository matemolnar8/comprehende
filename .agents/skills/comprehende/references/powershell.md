# PowerShell

These blocks replace the POSIX blocks of Workflow steps 2 and 4 and of Refresh. Every other block in SKILL.md runs in PowerShell as written: `"$REVIEW_DIR/review.json"` expands the same way in both shells. `<cli>` is the CLI command SKILL.md uses: the pinned `npx` command, or the local executable the user named. The blocks run in Windows PowerShell 5.1 and in PowerShell 7.

- Each block starts with `[Console]::OutputEncoding = [Text.Encoding]::UTF8`, so paths and commit subjects print as git wrote them.
- Read files with `Get-Content -Raw -Encoding UTF8`. Write files with `[IO.File]::WriteAllText`; it writes UTF-8 with no BOM.
- When the execution policy blocks `npx.ps1`, call `npx.cmd`.

## Workflow step 2

The `if ($LASTEXITCODE -eq 0)` checks stop the block before `pregroup` when a ref does not resolve.

```powershell
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$REVIEW_DIR = Join-Path ([IO.Path]::GetTempPath()) "comprehende-$([guid]::NewGuid())"
New-Item -ItemType Directory $REVIEW_DIR | Out-Null
git rev-parse --verify --end-of-options "<base>^{commit}"
if ($LASTEXITCODE -eq 0) { git rev-parse --verify --end-of-options "<head>^{commit}" }
if ($LASTEXITCODE -eq 0) {
  npm view comprehende version
  <cli> pregroup --base <base> --head <head> --data "$REVIEW_DIR/review.json"
  <cli> digest --base <base> --head <head>
  Get-Content -Raw -Encoding UTF8 "$REVIEW_DIR/review.json"
  git log --format=%s --end-of-options <base>..<head>
  Get-ChildItem -File -LiteralPath "<sourcesDir>" | ForEach-Object {
    "=== $($_.FullName)"
    $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $_.FullName
    if ($text) { $text.Substring(0, [Math]::Min(10000, $text.Length)) }
  }
}
```

## Workflow step 4

A single-quoted here-string keeps `$` and backticks as text. The closing `'@` starts its line.

```powershell
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$document = @'
<the document>
'@
[IO.File]::WriteAllText("$REVIEW_DIR/review.json", $document)
<cli> validate --data "$REVIEW_DIR/review.json"
```

## Refresh: copy the previous document

Node reads the hosted export, so the copy needs no `curl` or `jq`.

```powershell
$REVIEW_DIR = Join-Path ([IO.Path]::GetTempPath()) "comprehende-$([guid]::NewGuid())"
New-Item -ItemType Directory $REVIEW_DIR | Out-Null
$REVIEW_DIR
node -e "fetch(process.argv[1]).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((j) => require('fs').writeFileSync(process.argv[2], JSON.stringify(j.document, null, 2)))" "<site-url>/api/review.json" "$REVIEW_DIR/review.json"
```

## Refresh step 1

```powershell
[Console]::OutputEncoding = [Text.Encoding]::UTF8
git fetch --quiet <remote>
if ($LASTEXITCODE -eq 0) {
  <cli> refresh --data "$REVIEW_DIR/review.json"
  Get-Content -Raw -Encoding UTF8 "$REVIEW_DIR/review.json"
}
```
