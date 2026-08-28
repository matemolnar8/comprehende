import { peekLabels, type PeekStyle } from "../lib/peek-files.ts";

export function FilePeek(props: { paths: readonly string[]; style: PeekStyle }) {
  const { paths, style } = props;
  if (paths.length === 0) {
    return null;
  }
  const { dir, labels, rest } = peekLabels(paths, style);
  if (style === "line") {
    return (
      <span
        className="mt-1 flex min-w-0 items-baseline gap-1 font-mono text-[11px] leading-snug text-muted-foreground"
        aria-hidden
      >
        <span className="min-w-0 truncate">{labels.join(" · ")}</span>
        {rest > 0 ? <span className="shrink-0 opacity-70">+{rest}</span> : null}
      </span>
    );
  }
  const nameClass = dir === "" ? "block truncate" : "block truncate pl-2";
  return (
    <span className="mt-1 block min-w-0 font-mono text-[11px] leading-[1.45] text-muted-foreground" aria-hidden>
      {dir !== "" ? <span className="block truncate opacity-70">{dir}/</span> : null}
      {labels.map((label, i) => (
        <span key={i} className={nameClass}>
          {label}
        </span>
      ))}
      {rest > 0 ? <span className={`${nameClass} opacity-70`}>and {rest} more</span> : null}
    </span>
  );
}
