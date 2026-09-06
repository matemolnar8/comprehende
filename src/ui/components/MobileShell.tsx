import { useState, type ReactNode } from "react";
import { MessageSquareIcon, PanelLeftIcon, WrapTextIcon } from "lucide-react";
import type { ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx";
import { selectionCaption, type Selection } from "../lib/selection.ts";
import type { Part } from "../lib/parts.ts";
import { ThemeToggle } from "./Header.tsx";
import { Sidebar } from "./Sidebar.tsx";

export function MobileShell(props: {
  meta: ReviewMeta;
  selection: Selection | null;
  parts: Part[];
  onSelect: (selection: Selection) => void;
  wrap: boolean;
  onWrap: () => void;
  comments?: boolean;
  onComments?: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const caption = selectionCaption(props.meta, props.selection);
  const pick = (selection: Selection) => {
    props.onSelect(selection);
    setOpen(false);
  };
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-card px-2">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Open groups"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <PanelLeftIcon />
        </Button>
        <p className="flex min-w-0 flex-1 items-baseline gap-2">
          {caption.index !== undefined ? (
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{caption.index}</span>
          ) : null}
          <span className="truncate text-sm font-medium">{caption.title}</span>
        </p>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant={props.wrap ? "secondary" : "outline"}
            aria-pressed={props.wrap}
            aria-label="Wrap lines"
            onClick={props.onWrap}
          >
            <WrapTextIcon />
          </Button>
          {props.onComments !== undefined ? (
            <Button
              type="button"
              size="icon-sm"
              variant={props.comments === true ? "secondary" : "outline"}
              aria-pressed={props.comments === true}
              aria-label="Show comments"
              onClick={props.onComments}
            >
              <MessageSquareIcon />
            </Button>
          ) : null}
          <ThemeToggle />
        </div>
      </header>
      <div className="min-h-0 flex-1 [[data-motion=scene]_&]:[view-transition-name:review-scene]">{props.children}</div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" showCloseButton={false} className="p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle>Groups</SheetTitle>
            <SheetDescription className="sr-only">Review groups in this change.</SheetDescription>
          </SheetHeader>
          <Sidebar
            meta={props.meta}
            selection={props.selection}
            parts={props.parts}
            onSelect={pick}
            compact
            className="min-h-0 flex-1"
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
