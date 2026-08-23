import { createElement, type ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import { flattenInline, INLINE_MD_ELEMENTS } from "../lib/inline-md.ts";

const CODE_CLASS =
  "mx-[0.08em] box-decoration-clone rounded-[0.22em] bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-[0.32em] py-[0.12em] font-mono text-[0.86em] font-medium not-italic";

const components = {
  code: ({ children }) => createElement("code", { className: CODE_CLASS }, children),
  strong: ({ children }) => createElement("strong", { className: "font-semibold" }, children),
} satisfies Components;

export function InlineMd(props: { text: string }): ReactNode {
  const text = flattenInline(props.text);
  if (text === "") {
    return null;
  }
  return createElement(Markdown, {
    skipHtml: true,
    unwrapDisallowed: true,
    allowedElements: [...INLINE_MD_ELEMENTS],
    components,
    children: text,
  });
}
