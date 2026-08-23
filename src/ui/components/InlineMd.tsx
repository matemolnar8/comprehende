import { createElement, type ReactNode } from "react";
import Markdown from "react-markdown";
import { flattenInline, INLINE_MD_ELEMENTS } from "../lib/inline-md.ts";

export function InlineMd(props: { text: string }): ReactNode {
  const text = flattenInline(props.text);
  if (text === "") {
    return null;
  }
  return createElement(Markdown, {
    skipHtml: true,
    unwrapDisallowed: true,
    allowedElements: INLINE_MD_ELEMENTS,
    children: text,
  });
}
