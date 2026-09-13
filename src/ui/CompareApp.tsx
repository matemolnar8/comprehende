import { useCallback, useEffect, useMemo, useState } from "react";
import { PanelLeftIcon } from "lucide-react";
import { useDefaultLayout } from "react-resizable-panels";
import type { ComparePayload } from "../review/compare.ts";
import { basename } from "../schema/types.ts";
import { CompareNav, compareItems, sameCompareSelection, type CompareSelection } from "./components/CompareNav.tsx";
import { CompareStage } from "./components/CompareStage.tsx";
import { ThemeToggle } from "./components/Header.tsx";
import { Logo } from "./components/Logo.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable.tsx";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { useNarrow } from "./lib/narrow.ts";

export function CompareApp(props: { payload: ComparePayload }) {
  const { payload } = props;
  const items = useMemo(() => compareItems(payload.comparison), [payload]);
  const [selection, setSelection] = useState<CompareSelection>({ kind: "overview" });
  const [menuOpen, setMenuOpen] = useState(false);
  const narrow = useNarrow();
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "comprehende-compare-shell",
    panelIds: ["stack", "main"],
    onlySaveAfterUserInteractions: true,
  });

  const select = useCallback((next: CompareSelection) => {
    setSelection(next);
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.closest("input, textarea, select") !== null)
      ) {
        return;
      }
      if (event.key === "o") {
        select({ kind: "overview" });
        return;
      }
      if (event.key !== "[" && event.key !== "]") {
        return;
      }
      const delta = event.key === "]" ? 1 : -1;
      const index = items.findIndex((item) => sameCompareSelection(item.selection, selection));
      const next = items[Math.min(items.length - 1, Math.max(0, (index === -1 ? 0 : index) + delta))];
      if (next !== undefined) {
        select(next.selection);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, select, selection]);

  const nav = <CompareNav items={items} selection={selection} onSelect={select} />;
  const stage = <CompareStage payload={payload} selection={selection} />;

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 flex-col">
        {narrow ? (
          <>
            <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-card px-2">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Open comparison"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <PanelLeftIcon />
              </Button>
              <p className="min-w-0 flex-1 truncate text-sm font-medium">Interpretation</p>
              <ThemeToggle />
            </header>
            <div className="min-h-0 flex-1">{stage}</div>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetContent side="left" showCloseButton={false} className="p-0">
                <SheetHeader className="border-b border-border">
                  <SheetTitle>Interpretation</SheetTitle>
                  <SheetDescription className="sr-only">Groups that changed between the two reviews.</SheetDescription>
                </SheetHeader>
                {nav}
              </SheetContent>
            </Sheet>
          </>
        ) : (
          <>
            <header className="flex flex-col gap-2 border-b border-border bg-card px-5 py-3 min-[800px]:flex-row min-[800px]:items-center min-[800px]:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <Logo />
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground">Interpretation</p>
                <p className="min-w-0 truncate font-mono text-xs text-muted-foreground">
                  {basename(payload.from.path)} to {basename(payload.to.path)}
                </p>
              </div>
              <ThemeToggle />
            </header>
            <ResizablePanelGroup
              className="min-h-0 flex-1"
              defaultLayout={defaultLayout}
              onLayoutChanged={onLayoutChanged}
            >
              <ResizablePanel id="stack" defaultSize="20" minSize="14%" className="min-h-0 min-w-0">
                {nav}
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel id="main" defaultSize="80" minSize="40%" className="min-h-0 min-w-0">
                {stage}
              </ResizablePanel>
            </ResizablePanelGroup>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}