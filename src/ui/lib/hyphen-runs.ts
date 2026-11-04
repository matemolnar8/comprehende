const HYPHENATED_WORD = /([\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+)/u;

/** Splits text so each hyphenated word ("page-object", "e2e-test") is its own run. Joining the runs gives the input back. */
export function hyphenRuns(text: string) {
  // The capture group keeps each match in the split output, at the odd indexes.
  return text
    .split(HYPHENATED_WORD)
    .flatMap((part, i) => (part === "" ? [] : [{ text: part, hyphenated: i % 2 === 1 }]));
}
