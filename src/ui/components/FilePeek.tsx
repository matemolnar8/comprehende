import { fileBasename } from "../lib/file-nav.ts";
import { peekFiles } from "../lib/peek-files.ts";

export function FilePeek(props: { paths: readonly string[] }) {
  if (props.paths.length === 0) {
    return null;
  }
  const { shown, rest } = peekFiles(props.paths);
  return (
    <span
      className="mt-1 flex min-w-0 items-baseline gap-1 font-mono text-[11px] leading-snug text-muted-foreground"
      aria-hidden
    >
      <span className="min-w-0 truncate">{shown.map(fileBasename).join(" · ")}</span>
      {rest > 0 ? <span className="shrink-0 opacity-70">+{rest}</span> : null}
    </span>
  );
}
