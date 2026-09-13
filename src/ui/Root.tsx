import { useEffect, useState, type ReactNode } from "react";
import { fetchCompare } from "./api.ts";
import { App } from "./App.tsx";
import { CompareApp } from "./CompareApp.tsx";
import { Logo } from "./components/Logo.tsx";
import { WaitMark } from "./components/WaitMark.tsx";
import { waitCopy } from "./lib/wait.ts";
import { PierreDiffPool } from "./PierreDiff.tsx";
import type { ComparePayload } from "../review/compare.ts";
import { cn } from "@/lib/utils.ts";

export function Root() {
  const [boot, setBoot] = useState<"load" | "compare" | "review" | "error">("load");
  const [payload, setPayload] = useState<ComparePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchCompare()
      .then((data) => {
        if (data === null) {
          setBoot("review");
          return;
        }
        setPayload(data);
        setBoot("compare");
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : String(cause));
        setBoot("error");
      });
  }, []);

  if (boot === "load") {
    return (
      <Boot>
        <p className="mb-5">
          <Logo />
        </p>
        <WaitMark layout="page" label={waitCopy.review} />
      </Boot>
    );
  }
  if (boot === "error") {
    return <Boot className="text-warn">{error}</Boot>;
  }
  if (boot === "compare" && payload !== null) {
    return <CompareApp payload={payload} />;
  }
  return (
    <PierreDiffPool>
      <App />
    </PierreDiffPool>
  );
}

function Boot(props: { children: ReactNode; className?: string }) {
  return <div className={cn("px-10 py-8 text-muted-foreground", props.className)}>{props.children}</div>;
}
