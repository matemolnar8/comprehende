export function MovedChip(props: { label: string }) {
  return (
    <p className="border-l-2 border-primary/50 bg-primary/5 px-2 py-1 font-mono text-[11px] text-muted-foreground">
      <span className="text-foreground">Moved</span> {props.label}
    </p>
  );
}
