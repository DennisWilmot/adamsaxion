import type { Components } from "react-markdown";
import type { ReactNode } from "react";

function getPlainText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(getPlainText).join("");
  if (typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return getPlainText(props?.children ?? "");
  }
  return "";
}

function isStrongElement(
  node: ReactNode
): node is React.ReactElement<{ children?: ReactNode }> {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    node.type === "strong"
  );
}

function getFirstChild(nodes: ReactNode): ReactNode | null {
  if (Array.isArray(nodes)) return nodes[0] ?? null;
  return nodes;
}

const DEFINITION_VERBS = /^(is|are|means|refers to|describes|can be defined as)\b/i;

export const lessonMarkdownComponents: Components = {
  p({ children }) {
    const nodes = Array.isArray(children) ? children : [children];
    const first = getFirstChild(children);
    const plainText = getPlainText(children).trim();

    // **Term** is/are/means … → definition callout
    if (isStrongElement(first)) {
      const term = getPlainText(first.props.children).trim();
      const afterStrong = plainText.slice(term.length).trim();

      if (term && DEFINITION_VERBS.test(afterStrong)) {
        const rest = nodes.slice(1);
        return (
          <div className="lesson-definition-callout">
            <p className="lesson-definition-term">{term}</p>
            {rest.length > 0 ? (
              <p className="lesson-definition-body">{rest}</p>
            ) : null}
          </div>
        );
      }

      // **Label:** description → scannable key-point row
      if (term.endsWith(":")) {
        const rest = nodes.slice(1);
        return (
          <p className="lesson-key-point">
            <strong>{term}</strong>
            {rest.length > 0 ? <> {rest}</> : null}
          </p>
        );
      }
    }

    return <p>{children}</p>;
  },
};
