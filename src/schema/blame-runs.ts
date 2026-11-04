export type BlameRunLine = {
  sha: string;
  author: string;
  timestamp: number;
  summary: string;
  line: number;
};

export type BlameRun = Omit<BlameRunLine, "line"> & {
  lineNumber: number;
  lines: number;
};

export function groupBlameRuns(lines: readonly BlameRunLine[]): BlameRun[] {
  const runs: BlameRun[] = [];
  for (const line of lines) {
    const last = runs[runs.length - 1];
    if (last !== undefined && last.sha === line.sha && last.author === line.author) {
      last.lines += 1;
      continue;
    }
    runs.push({
      lineNumber: line.line,
      sha: line.sha,
      author: line.author,
      timestamp: line.timestamp,
      summary: line.summary,
      lines: 1,
    });
  }
  return runs;
}
