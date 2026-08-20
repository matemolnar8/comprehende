export type WhyTicket = {
  id: string;
  url?: string;
  title?: string;
  part?: string;
};

export type WhyCommit = {
  sha: string;
  shortSha: string;
  subject: string;
  body: string;
  author: string;
  date: string;
};

export type WhyModel = {
  tickets: WhyTicket[];
  commits: WhyCommit[];
  hasWhy: boolean;
  heading?: string;
  headingTicketId?: string;
};

const MERGE_SUBJECT =
  /^(Merge (pull request #\d+|branch|remote-tracking branch)|Merged in )\b/i;

const TRAILER_LINE = /^(?:[A-Za-z0-9-]+-by|Change-Id|Made-with|Cc):/i;

export function isMergeSubject(subject: string): boolean {
  return MERGE_SUBJECT.test(subject.trim());
}

export function stripGitTrailers(body: string): string {
  const lines = body.split("\n");
  let end = lines.length;
  while (end > 0 && lines[end - 1]?.trim() === "") {
    end--;
  }
  let trailerStart = end;
  while (trailerStart > 0 && TRAILER_LINE.test(lines[trailerStart - 1] ?? "")) {
    trailerStart--;
  }
  if (trailerStart === end) {
    return body.replace(/\n+$/u, "");
  }
  if (trailerStart === 0) {
    return "";
  }
  if (lines[trailerStart - 1]?.trim() !== "") {
    return body.replace(/\n+$/u, "");
  }
  return lines.slice(0, trailerStart).join("\n").replace(/\n+$/u, "");
}

export function commitSpeaks(commit: { subject: string; body: string }): boolean {
  if (isMergeSubject(commit.subject)) {
    return false;
  }
  return commit.subject.trim().length > 0;
}

export function whyModel(input: {
  walkthrough?: string;
  tickets?: WhyTicket[];
  commits: WhyCommit[];
}): WhyModel {
  const tickets = input.tickets ?? [];
  const commits = input.commits.filter(commitSpeaks).map((commit) => ({
    ...commit,
    body: stripGitTrailers(commit.body),
  }));
  const hasWhy = tickets.length > 0 || commits.length > 0;
  if (input.walkthrough !== undefined) {
    return { tickets, commits, hasWhy, heading: input.walkthrough };
  }
  const only = tickets.length === 1 ? tickets[0] : undefined;
  if (only?.title !== undefined) {
    return { tickets, commits, hasWhy, heading: only.title, headingTicketId: only.id };
  }
  return { tickets, commits, hasWhy };
}
