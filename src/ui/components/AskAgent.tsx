import { useEffect, useState } from "react";
import { ChevronDownIcon, SparkleIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import { useAgentTarget } from "../lib/AgentTargetProvider.tsx";
import { AGENT_TARGET_IDS, AGENT_TARGETS, agentLink } from "../lib/agent-targets.ts";
import { copyText } from "../lib/copy-text.ts";

const COPIED_MS = 1600;

const COPIED = "Copied";

const ASK_CTA = {
  overview: { label: "Ask AI about this", about: "This review." },
  group: { label: "Ask AI about this", about: "This group." },
  question: { label: "Ask agent", about: "This question." },
} as const;

export function AskAgent(props: { prompt: string; scope: keyof typeof ASK_CTA }) {
  const { target, setTarget, repo } = useAgentTarget();
  const [copied, setCopied] = useState(false);
  const { label, about } = ASK_CTA[props.scope];
  const question = props.scope === "question";
  const link = agentLink(target, props.prompt, repo);
  const hint =
    link === null
      ? `Copy a prompt for your coding agent. ${about}`
      : `Open a draft prompt in ${AGENT_TARGETS[target].label}. ${about}`;

  useEffect(() => {
    setCopied(false);
  }, [props.prompt, target]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const id = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(id);
  }, [copied]);

  const variant = question ? "ghost" : "outline";
  const tone = question && "-my-1 h-7 text-muted-foreground hover:text-foreground";
  const content = (
    <>
      <SparkleIcon aria-hidden className="size-3.5" />
      <span className="max-[799px]:hidden">{copied ? COPIED : label}</span>
    </>
  );
  const main = {
    size: "sm",
    variant,
    className: cn("rounded-r-none max-[799px]:size-8 max-[799px]:px-0", tone),
    "aria-label": hint,
  } as const;

  return (
    <div className="flex shrink-0" data-cta="ask">
      <Tooltip>
        <TooltipTrigger asChild>
          {link === null ? (
            <Button
              {...main}
              type="button"
              aria-live="polite"
              onClick={() => {
                setCopied(true);
                void copyText(props.prompt).catch((cause: unknown) => {
                  setCopied(false);
                  console.error(cause);
                });
              }}
            >
              {content}
            </Button>
          ) : (
            <Button {...main} asChild>
              <a href={link}>{content}</a>
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent>{copied ? COPIED : hint}</TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant={variant}
            className={cn("rounded-l-none border-l-0 px-1.5 has-[>svg]:px-1.5", tone)}
            aria-label="Choose where to ask"
          >
            <ChevronDownIcon aria-hidden className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ask with</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={target}
            onValueChange={(value) => {
              const next = AGENT_TARGET_IDS.find((id) => id === value);
              if (next !== undefined) {
                setTarget(next);
              }
            }}
          >
            {AGENT_TARGET_IDS.map((id) => (
              <DropdownMenuRadioItem key={id} value={id}>
                {AGENT_TARGETS[id].label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
