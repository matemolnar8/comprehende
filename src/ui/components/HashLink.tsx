import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { isPlainLeftClick } from "../lib/plain-click.ts";
import { serializeHash, type Selection } from "../lib/selection.ts";
import { cn } from "../lib/utils.ts";

/** Hover underline for hops in running text. Do not use on cards or nav rows. */
export const hashLinkText = "underline-offset-2 hover:underline";

export function HashLink(props: {
  selection: Selection;
  onSelect: (selection: Selection) => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  ariaLabel?: string;
  ariaCurrent?: "page" | "location";
}) {
  return (
    <a
      href={serializeHash(props.selection)}
      className={cn(
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        props.className,
      )}
      style={props.style}
      aria-label={props.ariaLabel}
      aria-current={props.ariaCurrent}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (!isPlainLeftClick(event)) {
          return;
        }
        event.preventDefault();
        props.onSelect(props.selection);
      }}
    >
      {props.children}
    </a>
  );
}
