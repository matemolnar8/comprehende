import { useCallback, useEffect, useState } from "react";
import { readViewed, setPathViewed, viewedStorageKey, writeViewed } from "./viewed-files.ts";

export function useViewedFiles(baseSha: string | undefined, headSha: string | undefined) {
  const storageKey = baseSha !== undefined && headSha !== undefined ? viewedStorageKey(baseSha, headSha) : null;
  const [paths, setPaths] = useState(() => (storageKey === null ? new Set<string>() : readViewed(storageKey)));

  useEffect(() => {
    setPaths(storageKey === null ? new Set() : readViewed(storageKey));
  }, [storageKey]);

  const setFileViewed = useCallback(
    (path: string, viewed: boolean) => {
      if (storageKey === null) {
        return;
      }
      setPaths((current) => {
        const next = setPathViewed(current, path, viewed);
        writeViewed(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  return { viewedPaths: paths, setFileViewed };
}
