import { useEffect, useState } from "react";
import { waitVisible } from "./wait.ts";

export function useDelayedFlag(active: boolean, delayMs: number): boolean {
  const [elapsedMs, setElapsedMs] = useState(delayMs <= 0 ? delayMs : 0);
  useEffect(() => {
    if (!active) {
      setElapsedMs(0);
      return;
    }
    if (delayMs <= 0) {
      setElapsedMs(0);
      return;
    }
    setElapsedMs(0);
    const id = window.setTimeout(() => setElapsedMs(delayMs), delayMs);
    return () => window.clearTimeout(id);
  }, [active, delayMs]);
  return waitVisible(active, elapsedMs, delayMs);
}
