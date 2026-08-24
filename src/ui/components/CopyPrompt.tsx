import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import { CTA_VARIANTS, stripCopy, type CtaSlot } from "../lib/cta.ts";
import { useCta } from "../lib/cta-context.tsx";

const COPIED_MS = 1600;

export function CopyPrompt(props: {
  prompt: string;
  slot: CtaSlot;
  scope: "overview" | "group";
}) {
  const { cta } = useCta();
  const variant = CTA_VARIANTS[cta];
  if (variant.slot !== props.slot) {
    return null;
  }

  const label = `${variant.hint}. ${props.scope === "group" ? "This group." : "This review."}`;
  const control = (
    <CopyControl
      prompt={props.prompt}
      cta={cta}
      label={label}
      idle={variant.label}
      copied={variant.copied}
    />
  );

  if (cta === "explain") {
    return (
      <CopyControl
        prompt={props.prompt}
        cta={cta}
        label={label}
        idle={variant.label}
        copied={variant.copied}
        className="h-auto px-0 font-mono text-[11px] tracking-wide"
        appearance="link"
      />
    );
  }

  if (cta === "prompt") {
    return (
      <CopyControl
        prompt={props.prompt}
        cta={cta}
        label={label}
        idle={variant.label}
        copied={variant.copied}
        appearance="chip"
      />
    );
  }

  if (cta === "agent") {
    return (
      <div
        className="mb-5 mt-1 flex items-baseline justify-between gap-4 border-t border-border pt-3"
        data-cta={cta}
        data-cta-slot={props.slot}
      >
        <p className="font-serif text-base italic text-muted-foreground">{stripCopy(props.scope)}</p>
        {control}
      </div>
    );
  }

  if (cta === "paste") {
    return (
      <CopyControl
        prompt={props.prompt}
        cta={cta}
        label={label}
        idle={variant.label}
        copied={variant.copied}
        className={props.scope === "overview" ? "mb-8" : "mt-4"}
      />
    );
  }

  return control;
}

function CopyControl(props: {
  prompt: string;
  cta: string;
  label: string;
  idle: string;
  copied: string;
  className?: string;
  appearance?: "button" | "link" | "chip";
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [props.cta, props.prompt]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const id = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(id);
  }, [copied]);

  const text = copied ? props.copied : props.idle;
  const appearance = props.appearance ?? "button";

  const onCopy = (): void => {
    void navigator.clipboard.writeText(props.prompt).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  let trigger: ReactNode;
  if (appearance === "chip") {
    trigger = (
      <button
        type="button"
        className={cn(
          "shrink-0 rounded-md border border-input px-2 py-1 font-mono text-[11px] tracking-wide text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
          props.className,
        )}
        aria-label={props.label}
        aria-live="polite"
        data-cta={props.cta}
        onClick={onCopy}
      >
        {text}
      </button>
    );
  } else if (appearance === "link") {
    trigger = (
      <Button
        type="button"
        size="sm"
        variant="link"
        className={cn(props.className)}
        aria-label={props.label}
        aria-live="polite"
        data-cta={props.cta}
        onClick={onCopy}
      >
        {text}
      </Button>
    );
  } else {
    trigger = (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={props.className}
        aria-label={props.label}
        aria-live="polite"
        data-cta={props.cta}
        onClick={onCopy}
      >
        {text}
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent>{copied ? props.copied : props.label}</TooltipContent>
    </Tooltip>
  );
}
