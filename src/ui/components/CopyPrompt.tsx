import { useEffect, useState } from "react";
import { SparkleIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import { copyText } from "../lib/copy-text.ts";

const COPIED_MS = 1600;

const COPIED = "Copied";

const ASK_CTA = {
  overview: {
    label: "Ask AI about this",
    hint: "Copy a prompt for your coding agent. This review.",
  },
  group: { label: "Ask AI about this", hint: "Copy a prompt for your coding agent. This group." },
  question: { label: "Ask agent", hint: "Copy this question for your coding agent." },
} as const;

export function CopyPrompt(props: { prompt: string; scope: keyof typeof ASK_CTA }) {
  const [copied, setCopied] = useState(false);
  const { label, hint } = ASK_CTA[props.scope];
  const question = props.scope === "question";

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

  const text = copied ? COPIED : label;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant={question ? "ghost" : "outline"}
          className={cn(
            "shrink-0 max-[799px]:size-8 max-[799px]:px-0",
            question && "-my-1 h-7 text-muted-foreground hover:text-foreground",
          )}
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
          <span className="max-[799px]:hidden">{text}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? COPIED : hint}</TooltipContent>
    </Tooltip>
  );
}
