import { useEffect, useState } from "react";
import { REVIEW_BUCKETS } from "../../api/types.ts";
import { padIndex } from "../../schema/types.ts";
import type { ReviewMeta } from "../api.ts";
import type { Selection } from "./selection.ts";

export const MOBILE_DESIGNS = ["overlay", "stack", "dock"] as const;
export type MobileDesign = (typeof MOBILE_DESIGNS)[number];

export function parseMobileDesign(raw: string | null | undefined): MobileDesign {
  if (raw === "overlay" || raw === "stack" || raw === "dock") {
    return raw;
  }
  return "overlay";
}

export function useMobileDesign(): MobileDesign {
  const [design, setDesign] = useState(() => parseMobileDesign(new URLSearchParams(window.location.search).get("design")));
  useEffect(() => {
    const sync = () => setDesign(parseMobileDesign(new URLSearchParams(window.location.search).get("design")));
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  return design;
}

export function selectionCaption(
  meta: Pick<ReviewMeta, "document" | "groups">,
  selection: Selection | null,
): { index?: string; title: string } {
  if (selection === null || selection.kind === "overview") {
    return { title: "Overview" };
  }
  if (selection.kind === "group") {
    const index = meta.groups.findIndex((group) => group.id === selection.id);
    const group = index >= 0 ? meta.groups[index] : undefined;
    return {
      index: index >= 0 ? padIndex(index + 1) : undefined,
      title: group?.title ?? "Group",
    };
  }
  if (selection.kind === REVIEW_BUCKETS.unassigned) {
    return { title: "Unassigned" };
  }
  return { title: "Lockfiles" };
}
