export function Kbd(props: { children: string }) {
  return <kbd className="font-mono text-[10px] font-normal text-muted-foreground">{props.children}</kbd>;
}
