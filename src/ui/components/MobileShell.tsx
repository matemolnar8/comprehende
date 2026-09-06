import { useState, type ReactNode } from "react";
import { ArrowLeftIcon, ChevronsUpDownIcon, MessageSquareIcon, PanelLeftIcon, WrapTextIcon } from "lucide-react";
import type { ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx";
import { selectionCaption, type MobileDesign } from "../lib/mobile-design.ts";
import type { Selection } from "../lib/selection.ts";
import type { Part } from "../lib/parts.ts";
import { ThemeToggle } from "./Header.tsx";
import { Logo } from "./Logo.tsx";
import { Sidebar } from "./Sidebar.tsx";

export function MobileShell(props: {
  design: MobileDesign;
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
  if (props.design === "stack") {
    return <StackShell {...props} />;
  }
  if (props.design === "dock") {
    return <DockShell {...props} />;
  }
  return <OverlayShell {...props} />;
}

function OverlayShell(props: {
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
        <Caption caption={caption} />
        <IconRow {...props} />
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

function StackShell(props: {
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
  const [atList, setAtList] = useState(true);
  const caption = selectionCaption(props.meta, props.selection);
  const pick = (selection: Selection) => {
    props.onSelect(selection);
    setAtList(false);
  };
  if (atList) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-card">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
          <Logo className="text-lg" />
          <span className="ml-auto">
            <ThemeToggle />
          </span>
        </header>
        <div className="min-h-0 flex-1">
          <Sidebar
            meta={props.meta}
            selection={props.selection}
            parts={props.parts}
            onSelect={pick}
            compact
            className="min-h-0 flex-1"
          />
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-card px-2">
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Back to groups" onClick={() => setAtList(true)}>
          <ArrowLeftIcon />
        </Button>
        <Caption caption={caption} />
        <IconRow {...props} />
      </header>
      <div className="min-h-0 flex-1 [[data-motion=scene]_&]:[view-transition-name:review-scene]">{props.children}</div>
    </div>
  );
}

function DockShell(props: {
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
      <header className="flex h-10 shrink-0 items-center justify-end gap-1 border-b border-border bg-card px-2">
        <IconRow {...props} />
      </header>
      <div className="min-h-0 flex-1 [[data-motion=scene]_&]:[view-transition-name:review-scene]">{props.children}</div>
      <div className="shrink-0 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        <Button
          type="button"
          variant="ghost"
          aria-expanded={open}
          aria-label="Open groups"
          onClick={() => setOpen(true)}
          className="h-14 w-full justify-start gap-2.5 rounded-none px-3 text-left font-normal"
        >
          {caption.index !== undefined ? (
            <span className="w-5 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">{caption.index}</span>
          ) : null}
          <span className="min-w-0 flex-1 truncate">{caption.title}</span>
          <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="bottom-14 max-h-[75vh] rounded-t-lg p-0">
          <div className="flex justify-center pt-2" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-border" />
          </div>
          <SheetHeader className="py-2">
            <SheetTitle>Groups</SheetTitle>
            <SheetDescription className="sr-only">Review groups in this change.</SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-auto">
            <Sidebar
              meta={props.meta}
              selection={props.selection}
              parts={props.parts}
              onSelect={pick}
              compact
              className="h-auto"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Caption(props: { caption: { index?: string; title: string } }) {
  return (
    <p className="flex min-w-0 flex-1 items-baseline gap-2">
      {props.caption.index !== undefined ? (
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{props.caption.index}</span>
      ) : null}
      <span className="truncate text-sm font-medium">{props.caption.title}</span>
    </p>
  );
}

function IconRow(props: { wrap: boolean; onWrap: () => void; comments?: boolean; onComments?: () => void }) {
  return (
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
  );
}
