import { createElement, Fragment, type ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import { defaultUrlTransform } from "react-markdown";
import { codeBreakParts, flattenInline, INLINE_MD_ELEMENTS } from "../lib/inline-md.ts";
import { parseSourceHref, SOURCE_HREF_PREFIX } from "../../schema/source.ts";
import { useSources } from "../lib/sources-context.tsx";
import { SourceCite, StaleCite } from "./SourceCite.tsx";

/** Code in prose: mono only, no chip, so a sentence still reads as a sentence. */
const CODE_CLASS = "font-mono text-[0.92em] not-italic";
/** Short tokens such as `--ui` never break. Longer ones break only after `/` or `.`, never mid-name. */
const NOWRAP_MAX = 24;

function InlineCode(props: { children: ReactNode }): ReactNode {
  const { children } = props;
  if (typeof children !== "string") {
    return createElement("code", { className: CODE_CLASS }, children);
  }
  const parts = children.length <= NOWRAP_MAX ? [children] : codeBreakParts(children);
  if (parts.length === 1 && children.length > NOWRAP_MAX) {
    return createElement("code", { className: `${CODE_CLASS} break-all` }, children);
  }
  return createElement(
    "code",
    { className: `${CODE_CLASS} whitespace-nowrap` },
    parts.map((part, i) =>
      createElement(Fragment, { key: i }, i > 0 ? createElement("wbr") : null, part),
    ),
  );
}

function urlTransform(value: string): string {
  if (value.startsWith(SOURCE_HREF_PREFIX)) {
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
    code: ({ children }) => createElement(InlineCode, { children }),
    strong: ({ children }) => createElement("strong", { className: "font-semibold" }, children),
    a: ({ href, children }) => {
      const id = parseSourceHref(href);
      if (id === undefined) {
        if (href === undefined || href === "") {
          return createElement("span", null, children);
        }
        return createElement(
          "a",
          { href, className: "text-primary hover:underline", target: "_blank", rel: "noreferrer" },
          children,
        );
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
