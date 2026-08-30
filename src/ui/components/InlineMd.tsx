import { createElement, type ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import { defaultUrlTransform } from "react-markdown";
import { flattenInline, INLINE_MD_ELEMENTS } from "../lib/inline-md.ts";
import { parseSourceHref } from "../../schema/source.ts";
import { useSources } from "../lib/sources-context.tsx";
import { SourceCite, StaleCite } from "./SourceCite.tsx";

const CODE_CLASS =
  "mx-[0.08em] box-decoration-clone rounded-[0.22em] bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-[0.32em] py-[0.12em] font-mono text-[0.86em] font-medium not-italic";

function urlTransform(value: string): string {
  if (value.startsWith("source:")) {
    return value;
  }
  return defaultUrlTransform(value);
}

export function InlineMd(props: { text: string }): ReactNode {
  const text = flattenInline(props.text);
  const sources = useSources();
  if (text === "") {
    return null;
  }
  const components = {
    code: ({ children }) => createElement("code", { className: CODE_CLASS }, children),
    strong: ({ children }) => createElement("strong", { className: "font-semibold" }, children),
    a: ({ href, children }) => {
      const id = parseSourceHref(href);
      if (id === undefined) {
        if (href === undefined || href === "") {
          return createElement("span", null, children);
        }
        return createElement("a", { href, className: "text-primary hover:underline", target: "_blank", rel: "noreferrer" }, children);
      }
      const source = sources?.byId.get(id);
      if (source === undefined) {
        return createElement(StaleCite, { children });
      }
      return createElement(SourceCite, { source, onCite: sources?.onCite, children });
    },
  } satisfies Components;
  return createElement(Markdown, {
    skipHtml: true,
    unwrapDisallowed: true,
    allowedElements: [...INLINE_MD_ELEMENTS],
    urlTransform,
    components,
    children: text,
  });
}
