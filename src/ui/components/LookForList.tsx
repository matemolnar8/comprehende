import { cn } from "@/lib/utils.ts";
import { InlineMd } from "./InlineMd.tsx";

export function LookForList(props: { items: readonly string[] | undefined; className?: string }) {
  const items = props.items ?? [];
  if (items.length === 0) {
    return null;
  }
  return (
    <ul className={cn("mb-2 list-disc space-y-2 pl-5 leading-relaxed", props.className)}>
      {items.map((item, i) => (
        <li key={i}>
          <InlineMd text={item} />
        </li>
      ))}
    </ul>
  );
}
