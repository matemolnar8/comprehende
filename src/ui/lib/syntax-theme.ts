type ThemeSetting = { scope?: string | string[]; settings: { foreground?: string } };

type RecolorableTheme = {
  name: string;
  settings?: ThemeSetting[];
  tokenColors?: ThemeSetting[];
};

type SyntaxRecolor = {
  /** Bundled shiki theme to start from. */
  base: string;
  /** Old token colour to new one. Each rule is repainted once, from its original colour. */
  colors: Readonly<Record<string, string>>;
  /** Numbers keep a colour even when the constants around them go neutral. */
  number: string;
};

/**
 * GitHub's syntax colours, calmed down. Keywords move off red, because red means a deleted line.
 * Names, types, and constants go neutral, so the UI's blue-violet primary does not blend into the
 * code. Only keywords, strings, and numbers keep a colour. Dark comments go one step lighter, so they
 * stay easy to read on the dark card.
 */
export const SYNTAX_RECOLORS = {
  light: {
    base: "github-light",
    colors: { "#d73a49": "#6f42c1", "#6f42c1": "#24292e", "#005cc5": "#24292e" },
    number: "#005cc5",
  },
  dark: {
    base: "github-dark",
    colors: {
      "#f97583": "#b392f0",
      "#b392f0": "#e1e4e8",
      "#79b8ff": "#e1e4e8",
      "#6a737d": "#a8b2c1",
    },
    number: "#79b8ff",
  },
} as const satisfies Record<"light" | "dark", SyntaxRecolor>;

/** A copy of `theme` named `name`, with token colours repainted and a number rule added. */
export function recolorTheme<T extends RecolorableTheme>(
  theme: T,
  name: string,
  recolor: Pick<SyntaxRecolor, "colors" | "number">,
): T {
  const colors = new Map(
    Object.entries(recolor.colors).map(([from, to]) => [from.toLowerCase(), to]),
  );
  const paint = (rules: ThemeSetting[]) =>
    rules.map((rule) => {
      const to = colors.get(rule.settings.foreground?.toLowerCase() ?? "");
      return to === undefined ? rule : { ...rule, settings: { ...rule.settings, foreground: to } };
    });
  const numberRule: ThemeSetting = {
    scope: "constant.numeric",
    settings: { foreground: recolor.number },
  };
  return {
    ...theme,
    name,
    settings: theme.settings === undefined ? undefined : paint(theme.settings),
    tokenColors:
      theme.tokenColors === undefined ? undefined : [...paint(theme.tokenColors), numberRule],
  };
}
