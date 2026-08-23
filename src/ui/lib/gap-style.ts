import type { HunkSeparators } from "@pierre/diffs";

export const GAP_STYLES = ["edges", "fold", "bar"] as const;

export type GapStyle = (typeof GAP_STYLES)[number];

export const DEFAULT_GAP_STYLE: GapStyle = "edges";

export const GAP_STYLE_STORAGE_KEY = "comprehende.gap-style";

/** Lines revealed per click. A shorter gap opens in one click. */
export const EXPANSION_LINE_COUNT = 10;

export const GAP_STYLE_LABEL: Record<GapStyle, string> = {
  edges: "Edges",
  fold: "Fold",
  bar: "Bar",
};

export const GAP_STYLE_HINT: Record<GapStyle, string> = {
  edges: "A few lines from either end of the gap",
  fold: "Rounded fold in the line gutter",
  bar: "Click the count to reveal from both ends",
};

export function parseGapStyle(raw: string | null): GapStyle {
  if (raw === "edges" || raw === "fold" || raw === "bar") {
    return raw;
  }
  return DEFAULT_GAP_STYLE;
}

export function readStoredGapStyle(): GapStyle {
  try {
    return parseGapStyle(localStorage.getItem(GAP_STYLE_STORAGE_KEY));
  } catch {
    return DEFAULT_GAP_STYLE;
  }
}

export function writeStoredGapStyle(style: GapStyle): void {
  try {
    localStorage.setItem(GAP_STYLE_STORAGE_KEY, style);
  } catch {
    // quota / private mode
  }
}

export function gapSeparator(style: GapStyle): Exclude<HunkSeparators, "custom"> {
  return style === "fold" ? "line-info" : "line-info-basic";
}

export function gapStyleCSS(style: GapStyle): string {
  switch (style) {
    case "edges":
      return EDGES_CSS;
    case "fold":
      return FOLD_CSS;
    case "bar":
      return BAR_CSS;
  }
}

const SHARED_CSS = `
[data-expand-button]:focus-visible {
  outline: 2px solid var(--diffs-modified-base);
  outline-offset: -2px;
}
`;

/** Unfold from each end of a full-width bar. */
const EDGES_CSS = `
${SHARED_CSS}
[data-separator="line-info-basic"] {
  height: 24px;
  background: var(--diffs-bg-separator);
  position: relative;
}

[data-diff-type="single"] [data-gutter],
[data-diff-type="split"] [data-deletions] [data-gutter] {
  [data-separator-wrapper] {
    position: absolute;
    left: 100%;
    display: flex;
    align-items: center;
    gap: 0;
    width: max-content;
    background: transparent;
    color: var(--diffs-fg-number);
    font-size: 0.75rem;
    margin-left: calc(-2ch - 2px);
  }

  [data-separator-wrapper][data-separator-multi-button] {
    margin-left: calc(-3ch - 2px);
  }

  [data-expand-button],
  [data-separator-content] {
    display: flex;
    align-items: center;
    min-width: unset;
    min-height: unset;
    padding: 0;
    flex-shrink: 0;
    border: none;
    width: auto;
    height: 100%;
    background-color: transparent;
    color: inherit;
    font: inherit;
  }

  [data-expand-button]:not([data-expand-all-button]) {
    min-width: 1.4rem;
    justify-content: center;

    &[data-expand-down]::before {
      content: "↓";
    }
    &[data-expand-up]::before {
      content: "↑";
    }
    &[data-expand-both]::before {
      content: "↕";
    }

    svg {
      display: none;
    }
  }

  [data-separator-content] {
    margin-left: 0.4ch;
  }

  [data-expand-all-button] {
    display: flex;
    position: relative;
    margin-left: 0.9rem;
    text-transform: lowercase;

    &:hover {
      color: var(--diffs-fg);
      text-decoration: underline;
    }
  }

  [data-expand-all-button]::before {
    content: "";
    display: block;
    position: absolute;
    top: 50%;
    left: -0.55rem;
    width: 3px;
    height: 3px;
    margin-top: -1px;
    border-radius: 2px;
    background-color: var(--diffs-fg-number);
    pointer-events: none;
  }

  [data-separator-content]:hover,
  [data-expand-button]:hover {
    color: var(--diffs-fg);
  }
}
`;

/** Rounded fold chip in the gutter. */
const FOLD_CSS = `
${SHARED_CSS}
[data-expand-all-button] {
  display: flex;
  padding-inline: 0.7ch;
  text-transform: lowercase;
}

[data-expand-all-button]:hover {
  color: var(--diffs-fg);
  text-decoration: underline;
}

[data-separator="line-info"] [data-separator-content]:hover {
  color: var(--diffs-fg);
}
`;

/** The count on the bar is the control. */
const BAR_CSS = `
${SHARED_CSS}
[data-separator="line-info-basic"] {
  height: 22px;
  background: var(--diffs-bg);
  position: relative;
}

[data-separator="line-info-basic"]::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  border-top: 1px dashed var(--diffs-bg-separator);
  pointer-events: none;
}

[data-diff-type="single"] [data-gutter],
[data-diff-type="split"] [data-deletions] [data-gutter] {
  [data-separator-wrapper] {
    position: absolute;
    left: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.35rem;
    width: max-content;
    max-width: 70cqi;
    background: transparent;
    color: var(--diffs-fg-number);
    font-size: 0.75rem;
    margin-left: 0.8ch;
  }

  [data-expand-button],
  [data-separator-content] {
    display: flex;
    align-items: center;
    min-width: unset;
    min-height: unset;
    padding: 0;
    border: none;
    background: var(--diffs-bg);
    color: inherit;
    font: inherit;
    height: auto;
  }

  [data-separator-content] {
    padding-inline: 0.55ch;
    cursor: pointer;
  }

  [data-expand-button]:not([data-expand-all-button]) {
    min-width: 1.15rem;
    justify-content: center;
    opacity: 0;

    &[data-expand-down]::before {
      content: "↓";
    }
    &[data-expand-up]::before {
      content: "↑";
    }
    &[data-expand-both]::before {
      content: "↕";
    }

    svg {
      display: none;
    }
  }

  [data-separator]:hover [data-expand-button]:not([data-expand-all-button]),
  [data-expand-button]:focus-visible {
    opacity: 1;
  }

  [data-expand-all-button] {
    display: flex;
    padding-inline: 0.45ch;
    text-transform: lowercase;
  }

  [data-separator-content]:hover,
  [data-expand-button]:hover {
    color: var(--diffs-fg);
  }
}
`;
