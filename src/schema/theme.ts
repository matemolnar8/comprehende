import * as z from "zod";

/** The UI colour variables a theme may set. Each one is a `--<token>` in `src/ui/styles.css`, in light and dark. */
export const THEME_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "add",
  "del",
  "warn",
  "moved",
  "strand-0",
  "strand-1",
  "strand-2",
  "strand-3",
  "strand-4",
  "strand-5",
  "diff-canvas",
  "diff-fg",
  "diff-add-line",
  "diff-add-num",
  "diff-add-word",
  "diff-del-line",
  "diff-del-num",
  "diff-del-word",
  "diff-hunk",
  "diff-hover",
] as const;

export type ThemeToken = (typeof THEME_TOKENS)[number];

/** Literal colours only. An export is a public page, so a value never carries other CSS. */
const color = z
  .string()
  .regex(/^(#[0-9a-f]{3,8}|(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\([0-9a-z.,%/\s+-]*\))$/i, {
    error: "must be a hex colour or a CSS colour function such as oklch(0.7 0.15 70)",
  });

const palette = z.partialRecord(z.enum(THEME_TOKENS), color);

export const themeSchema = z.strictObject({
  radius: z
    .string()
    .regex(/^\d*\.?\d+(rem|px)$/, { error: "must be a length in rem or px, such as 0.5rem" })
    .optional(),
  light: palette.optional(),
  dark: palette.optional(),
});

export type Theme = z.infer<typeof themeSchema>;

export type ThemeParseResult = { ok: true; theme: Theme } | { ok: false; error: string };

export function parseThemeJson(text: string): ThemeParseResult {
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
  const result = themeSchema.safeParse(input);
  return result.success
    ? { ok: true, theme: result.data }
    : { ok: false, error: z.prettifyError(result.error) };
}
