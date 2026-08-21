import { git } from "./exec.ts";

export type CommitInfo = {
  sha: string;
  shortSha: string;
  subject: string;
  body: string;
  author: string;
  date: string;
};

const RECORD_SEP = "\x1e";
const FIELD_SEP = "\0";

export async function listCommits(cwd: string, baseRef: string, headRef: string): Promise<CommitInfo[]> {
  const stdout = await git(cwd, [
    "log",
    "--format=%H%x00%h%x00%s%x00%an%x00%ad%x00%b%x1e",
    "--date=short",
    "--end-of-options",
    `${baseRef}...${headRef}`,
  ]);
  if (stdout.trim() === "") {
    return [];
  }
  return stdout
    .split(RECORD_SEP)
    .map((record) => record.replace(/^\n/, ""))
    .filter((record) => record.length > 0)
    .map(parseCommitRecord);
}

function parseCommitRecord(record: string): CommitInfo {
  const [sha, shortSha, subject, author, date, ...bodyParts] = record.split(FIELD_SEP);
  return {
    sha: sha ?? "",
    shortSha: shortSha ?? "",
    subject: subject ?? "",
    author: author ?? "",
    date: date ?? "",
    body: (bodyParts.join(FIELD_SEP) ?? "").replace(/\n+$/u, ""),
  };
}
