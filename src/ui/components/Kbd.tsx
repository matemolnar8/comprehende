import { cn } from "@/lib/utils.ts";

export function Kbd(props: { children: string; className?: string }) {
  return <kbd className={cn("font-mono text-[10px] font-normal text-muted-foreground", props.className)}>{props.children}</kbd>;
}
