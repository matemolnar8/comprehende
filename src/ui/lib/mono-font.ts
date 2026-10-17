import { readKey, writeKey } from "./storage.ts";

export type MonoFont = "plex" | "iosevka";

export const MONO_FONT_STORAGE_KEY = "comprehende.mono-font";

export function parseMonoFont(raw: string | null): MonoFont {
  return raw === "iosevka" ? "iosevka" : "plex";
}

export function nextMonoFont(font: MonoFont): MonoFont {
  return font === "plex" ? "iosevka" : "plex";
}

export function applyMonoFont(font: MonoFont): void {
  document.documentElement.dataset.monoFont = font;
}

export function readStoredMonoFont(): MonoFont {
  return parseMonoFont(readKey(localStorage, MONO_FONT_STORAGE_KEY));
}

export function writeStoredMonoFont(font: MonoFont): void {
  writeKey(localStorage, MONO_FONT_STORAGE_KEY, font);
}
