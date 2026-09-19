import { writeFile } from "node:fs/promises";
import { hunksPayload, type ReviewContext } from "../../src/api/live.ts";
import type { ApiGroupFile } from "../../src/api/types.ts";
import type { ReviewDocument } from "../../src/schema/types.ts";

export async function writeGradingPacket(ctx: ReviewContext, frozen: unknown[], outPath: string): Promise<string> {
  const markdown = gradingPacket(ctx, frozen);
  await writeFile(outPath, markdown);
  return markdown;
}

export function gradingPacket(ctx: ReviewContext, frozen: unknown[]): string {
  const document = ctx.document;
  const parts: string[] = [
    `# ${document.title}`,
    "",
    `Size: ${document.size}`,
    `Why: ${document.why ?? "(omitted)"}`,
    `Summary: ${document.summary}`,
  ];
  if (document.parts !== undefined && document.parts.length > 0) {
    parts.push(`Parts:\n${document.parts.map((part) => `- ${part.name}: ${part.summary}`).join("\n")}`);
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
    "## Groups",
    "",
  );
  const groups = [...document.groups].sort((a, b) => a.suggestedOrder - b.suggestedOrder || a.id.localeCompare(b.id));
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
    parts.push(`Why: ${group.why}`);
    parts.push(`Summary: ${group.summary}`);
    parts.push(lookForBlock("lookFor", group.lookFor));
    parts.push("");
    for (const file of payload.files) {
      parts.push(`#### ${fileHeading(file)}`);
      parts.push("");
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
