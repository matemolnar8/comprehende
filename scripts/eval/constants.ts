export const DEFAULT_PRODUCER_MODEL = "composer-2.5";
export const DEFAULT_GRADER_MODEL = "grok-4.6";
export const TASK_TIMEOUT_MS = 20 * 60 * 1000;

export const PRODUCER_DISALLOWED_TOOLS = ["task", "webSearch", "webFetch", "mcp"] as const;
/** Empty: graders get the packet inline and must not walk the work tree. */
export const GRADER_TOOLS = [] as const;
