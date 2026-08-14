export type BlameRunLine = {
  sha: string;
  author: string;
  timestamp: number;
  line: number;
};

export type BlameRun = {
  lineNumber: number;
  sha: string;
  author: string;
  timestamp: number;
  lines: number;
};

export function groupBlameRuns(lines: BlameRunLine[]): BlameRun[] {
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
      lines: 1,
    });
  }
  return runs;
}
