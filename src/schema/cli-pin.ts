export function cliPin(version: string): string {
  return `npx comprehende@${version}`;
}

const PIN = /npx comprehende@([^\s`]+)/g;

export function listedCliPins(markdown: string): string[] {
  return [...markdown.matchAll(PIN)].map((match) => match[1] ?? "");
}

export function applyCliPin(markdown: string, version: string): string {
  return markdown.replace(PIN, cliPin(version));
}

export function cliPinErrors(markdown: string, version: string): string[] {
  const expected = cliPin(version);
  const pins = listedCliPins(markdown);
  if (pins.length === 0) {
    return [`SKILL.md must pin ${expected}`];
  }
  return [...new Set(pins.filter((pin) => pin !== version))].map(
    (pin) => `SKILL.md pins npx comprehende@${pin}, package.json version is ${version}`,
  );
}
