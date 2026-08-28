import { cn } from "@/lib/utils.ts";

export function Logo(props: { className?: string }) {
  return (
    <span className={cn("shrink-0 font-display text-xl leading-none text-foreground", props.className)}>
      Comprehende<span className="text-primary" aria-hidden="true">?</span>
    </span>
  );
}
