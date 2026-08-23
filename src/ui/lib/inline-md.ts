export const INLINE_MD_ELEMENTS = ["code", "em", "strong"] as const;

export function flattenInline(source: string): string {
  return source.replace(/\s+/g, " ").trim();
}
