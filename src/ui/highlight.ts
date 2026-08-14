import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import markdown from "highlight.js/lib/languages/markdown";
import yaml from "highlight.js/lib/languages/yaml";
import bash from "highlight.js/lib/languages/bash";
import python from "highlight.js/lib/languages/python";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("python", python);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);

const ALIASES: Record<string, string> = {
  tsx: "typescript",
  jsx: "javascript",
  html: "xml",
  htm: "xml",
  yml: "yaml",
  mjs: "javascript",
  cjs: "javascript",
  mts: "typescript",
  cts: "typescript",
  sh: "bash",
};

export function languageFromPath(path: string): string {
  const base = path.split("/").pop() ?? path;
  const ext = base.includes(".") ? (base.split(".").pop()?.toLowerCase() ?? "plaintext") : "plaintext";
  return ALIASES[ext] ?? ext;
}

function mappedLanguage(language: string): string | undefined {
  const mapped = ALIASES[language] ?? language;
  if (mapped === "plaintext" || !hljs.getLanguage(mapped)) {
    return undefined;
  }
  return mapped;
}

export function highlightLine(text: string, language: string): string {
  const mapped = mappedLanguage(language);
  if (mapped === undefined) {
    return escapeHtml(text);
  }
  return hljs.highlight(text, { language: mapped, ignoreIllegals: true }).value;
}

export function highlightSource(text: string, language: string): string {
  const mapped = mappedLanguage(language);
  if (mapped === undefined) {
    return escapeHtml(text);
  }
  return hljs.highlight(text, { language: mapped, ignoreIllegals: true }).value;
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
