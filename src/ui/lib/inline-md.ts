export const INLINE_MD_ELEMENTS = ["code", "em", "strong", "a"] as const;

export function flattenInline(source: string): string {
  return source.replace(/\s+/g, " ").trim();
}

/** Splits code after each `/` and `.`, the only places a long token may break. Joining the parts gives the input back. */
export function codeBreakParts(code: string): string[] {
  return code.split(/(?<=[/.])/);
}
