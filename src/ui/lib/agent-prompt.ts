import { agentClipboardPrompt } from "../../api/agent-md.ts";
import { resourceHref } from "../api.ts";

export function askAgentPrompt(target: "overview" | { group: string }): string {
  const resource =
    target === "overview"
      ? ({ kind: "agent-md", target: "overview" } as const)
      : ({ kind: "agent-md", target: "group", group: target.group } as const);
  return agentClipboardPrompt(resourceHref(resource));
}
