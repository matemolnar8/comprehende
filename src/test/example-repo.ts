import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { git } from "../git/exec.ts";

export const SECRET_ADD = "UNIQUE_ADDED_LINE_CONTENT_7f3a";
export const SECRET_DEL = "UNIQUE_REMOVED_LINE_CONTENT_9c1b";

export type ExampleRepo = {
  root: string;
  base: string;
  head: string;
};

export async function createExampleRepo(root: string): Promise<ExampleRepo> {
  await mkdir(root, { recursive: true });
  await git(root, ["init", "-b", "main"]);
  await git(root, ["config", "user.email", "comprehende@example.com"]);
  await git(root, ["config", "user.name", "Comprehende Fixture"]);
  await git(root, ["config", "commit.gpgsign", "false"]);

  await mkdir(join(root, "src"), { recursive: true });
  await mkdir(join(root, "assets"), { recursive: true });

  await writeFile(join(root, "src/app.ts"), appFile("alpha", SECRET_DEL), "utf8");
  await writeFile(
    join(root, "src/util.ts"),
    [
      'export const label = "util";',
      "export function help(): number {",
      "  return 1;",
      "}",
      "export function keep(): string {",
      '  return "stable-for-rename-detection";',
      "}",
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(join(root, "src/types.ts"), "export type Id = string;\n", "utf8");
  await writeFile(join(root, "README.md"), "# Example\n\nBase readme.\n", "utf8");
  await writeFile(join(root, "assets/dot.bin"), Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff]));

  await git(root, ["add", "."]);
  await git(root, ["commit", "-m", "Initial example #1"]);
  const base = (await git(root, ["rev-parse", "HEAD"])).trim();

  await writeFile(join(root, "src/app.ts"), appFile("beta", SECRET_ADD), "utf8");
  await git(root, ["mv", "src/util.ts", "src/helpers.ts"]);
  await writeFile(
    join(root, "src/helpers.ts"),
    [
      'export const label = "helpers";',
      "export function help(): number {",
      "  return 1;",
      "}",
      "export function keep(): string {",
      '  return "stable-for-rename-detection";',
      "}",
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(join(root, "src/types.ts"), "export type Id = string | number;\n", "utf8");
  await writeFile(
    join(root, "src/app.test.ts"),
    'import { name } from "./app.ts";\n\ntest("name", () => {\n  if (name !== "beta") throw new Error("fail");\n});\n',
    "utf8",
  );
  await writeFile(join(root, "README.md"), "# Example\n\nHead readme with more detail.\n", "utf8");
  await writeFile(join(root, "assets/dot.bin"), Buffer.from([0x00, 0x01, 0x02, 0x03, 0xfe]));

  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", "Split app hunks, rename util, widen Id"]);
  const head = (await git(root, ["rev-parse", "HEAD"])).trim();
  return { root, base, head };
}

function appFile(name: string, marker: string): string {
  const lines = [
    `export const name = "${name}";`,
    "export function start(): string {",
    "  return name;",
    "}",
    `const marker = "${marker}";`,
    "export function unusedMarker(): string {",
    "  return marker;",
    "}",
    "export function midA(): number { return 1; }",
    "export function midB(): number { return 2; }",
    "export function midC(): number { return 3; }",
    "export function midD(): number { return 4; }",
    "export function midE(): number { return 5; }",
    "export function midF(): number { return 6; }",
    "export function midG(): number { return 7; }",
    "export function midH(): number { return 8; }",
    "export function midI(): number { return 9; }",
    "export function midJ(): number { return 10; }",
    ...Array.from({ length: 80 }, (_, i) => `export const pad${String(i).padStart(2, "0")} = ${i};`),
    "export function end(): string {",
    `  return "${name}-end";`,
    "}",
    "",
  ];
  return lines.join("\n");
}
