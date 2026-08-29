export const PEEK_LIMIT = 3;

/** Show every path when the remainder would be 1. Otherwise cap at `limit`. */
export function peekFiles(paths: readonly string[], limit = PEEK_LIMIT): { shown: string[]; rest: number } {
  if (paths.length <= limit + 1) {
    return { shown: [...paths], rest: 0 };
  }
  return { shown: paths.slice(0, limit), rest: paths.length - limit };
}
