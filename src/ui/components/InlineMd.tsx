import type { ReactNode } from "react";
import { parseInline, type InlineNode } from "../lib/inline-md.ts";

export function InlineMd(props: { text: string }): ReactNode {
  return renderInline(parseInline(props.text));
}

function renderInline(nodes: InlineNode[]): ReactNode {
  return nodes.map((node, index) => renderNode(node, index));
}

function renderNode(node: InlineNode, key: number): ReactNode {
  switch (node.type) {
    case "text":
      return node.value;
    case "code":
      return <code key={key}>{node.value}</code>;
    case "em":
      return <em key={key}>{renderInline(node.children)}</em>;
    case "strong":
      return <strong key={key}>{renderInline(node.children)}</strong>;
  }
}
