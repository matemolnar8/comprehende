import { CTA_IDS, CTA_VARIANTS } from "../lib/cta.ts";
import { useCta } from "../lib/cta-context.tsx";

export function CtaPicker() {
  const { cta, setCta } = useCta();
  return (
    <label className="flex items-center gap-1.5 text-muted-foreground">
      <span className="font-mono text-[11px] tracking-wide">CTA</span>
      <select
        className="h-8 rounded-md border border-input bg-background px-2 font-mono text-xs text-foreground"
        value={cta}
        aria-label="CTA prototype"
        data-prototype="cta"
        onChange={(event) => {
          const next = CTA_IDS.find((id) => id === event.target.value);
          if (next !== undefined) {
            setCta(next);
          }
        }}
      >
        {CTA_IDS.map((id) => (
          <option key={id} value={id}>
            {CTA_VARIANTS[id].pickerLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
