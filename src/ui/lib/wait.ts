export const WAIT_REVEAL_MS = 180;

export const waitCopy = {
  review: "Reading the review.",
  layer: "Reading git.",
  file: "Reading this file.",
  blame: "Reading blame.",
  lockfile: "Reading the lockfile.",
} as const;

export function waitVisible(active: boolean, elapsedMs: number, delayMs = WAIT_REVEAL_MS): boolean {
  return active && elapsedMs >= delayMs;
}
