import type { ReviewComparison } from "../../review/compare.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import styles from "./Sidebar.module.css";

export type CompareSelection =
  | { kind: "overview" }
  | { kind: "added"; id: string }
  | { kind: "removed"; id: string }
  | { kind: "changed"; fromId: string; toId: string };

export type CompareNavItem = {
  selection: CompareSelection;
  title: string;
  mark?: "+" | "-";
};

export function compareItems(comparison: ReviewComparison): CompareNavItem[] {
  const items: CompareNavItem[] = [{ selection: { kind: "overview" }, title: "Overview" }];
  for (const group of comparison.groups.added) {
    items.push({ selection: { kind: "added", id: group.id }, title: group.title, mark: "+" });
  }
  for (const group of comparison.groups.removed) {
    items.push({ selection: { kind: "removed", id: group.id }, title: group.title, mark: "-" });
  }
  for (const group of comparison.groups.changed) {
    items.push({
      selection: { kind: "changed", fromId: group.from.id, toId: group.to.id },
      title: group.to.title,
    });
  }
  return items;
}

export function CompareNav(props: {
  items: readonly CompareNavItem[];
  selection: CompareSelection;
  onSelect: (selection: CompareSelection) => void;
}) {
  return (
    <nav className="h-full overflow-auto bg-card py-6">
      <div className="relative">
        <span className={styles.selection} aria-hidden />
        <ul className="list-none p-0">
          {props.items.map((item) => {
            const active = sameCompareSelection(item.selection, props.selection);
            return (
              <li key={itemKey(item.selection)}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => props.onSelect(item.selection)}
                  className={cn(
                    "relative z-1 mx-2 mb-0.5 h-auto w-[calc(100%-16px)] min-w-0 items-start justify-start gap-2 rounded-md px-2.5 py-1.5 text-left font-normal whitespace-normal hover:bg-transparent min-[800px]:mx-3 min-[800px]:mb-1 min-[800px]:w-[calc(100%-24px)] min-[800px]:px-3 min-[800px]:py-2",
                    !active && "hover:bg-accent",
                    active && cn(styles.itemActive, "text-foreground"),
                    item.mark === "+" && "text-add",
                    item.mark === "-" && "text-del",
                  )}
                >
                  {item.mark !== undefined ? (
                    <span className="mt-px w-5 shrink-0 font-mono text-[11px] tabular-nums">{item.mark}</span>
                  ) : (
                    <span className="w-5 shrink-0" />
                  )}
                  <span className="min-w-0 flex-1 leading-snug">{item.title}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export function sameCompareSelection(a: CompareSelection, b: CompareSelection): boolean {
  if (a.kind !== b.kind) {
    return false;
  }
  if (a.kind === "overview" || b.kind === "overview") {
    return true;
  }
  if (a.kind === "added" && b.kind === "added") {
    return a.id === b.id;
  }
  if (a.kind === "removed" && b.kind === "removed") {
    return a.id === b.id;
  }
  if (a.kind === "changed" && b.kind === "changed") {
    return a.fromId === b.fromId && a.toId === b.toId;
  }
  return false;
}

function itemKey(selection: CompareSelection): string {
  if (selection.kind === "overview") {
    return "overview";
  }
  if (selection.kind === "changed") {
    return `changed:${selection.fromId}:${selection.toId}`;
  }
  return `${selection.kind}:${selection.id}`;
}
