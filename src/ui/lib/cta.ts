export const CTA_IDS = ["ask", "explain", "prompt", "agent", "paste"] as const;

export type CtaId = (typeof CTA_IDS)[number];

export type CtaSlot = "kicker" | "title" | "strip" | "after";

export type CtaIcon = "sparkle" | "clipboard";

export type CtaVariant = {
  id: CtaId;
  slot: CtaSlot;
  /** Idle control label. */
  label: string;
  copied: string;
  hint: string;
  pickerLabel: string;
  icon: CtaIcon | null;
};

export const DEFAULT_CTA: CtaId = "ask";

export const CTA_STORAGE_KEY = "comprehende.cta";

export const CTA_QUERY = "cta";

export const CTA_VARIANTS: Record<CtaId, CtaVariant> = {
  ask: {
    id: "ask",
    slot: "kicker",
    label: "Ask AI about this",
    copied: "Copied",
    hint: "Copy a prompt for your coding agent",
    pickerLabel: "1 · Ask AI about this",
    icon: "sparkle",
  },
  explain: {
    id: "explain",
    slot: "kicker",
    label: "Explain with AI",
    copied: "Copied",
    hint: "Copy a prompt that explains this from live git",
    pickerLabel: "2 · Explain with AI",
    icon: "sparkle",
  },
  prompt: {
    id: "prompt",
    slot: "title",
    label: "Copy prompt",
    copied: "Copied",
    hint: "Copy the agent prompt",
    pickerLabel: "3 · Copy prompt",
    icon: null,
  },
  agent: {
    id: "agent",
    slot: "strip",
    label: "Copy",
    copied: "Copied",
    hint: "Copy a prompt for your coding agent",
    pickerLabel: "4 · Ask an agent",
    icon: "sparkle",
  },
  paste: {
    id: "paste",
    slot: "after",
    label: "Paste into your agent",
    copied: "Copied",
    hint: "Copy a prompt to paste into Cursor, Claude Code, or Codex",
    pickerLabel: "5 · Paste into your agent",
    icon: "clipboard",
  },
};

export function parseCtaId(raw: string | null | undefined): CtaId | null {
  if (raw === undefined || raw === null) {
    return null;
  }
  return (CTA_IDS as readonly string[]).includes(raw) ? (raw as CtaId) : null;
}

export function readCtaId(search?: string): CtaId {
  const query = search ?? (typeof window === "undefined" ? undefined : window.location.search);
  if (query !== undefined && query.length > 0) {
    const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
    const fromQuery = parseCtaId(params.get(CTA_QUERY));
    if (fromQuery !== null) {
      return fromQuery;
    }
  }
  try {
    if (typeof localStorage !== "undefined") {
      const fromStore = parseCtaId(localStorage.getItem(CTA_STORAGE_KEY));
      if (fromStore !== null) {
        return fromStore;
      }
    }
  } catch {
    // private mode
  }
  return DEFAULT_CTA;
}

export function writeCtaId(id: CtaId): void {
  try {
    localStorage.setItem(CTA_STORAGE_KEY, id);
  } catch {
    // quota / private mode
  }
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  url.searchParams.set(CTA_QUERY, id);
  window.history.replaceState(null, "", url);
}

export function stripCopy(scope: "overview" | "group"): string {
  return scope === "group" ? "Ask an agent about this group." : "Ask an agent about this change.";
}
