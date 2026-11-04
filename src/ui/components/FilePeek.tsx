import { fileBasename } from "../lib/file-nav.ts";

/** One whole name and a count, so the peek never cuts a name to fit a second one. */
export function FilePeek(props: { paths: readonly string[] }) {
  const [first] = props.paths;
  if (first === undefined) {
    return null;
  }
  const rest = props.paths.length - 1;
  return (
    <span
      className="mt-0.5 flex min-w-0 items-baseline gap-1.5 font-mono text-xs leading-snug text-foreground/70"
      aria-hidden
    >
      <span className="min-w-0 truncate">{fileBasename(first)}</span>
      {rest > 0 ? (
        <span className="shrink-0 font-sans">
          +{rest} {rest === 1 ? "file" : "files"}
        </span>
      ) : null}
    </span>
  );
}
