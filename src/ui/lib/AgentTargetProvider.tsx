import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ApiReview } from "../../api/types.ts";
import {
  readStoredAgentTarget,
  writeStoredAgentTarget,
  type AgentTargetId,
} from "./agent-targets.ts";

type AgentTargetContextValue = {
  target: AgentTargetId;
  setTarget: (target: AgentTargetId) => void;
  repo: ApiReview["repo"];
};

const AgentTargetContext = createContext<AgentTargetContextValue | null>(null);

export function AgentTargetProvider(props: { repo: ApiReview["repo"]; children: ReactNode }) {
  const [target, setStateTarget] = useState(readStoredAgentTarget);
  const { repo } = props;

  const value = useMemo(
    () => ({
      target,
      setTarget: (next: AgentTargetId) => {
        writeStoredAgentTarget(next);
        setStateTarget(next);
      },
      repo,
    }),
    [target, repo],
  );

  return <AgentTargetContext.Provider value={value}>{props.children}</AgentTargetContext.Provider>;
}

export function useAgentTarget(): AgentTargetContextValue {
  const value = useContext(AgentTargetContext);
  if (value === null) {
    throw new Error("useAgentTarget must be used within AgentTargetProvider");
  }
  return value;
}
