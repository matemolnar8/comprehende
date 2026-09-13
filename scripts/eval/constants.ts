export const DEFAULT_PRODUCER_MODEL = "grok-4.6";
export const DEFAULT_GRADER_MODEL = "claude-sonnet-5";
export const TASK_TIMEOUT_MS = 20 * 60 * 1000;

export const PRODUCER_DISALLOWED_TOOLS = ["task", "webSearch", "webFetch", "mcp"] as const;
export const GRADER_TOOLS = ["read", "grep", "glob", "ls"] as const;
