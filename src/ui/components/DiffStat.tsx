/** −/+ line counts. A zero side is noise, so it is left out. */
export function DiffStat(props: { removed: number; added: number }) {
  if (props.removed === 0 && props.added === 0) {
    return null;
  }
  return (
    <span className="shrink-0 font-mono text-xs tabular-nums">
      {props.removed > 0 ? <span className="text-del">−{props.removed}</span> : null}
      {props.removed > 0 && props.added > 0 ? " " : null}
      {props.added > 0 ? <span className="text-add">+{props.added}</span> : null}
    </span>
  );
}
