import { cn } from "@/lib/utils.ts";

export function Logo(props: { className?: string }) {
  return (
    <span className={cn("shrink-0 font-serif text-[1.05rem] leading-none tracking-[-0.02em] text-foreground", props.className)}>
      Comprehende<span className="text-primary" aria-hidden="true">?</span>
    </span>
  );
}
