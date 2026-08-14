import type { LiveHunk } from "./types.ts";

export function hunksToUnifiedPatch(hunks: LiveHunk[]): string {
  const groups: { path: string; oldPath?: string; hunks: LiveHunk[] }[] = [];
  for (const hunk of hunks) {
    const existing = groups.find((group) => group.path === hunk.path);
    if (existing === undefined) {
      groups.push({ path: hunk.path, oldPath: hunk.oldPath, hunks: [hunk] });
    } else {
      existing.hunks.push(hunk);
    }
  }
  return groups.map(filePatch).join("");
}

function filePatch(group: { path: string; oldPath?: string; hunks: LiveHunk[] }): string {
  const oldPath = group.oldPath ?? group.path;
  const added = group.hunks.every((hunk) => hunk.oldStart === 0 && hunk.oldLines === 0);
  const deleted = group.hunks.every((hunk) => hunk.newStart === 0 && hunk.newLines === 0);
  const lines: string[] = [`diff --git a/${oldPath} b/${group.path}`];
  if (added) {
    lines.push("new file mode 100644");
    lines.push("--- /dev/null");
    lines.push(`+++ b/${group.path}`);
  } else if (deleted) {
    lines.push("deleted file mode 100644");
    lines.push(`--- a/${oldPath}`);
    lines.push("+++ /dev/null");
  } else {
    if (group.oldPath !== undefined) {
      lines.push(`rename from ${oldPath}`);
      lines.push(`rename to ${group.path}`);
    }
    lines.push(`--- a/${oldPath}`);
    lines.push(`+++ b/${group.path}`);
  }
  for (const hunk of group.hunks) {
    lines.push(hunk.header.startsWith("@@") ? hunk.header : hunkRangeFallback(hunk));
    for (const line of hunk.lines) {
      const prefix = line.kind === "add" ? "+" : line.kind === "del" ? "-" : " ";
      lines.push(`${prefix}${line.text}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

function hunkRangeFallback(hunk: LiveHunk): string {
  return `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`;
}
