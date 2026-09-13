import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

export function Kicker(props: { children: ReactNode; id?: string; className?: string }) {
  return (
    <p id={props.id} className={cn("font-mono text-xs text-muted-foreground", props.className)}>
      {props.children}
    </p>
  );
}
