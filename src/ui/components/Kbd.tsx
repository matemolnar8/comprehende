import { cn } from "@/lib/utils.ts";

export function Kbd(props: { children: string; className?: string }) {
  return (
    <kbd
      className={cn(
        "rounded-sm border border-border bg-muted/70 px-1 py-px font-mono text-[10px] font-normal text-muted-foreground",
        props.className,
      )}
    >
      {props.children}
    </kbd>
  );
}
