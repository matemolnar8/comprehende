import { cn } from "@/lib/utils.ts";

/** Wordmark. The mark is the favicon, so the tab and the page show the same icon. */
export function Logo(props: { className?: string; wordClassName?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 font-display text-[17px] leading-none font-semibold tracking-[-0.01em] text-foreground",
        props.className,
      )}
    >
      <img src="./favicon.svg" alt="" aria-hidden className="size-5 shrink-0" />
      <span className={props.wordClassName}>Comprehende</span>
    </span>
  );
}
