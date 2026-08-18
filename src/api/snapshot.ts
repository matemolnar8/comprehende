import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { findPackageRoot } from "../package-root.ts";
import {
  isUnavailableSnapshot,
  listResources,
  openReview,
  renderResource,
  snapshotJson,
  type ReviewContext,
} from "./live.ts";
import { apiFsRel } from "./paths.ts";

export type ExportOptions = {
  cwd: string;
  dataPath: string;
  outDir: string;
  uiRoot?: string;
  ctx?: ReviewContext;
};

export type ExportResult = {
  outDir: string;
  apiFiles: string[];
};

export async function exportStaticSite(opts: ExportOptions): Promise<ExportResult> {
  const outDir = resolve(opts.outDir);
  const uiRoot = opts.uiRoot ?? join(findPackageRoot(), "dist/ui");
  if (!existsSync(uiRoot)) {
    throw new Error(
      "UI is missing from this install. Reinstall comprehende from npm, or from a git checkout run `pnpm build`.",
    );
  }
  if (existsSync(join(outDir, ".git"))) {
    throw new Error(`refusing to write export into a git repository: ${outDir}`);
  }

  const ctx = opts.ctx ?? (await openReview(opts.cwd, opts.dataPath));
  await mkdir(outDir, { recursive: true });
  await rm(join(outDir, "assets"), { recursive: true, force: true });
  await rm(join(outDir, "api"), { recursive: true, force: true });
  await cp(uiRoot, outDir, { recursive: true });

  const apiFiles: string[] = [];
  for (const resource of listResources(ctx)) {
    let body: unknown;
    try {
      body = await renderResource(ctx, resource);
    } catch (error) {
      if (isUnavailableSnapshot(error)) {
        continue;
      }
      throw error;
    }
    const rel = apiFsRel(resource);
    const abs = join(outDir, ...rel.split("/"));
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, snapshotJson(body));
    apiFiles.push(rel);
  }
  return { outDir, apiFiles };
}
