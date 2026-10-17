import { useEffect, useState } from "react";

export const NARROW_QUERY = "(max-width: 799px)";

/** Narrow screens wrap by default so a line fits the card. An explicit toggle wins. */
export function resolveWrap(override: boolean | null, narrow: boolean): boolean {
  return override ?? narrow;
}

export function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches);
  useEffect(() => {
    const media = window.matchMedia(NARROW_QUERY);
    const onChange = () => setNarrow(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return narrow;
}
