import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

export const briefProse = "m-0 max-w-[68ch] leading-[1.45] text-pretty text-foreground";
export const briefRows = "m-0 list-none divide-y divide-border p-0";

export function Kicker(props: { children: ReactNode; id?: string; className?: string }) {
  return (
    <p id={props.id} className={cn("font-mono text-[11px] leading-[1.45] text-muted-foreground", props.className)}>
      {props.children}
    </p>
  );
}

export function BriefField(props: {
  kicker: string;
  kickerId?: string;
  children: ReactNode;
  className?: string;
}) {
  const generatedId = useId();
  const id = props.kickerId ?? generatedId;
  return (
    <section className={cn("mb-4 last:mb-0", props.className)} aria-labelledby={id}>
      <h2 id={id} className="mb-1 font-mono text-[11px] font-normal leading-[1.45] text-muted-foreground">
        {props.kicker}
      </h2>
      <div className="min-w-0">{props.children}</div>
    </section>
  );
}
