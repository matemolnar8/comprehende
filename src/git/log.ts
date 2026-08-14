import { git } from "./exec.ts";

export type CommitInfo = {
  sha: string;
  shortSha: string;
  subject: string;
  author: string;
  date: string;
};

export async function listCommits(cwd: string, baseRef: string, headRef: string): Promise<CommitInfo[]> {
  const stdout = await git(cwd, [
    "log",
    "--format=%H%x00%h%x00%s%x00%an%x00%ad",
    "--date=short",
    "--end-of-options",
    `${baseRef}...${headRef}`,
  ]);
  if (stdout.trim() === "") {
    return [];
  }
  return stdout
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => {
      const [sha, shortSha, subject, author, date] = line.split("\0");
      return {
        sha: sha ?? "",
        shortSha: shortSha ?? "",
        subject: subject ?? "",
        author: author ?? "",
        date: date ?? "",
      };
    });
}
