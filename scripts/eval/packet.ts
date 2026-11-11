import { writeFile } from "node:fs/promises";
import { hunksPayload, type ReviewContext } from "../../src/api/live.ts";
import type { ApiCommit, ApiGroupFile } from "../../src/api/types.ts";
import { listCommits } from "../../src/git/log.ts";
import { focusAnchor, formatAnchor, noteAnchor, noteLetter } from "../../src/schema/anchor.ts";
import type { ReviewDocument } from "../../src/schema/types.ts";

export async function writeGradingPacket(
  ctx: ReviewContext,
  frozen: unknown[],
  outPath: string,
): Promise<string> {
  // `ctx.commits` also lists commits that only the base has. From the merge base the log is
  // `base..head`, the commits the producer reads.
  const commits = await listCommits(ctx.cwd, ctx.mergeBaseSha, ctx.resolved.headSha);
  const markdown = gradingPacket(ctx, frozen, commits);
  await writeFile(outPath, markdown);
  return markdown;
}

export function gradingPacket(ctx: ReviewContext, frozen: unknown[], commits: ApiCommit[]): string {
  const document = ctx.document;
  const parts: string[] = [
    `# ${document.title}`,
    "",
    `Size: ${document.size}`,
    `Why: ${document.why ?? "(omitted)"}`,
    `Summary: ${document.summary}`,
  ];
  if (document.parts !== undefined && document.parts.length > 0) {
    parts.push(
      `Parts:\n${document.parts.map((part) => `- ${part.name}: ${part.summary}`).join("\n")}`,
    );
  }
  parts.push(
    lookForBlock("Document lookFor", document.lookFor),
    "",
    "## Sources in the review document",
    "",
    sourceBlock(document),
    "",
    "## Frozen sources the producer was given",
    "",
    "```json",
    JSON.stringify(frozen, null, 2),
    "```",
    "",
    "## Commits in the range",
    "",
    commitBlock(commits),
    "",
    "## Groups",
    "",
  );
  const groups = [...document.groups].sort(
    (a, b) => a.suggestedOrder - b.suggestedOrder || a.id.localeCompare(b.id),
  );
  for (const group of groups) {
    const payload = hunksPayload(ctx, group.id);
    parts.push(`### ${group.title} (\`${group.id}\`)`);
    parts.push("");
    if (group.part !== undefined) {
      parts.push(`Part: ${group.part}`);
    }
    if (group.dependsOn !== undefined && group.dependsOn.length > 0) {
      parts.push(`dependsOn: ${group.dependsOn.join(", ")}`);
    }
    parts.push(`Why: ${group.why ?? "(omitted)"}`);
    parts.push(`Summary: ${group.summary}`);
    parts.push(
      group.attention === undefined
        ? "Attention: (none)"
        : `Attention (${group.attention.kind}): ${group.attention.note}`,
    );
    for (const question of group.questions ?? []) {
      parts.push(`Question: ${question}`);
    }
    for (const range of group.focus ?? []) {
      parts.push(`Focus ${formatAnchor(focusAnchor(range))}: ${range.caption}`);
    }
    (group.notes ?? []).forEach((note, i) => {
      parts.push(`Note ${noteLetter(i)} ${formatAnchor(noteAnchor(note))}: ${note.body}`);
    });
    parts.push("");
    for (const file of payload.files) {
      parts.push(`#### ${fileHeading(file)}`);
      parts.push("");
      const fileNote = group.fileNotes?.[file.path];
      if (fileNote !== undefined) {
        parts.push(`File note: ${fileNote}`, "");
      }
      parts.push("```diff");
      parts.push(file.patch.trimEnd() === "" ? "(no patch text)" : file.patch.trimEnd());
      parts.push("```");
      parts.push("");
    }
  }
  return `${parts.join("\n").trimEnd()}\n`;
}

function lookForBlock(label: string, bullets: string[] | undefined): string {
  if (bullets === undefined || bullets.length === 0) {
    return `${label}: (none)`;
  }
  return `${label}:\n${bullets.map((bullet) => `- ${bullet}`).join("\n")}`;
}

/** The producer reads the commit messages as sources, so the grader needs them to check what a review cites. */
function commitBlock(commits: ApiCommit[]): string {
  if (commits.length === 0) {
    return "(none)";
  }
  return commits
    .map((commit) => {
      const body = commit.body.trim();
      const head = `- ${commit.shortSha} ${commit.subject}`;
      return body === "" ? head : `${head}\n${body.replace(/^/gmu, "  ")}`;
    })
    .join("\n");
}

function sourceBlock(document: ReviewDocument): string {
  const sources = document.sources ?? [];
  if (sources.length === 0) {
    return "(none)";
  }
  return sources
    .map((source) => {
      const bits = [`- ${source.id} ${source.kind} ${source.label}`];
      if (source.url !== undefined) {
        bits.push(`  url: ${source.url}`);
      }
      if (source.gist !== undefined) {
        bits.push(`  gist: ${source.gist}`);
      }
      return bits.join("\n");
    })
    .join("\n");
}

function fileHeading(file: ApiGroupFile): string {
  if (file.oldPath !== undefined) {
    return `${file.oldPath} -> ${file.path}`;
  }
  return file.path;
}
