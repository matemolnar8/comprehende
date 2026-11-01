import type { ApiReview } from "../../api/types.ts";
import { readKey, writeKey } from "./storage.ts";

type Repo = Pick<ApiReview["repo"], "origin" | "root">;

type AgentTarget = {
  label: string;
  /** A deep link that puts the prompt in the app's chat box. None of these send it. */
  link: ((prompt: string, repo: Repo) => string) | null;
};

export const AGENT_TARGETS = {
  copy: { label: "Copy prompt", link: null },
  claude: {
    label: "Claude Code",
    link: (prompt, repo) => deepLink("claude://code/new", { q: prompt, folder: repo.root }),
  },
  codex: {
    label: "Codex",
    link: (prompt, repo) => deepLink("codex://threads/new", { prompt, path: repo.root }),
  },
  cursor: {
    label: "Cursor",
    link: (prompt) => deepLink("cursor://anysphere.cursor-deeplink/prompt", { text: prompt }),
  },
  t3code: {
    label: "T3 Code",
    link: (prompt, repo) => deepLink("t3code://new", { prompt, repo: repoSlug(repo.origin) }),
  },
} satisfies Record<string, AgentTarget>;

export type AgentTargetId = keyof typeof AGENT_TARGETS;

export const AGENT_TARGET_IDS = Object.keys(AGENT_TARGETS) as AgentTargetId[];

const STORAGE_KEY = "comprehende.agent-target";

function isAgentTargetId(raw: string | null): raw is AgentTargetId {
  return raw !== null && Object.hasOwn(AGENT_TARGETS, raw);
}

export function readStoredAgentTarget(): AgentTargetId {
  const raw = readKey(localStorage, STORAGE_KEY);
  return isAgentTargetId(raw) ? raw : "copy";
}

export function writeStoredAgentTarget(target: AgentTargetId): void {
  writeKey(localStorage, STORAGE_KEY, target);
}

export function agentLink(target: AgentTargetId, prompt: string, repo: Repo): string | null {
  const { link } = AGENT_TARGETS[target];
  return link === null ? null : link(prompt, repo);
}

/** `owner/name` from the last two path segments of a remote URL. Apps match it to a local clone. */
export function repoSlug(origin: string | null): string | null {
  const match =
    origin === null ? null : /[/:]([^/:]+)\/([^/]+?)(?:\.git)?\/?$/i.exec(origin.trim());
  return match === null ? null : `${match[1]}/${match[2]}`;
}

/** encodeURIComponent, not URLSearchParams: some handlers read `+` as a plus sign. */
function deepLink(base: string, params: Record<string, string | null>): string {
  const query = Object.entries(params)
    .flatMap(([key, value]) => (value === null ? [] : [`${key}=${encodeURIComponent(value)}`]))
    .join("&");
  return query === "" ? base : `${base}?${query}`;
}
