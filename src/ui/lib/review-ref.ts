import { shortSha } from "../api.ts";

const SHA_LIKE = /^[0-9a-f]{7,40}$/i;

export function looksLikeSha(value: string): boolean {
  return SHA_LIKE.test(value);
}

export type ReviewRef = {
  display: string;
  copy: string;
  tooltip: string;
};

export function reviewRef(ref: string, sha: string): ReviewRef {
  const named = !looksLikeSha(ref) && ref !== sha;
  return {
    display: named ? ref : shortSha(sha),
    copy: sha,
    tooltip: named ? `${ref} · ${sha}` : sha,
  };
}
