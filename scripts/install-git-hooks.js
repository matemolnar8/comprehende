import { chmodSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
if (!existsSync(join(root, ".git"))) {
  process.exit(0);
}
const destDir = join(root, ".git/hooks");
mkdirSync(destDir, { recursive: true });
const dest = join(destDir, "pre-commit");
copyFileSync(join(root, ".githooks/pre-commit"), dest);
chmodSync(dest, 0o755);
