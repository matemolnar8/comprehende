import { cn } from "@/lib/utils.ts";

/** A keycap. It takes the text colour of its parent, so it reads in a tooltip and on a page. */
export function Kbd(props: { children: string; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[4px] border border-current/25 px-1 font-mono text-[11px] leading-none font-medium opacity-80",
        props.className,
      )}
    >
      {props.children}
    </kbd>
  );
}

export function HintWithKey(props: { text: string; shortcut: string }) {
  return (
    <span className="flex items-center gap-2">
      {props.text}
      <Kbd>{props.shortcut}</Kbd>
    </span>
  );
}
