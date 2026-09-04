import { useEffect, useState } from "react";
import { SparkleIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { copyText } from "../lib/copy-text.ts";

const COPIED_MS = 1600;

const ASK_CTA = {
  label: "Ask AI about this",
  copied: "Copied",
  hint: "Copy a prompt for your coding agent",
} as const;

export function CopyPrompt(props: { prompt: string; scope: "overview" | "group" }) {
  const [copied, setCopied] = useState(false);
  const hint = `${ASK_CTA.hint}. ${props.scope === "group" ? "This group." : "This review."}`;

  useEffect(() => {
    setCopied(false);
  }, [props.prompt]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const id = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(id);
  }, [copied]);

  const text = copied ? ASK_CTA.copied : ASK_CTA.label;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0"
          aria-label={hint}
          aria-live="polite"
          data-cta="ask"
          onClick={() => {
            setCopied(true);
            void copyText(props.prompt).catch((cause: unknown) => {
              setCopied(false);
              console.error(cause);
            });
          }}
        >
          <SparkleIcon aria-hidden className="size-3.5" />
          {text}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? ASK_CTA.copied : hint}</TooltipContent>
    </Tooltip>
  );
}
