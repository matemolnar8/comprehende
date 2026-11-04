/** Lines revealed per click. A shorter gap opens in one click. */
export const EXPANSION_LINE_COUNT = 10;

/** A compact gap row. Unfold from either end. */
export const GAP_SEPARATOR = "line-info-basic" as const;

export const GAP_CSS = `
[data-expand-button]:focus-visible {
  outline: 2px solid var(--diffs-modified-base);
  outline-offset: -2px;
}

/* Like the hidden-lines row: the canvas, muted text, and the actions in primary. */
[data-separator="line-info-basic"] {
  height: 24px;
  background: var(--diffs-bg);
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
    color: var(--muted-foreground);
    font-size: var(--diff-font-size, 0.75rem);
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

  [data-expand-button] {
    color: var(--primary);
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
      content: "⇅";
    }

    svg {
      display: none;
    }
  }

  [data-separator-wrapper]:not([data-separator-multi-button]) [data-expand-button]:not([data-expand-all-button]) {
    box-sizing: border-box;
    width: 2.8rem;
    padding-left: 1.4rem;
  }

  [data-separator-content] {
    margin-left: 0.4ch;
  }

  [data-separator-content],
  [data-expand-all-button] {
    font-family: var(--font-sans);
    font-size: 0.75rem;
  }

  [data-expand-all-button] {
    display: flex;
    position: relative;
    margin-left: 0.9rem;
    text-transform: lowercase;

    &:hover {
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
    background-color: var(--muted-foreground);
    pointer-events: none;
  }

  [data-expand-index] [data-unmodified-lines] {
    cursor: pointer;

    &:hover {
      color: var(--diffs-fg);
      text-decoration: underline;
    }
  }
}
`;
