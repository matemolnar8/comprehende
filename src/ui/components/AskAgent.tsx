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

const ASK_LABEL = "Ask agent";

/** A question row already says what the ask is about, so the label stays short. */
const QUESTION_ASK_LABEL = "Ask";

const ASK_ABOUT = {
  overview: "about this review",
  group: "about this group",
  question: "about this question",
} as const;

export function AskAgent(props: { prompt: string; scope: keyof typeof ASK_ABOUT }) {
  const { target, setTarget, repo } = useAgentTarget();
  const [copied, setCopied] = useState(false);
  const about = ASK_ABOUT[props.scope];
  const question = props.scope === "question";
  const link = agentLink(target, props.prompt, repo);
  const hint =
    link === null
      ? `Copy a prompt ${about} for your coding agent`
      : `Open a prompt ${about} in ${AGENT_TARGETS[target].label}`;

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

  // Outlined so it reads as a button, but not filled, so it does not outweigh the title.
  const variant = "outline";
  const tone = cn(
    "bg-card text-foreground data-[state=open]:bg-accent [&_svg]:text-muted-foreground",
    question && "-my-1 h-7 px-2 has-[>svg]:px-2",
  );
  const content = (
    <>
      <SparkleIcon aria-hidden className="size-3.5" />
      <span>{copied ? COPIED : question ? QUESTION_ASK_LABEL : ASK_LABEL}</span>
    </>
  );
  const main = {
    size: "sm",
    variant,
    className: cn(!question && "rounded-r-none", tone),
    "aria-label": copied ? COPIED : `${ASK_LABEL} ${about}`,
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
      {/* A question ask uses the target chosen on the main Ask agent menu, so it has no menu. */}
      {question ? null : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant={variant}
              className={cn("-ml-px rounded-l-none px-1.5 has-[>svg]:px-1.5", tone)}
              aria-label="Choose where to ask"
            >
              <ChevronDownIcon aria-hidden className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Where to ask</DropdownMenuLabel>
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
      )}
    </div>
  );
}
