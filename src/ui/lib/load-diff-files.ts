import type { FileContents, FileDiffLoadedFiles, FileDiffMetadata } from "@pierre/diffs";
import type { ApiFile, FileSide } from "../../api/types.ts";

export function canHydrateDiff(fileDiff: Pick<FileDiffMetadata, "isPartial" | "type">): boolean {
  return (
    fileDiff.isPartial &&
    (fileDiff.type === "change" || fileDiff.type === "rename-changed" || fileDiff.type === "rename-pure")
  );
}

export function toPierreFile(file: ApiFile): FileContents {
  return {
    name: file.path,
    contents: file.content,
    cacheKey: `${file.side}:${file.ref}:${file.path}`,
  };
}

export async function loadDiffFilesWith(
  fileDiff: Pick<FileDiffMetadata, "name" | "type">,
  loadSide: (path: string, side: FileSide) => Promise<ApiFile>,
): Promise<FileDiffLoadedFiles> {
  if (fileDiff.type === "rename-pure") {
    const next = await loadSide(fileDiff.name, "new");
    return { oldFile: null, newFile: toPierreFile(next) };
  }
  const [oldFile, newFile] = await Promise.all([
    loadSide(fileDiff.name, "old"),
    loadSide(fileDiff.name, "new"),
  ]);
  return { oldFile: toPierreFile(oldFile), newFile: toPierreFile(newFile) };
}
