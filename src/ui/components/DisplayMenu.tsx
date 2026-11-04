import type { ReactNode } from "react";
import { MoonIcon, RotateCwIcon, SlidersHorizontalIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useMonoFont } from "@/lib/MonoFontProvider.tsx";
import { useTheme } from "@/lib/ThemeProvider.tsx";
import { cn } from "@/lib/utils.ts";
import type { ThemePreference } from "../lib/theme.ts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Kbd } from "./Kbd.tsx";

const THEME_LABELS = {
  auto: "Follow system",
  light: "Light",
  dark: "Dark",
} satisfies Record<ThemePreference, string>;

const THEME_CHOICES: readonly ThemePreference[] = ["auto", "light", "dark"];

/** Display settings that do not change what the review says: wrap, comments, code font, theme. */
export function DisplayMenu(props: {
  wrap: boolean;
  onWrap: () => void;
  /** Where the header has no Refresh button of its own, the menu carries it. */
  onRefresh?: () => void;
  comments?: boolean;
  onComments?: () => void;
  labelClassName?: string;
  triggerClassName?: string;
}) {
  const { preference, setPreference } = useTheme();
  const { font, toggleMonoFont } = useMonoFont();
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                "text-muted-foreground hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground [&_svg]:size-3.5",
                props.triggerClassName,
              )}
            >
              <SlidersHorizontalIcon />
              <span className={props.labelClassName}>Display</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Wrap, comments, code font, theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="min-w-60">
        <DropdownMenuLabel>Code</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={props.wrap} onCheckedChange={props.onWrap}>
          <ItemText shortcut="w">Wrap long lines</ItemText>
        </DropdownMenuCheckboxItem>
        {props.onComments !== undefined ? (
          <DropdownMenuCheckboxItem
            checked={props.comments === true}
            onCheckedChange={props.onComments}
          >
            <ItemText shortcut="c">Show review comments</ItemText>
          </DropdownMenuCheckboxItem>
        ) : null}
        <DropdownMenuCheckboxItem checked={font === "iosevka"} onCheckedChange={toggleMonoFont}>
          <ItemText>Iosevka for code</ItemText>
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(value) => {
            const next = THEME_CHOICES.find((choice) => choice === value);
            if (next !== undefined) {
              setPreference(next);
            }
          }}
        >
          {THEME_CHOICES.map((choice) => (
            <DropdownMenuRadioItem key={choice} value={choice}>
              {THEME_LABELS[choice]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {props.onRefresh !== undefined ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={props.onRefresh} className="pl-8 font-normal">
              <span className="absolute left-2 flex size-4 items-center justify-center">
                <RotateCwIcon aria-hidden />
              </span>
              <ItemText shortcut="r">Refresh</ItemText>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Flips between light and dark. The menu keeps the full choice, with "Follow system". */
export function ThemeButton() {
  const { resolved, setPreference } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  const action = `Use ${next} theme`;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={action}
          onClick={() => setPreference(next)}
          className="text-muted-foreground hover:text-foreground"
        >
          {next === "dark" ? <MoonIcon /> : <SunIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{action}</TooltipContent>
    </Tooltip>
  );
}

function ItemText(props: { children: ReactNode; shortcut?: string }) {
  return (
    <span className="flex flex-1 items-center gap-4">
      <span className="flex-1">{props.children}</span>
      {props.shortcut !== undefined ? (
        <Kbd className="text-muted-foreground max-[800px]:hidden">{props.shortcut}</Kbd>
      ) : null}
    </span>
  );
}
