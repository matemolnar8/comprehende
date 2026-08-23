export const INLINE_MD_ELEMENTS = ["code", "em", "strong"] as const;

export function flattenInline(source: string): string {
  return source.replace(/\s+/g, " ").trim();
}

const UNDERSCORE = 95;

const underscoreAsText = {
  text: {
    [UNDERSCORE]: {
      name: "underscoreAsText",
      tokenize(effects: MicromarkEffects, ok: () => unknown) {
        return (code: number) => {
          effects.enter("data");
          effects.consume(code);
          effects.exit("data");
          return ok;
        };
      },
    },
  },
};

type MicromarkEffects = {
  enter: (type: string) => void;
  consume: (code: number) => void;
  exit: (type: string) => void;
};

/** CommonMark treats __VITE_WORKER_ASSET__ as strong. Keep `_` as text. */
export function remarkNoUnderscoreEmphasis(this: object): undefined {
  const data = this as { data: () => { micromarkExtensions?: unknown[] } };
  const bag = data.data();
  bag.micromarkExtensions = [...(bag.micromarkExtensions ?? []), underscoreAsText];
}
