import type { ReviewSize } from "../schema/types.ts";

export type SizeGuess = { size: ReviewSize; reason: string };

/** Smallest reviewable line count of each size, past trivial. */
const LINE_FLOORS = [
  ["very-large", 2000],
  ["large", 550],
  ["medium", 200],
  ["small", 20],
] as const satisfies readonly (readonly [ReviewSize, number])[];

/**
 * A starting point for the review burden, from the lines a reviewer reads (`show --batch`):
 * renames, moves, generated output, lockfiles, and repeats of the same change do not count.
 */
export function guessSize(changedLines: number): SizeGuess {
  const index = LINE_FLOORS.findIndex(([, floor]) => changedLines >= floor);
  const band = LINE_FLOORS[index];
  if (band === undefined) {
    return {
      size: "trivial",
      reason: `under ${count(LINE_FLOORS.at(-1)?.[1] ?? 0)} reviewable lines`,
    };
  }
  const above = LINE_FLOORS[index - 1];
  return {
    size: band[0],
    reason:
      above === undefined
        ? `${count(band[1])}+ reviewable lines`
        : `${count(band[1])}-${count(above[1] - 1)} reviewable lines`,
  };
}

function count(n: number): string {
  return n.toLocaleString("en-US");
}
