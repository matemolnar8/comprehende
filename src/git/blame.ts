import { assertSafePath, assertSafeRef } from "./repo.ts";
import { git } from "./exec.ts";

export type BlameLine = {
  sha: string;
  author: string;
  timestamp: number;
  line: number;
  text: string;
};

export async function blameFile(cwd: string, ref: string, path: string): Promise<BlameLine[]> {
  assertSafeRef(ref);
  assertSafePath(path);
  const stdout = await git(cwd, ["blame", "--line-porcelain", ref, "--", path]);
  return parseBlamePorcelain(stdout);
}

function parseBlamePorcelain(text: string): BlameLine[] {
  const lines: BlameLine[] = [];
  const raw = text.split("\n");
  let sha = "";
  let author = "";
  let timestamp = 0;
  let lineNo = 0;
  for (const line of raw) {
    const header = /^([0-9a-f]{40}) (\d+) (\d+)(?: (\d+))?$/.exec(line);
    if (header && header[1] !== undefined && header[3] !== undefined) {
      sha = header[1];
      lineNo = Number(header[3]);
      continue;
    }
    if (line.startsWith("author ")) {
      author = line.slice("author ".length);
      continue;
    }
    if (line.startsWith("author-time ")) {
      timestamp = Number(line.slice("author-time ".length));
      continue;
    }
    if (line.startsWith("\t")) {
      lines.push({ sha, author, timestamp, line: lineNo, text: line.slice(1) });
    }
  }
  return lines;
}
