#!/usr/bin/env node

const USAGE = `Usage: comprehende <command> [options]

Run inside the git repository under review. Cwd is the repo.

Commands:
  index     [--base <ref>] [--head <ref>]   List hunk refs (no patch text)
  validate  --data <review.json>            Check coverage and schema
  serve     --data <review.json> [--port] [--open]
                                            Open the local review UI

Options:
  -h, --help       Show this help
  -v, --version    Show version
`;

const COMMANDS = new Set(["index", "validate", "serve"]);

function main(argv: string[]): number {
  const args = argv[0] === "--" ? argv.slice(1) : argv;
  const [command] = args;

  if (command === undefined || command === "--help" || command === "-h") {
    console.log(USAGE);
    return 0;
  }

  if (command === "--version" || command === "-v") {
    console.log("0.0.0");
    return 0;
  }

  if (COMMANDS.has(command)) {
    console.error(`comprehende ${command}: not implemented yet`);
    return 1;
  }

  console.error(`Unknown command: ${command}\n`);
  console.error(USAGE);
  return 1;
}

process.exitCode = main(process.argv.slice(2));
