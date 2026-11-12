import { useState, type ReactNode } from "react";
import { PanelLeftIcon } from "lucide-react";
import { shortSha, type ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";
import type { Part } from "../lib/parts.ts";
import { reviewReadingPaths } from "../lib/reading-progress.ts";
import type { Selection } from "../lib/selection.ts";
import { GroupNav, GroupPosition } from "./GroupNav.tsx";
import { ReadingMark } from "./ReadingMark.tsx";
import { Sidebar } from "./Sidebar.tsx";
import { DisplayMenu } from "./DisplayMenu.tsx";

export function MobileShell(props: {
  meta: ReviewMeta;
  selection: Selection | null;
  parts: Part[];
  onSelect: (selection: Selection) => void;
  wrap: boolean;
  onWrap: () => void;
  onRefresh: () => void;
  viewedPaths: ReadonlySet<string>;
  comments?: boolean;
  onComments?: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pick = (selection: Selection) => {
    props.onSelect(selection);
    setOpen(false);
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex h-14 shrink-0 items-center border-b border-border bg-card px-1">
          <SheetTrigger asChild>
            <Button type="button" size="sm" variant="ghost" className="h-11 text-muted-foreground">
              <PanelLeftIcon />
              Groups
            </Button>
          </SheetTrigger>
          <div className="flex min-w-0 flex-1 flex-col px-1">
            <GroupPosition meta={props.meta} selection={props.selection} className="truncate" />
            <span className="truncate font-mono text-xs text-muted-foreground">
              {shortSha(props.meta.resolved.baseSha)} → {shortSha(props.meta.resolved.headSha)}
            </span>
          </div>
          <GroupNav
            meta={props.meta}
            selection={props.selection}
            onSelect={props.onSelect}
            className="gap-0"
            buttonClassName="size-10 text-foreground disabled:text-muted-foreground"
          />
          <DisplayMenu
            wrap={props.wrap}
            onWrap={props.onWrap}
            onRefresh={props.onRefresh}
            comments={props.comments}
            onComments={props.onComments}
            triggerClassName="h-11"
          />
        </header>
        <div className="min-h-0 flex-1 [[data-motion=scene]_&]:[view-transition-name:review-scene]">
          {props.children}
        </div>
        <SheetContent side="left" className="p-0">
          <SheetHeader className="gap-0.5 border-b border-border pr-12">
            <SheetTitle>Groups</SheetTitle>
            <SheetDescription asChild>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-foreground/70">
                  {shortSha(props.meta.resolved.baseSha)}...{shortSha(props.meta.resolved.headSha)}
                </span>
                <span aria-hidden className="text-muted-foreground">
                  ·
                </span>
                <ReadingMark
                  paths={reviewReadingPaths(props.meta)}
                  viewed={props.viewedPaths}
                  noun
                />
              </div>
            </SheetDescription>
          </SheetHeader>
          <Sidebar
            meta={props.meta}
            selection={props.selection}
            parts={props.parts}
            viewedPaths={props.viewedPaths}
            onSelect={pick}
            compact
            className="min-h-0 flex-1"
          />
        </SheetContent>
      </div>
    </Sheet>
  );
}
