/** Lines revealed per click. A shorter gap opens in one click. */
export const EXPANSION_LINE_COUNT = 10;

/** Compact full-width bar. Unfold from either end. */
export const GAP_SEPARATOR = "line-info-basic" as const;

export const GAP_CSS = `
[data-expand-button]:focus-visible {
  outline: 2px solid var(--diffs-modified-base);
  outline-offset: -2px;
}

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
