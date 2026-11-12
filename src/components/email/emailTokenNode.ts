import { Node, nodeInputRule } from "@tiptap/react";
import {
  EMAIL_TOKENS,
  getEmailToken,
  mapHtmlText,
  tokenPattern,
  tokenText,
  type EmailTokenKey,
} from "@/src/components/email/emailTokens";

export const EMAIL_TOKEN_NODE = "emailToken";

// A token shown as a chip in the Text tab. It can't be edited letter by letter,
// so it's always deleted or moved as a whole.
export const EmailTokenNode = Node.create({
  name: EMAIL_TOKEN_NODE,
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      key: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-token"),
        renderHTML: (attributes) => ({ "data-token": attributes.key }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-token]",
        getAttrs: (element) =>
          getEmailToken(element.getAttribute("data-token") ?? "") ? null : false,
      },
    ];
  },

  // Turned back into plain {{key}} text by fromEditorHtml
  renderHTML({ node, HTMLAttributes }) {
    return ["span", HTMLAttributes, tokenText(node.attrs.key)];
  },

  renderText({ node }) {
    return tokenText(node.attrs.key);
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("span");
      dom.className = "email-token";
      dom.contentEditable = "false";
      dom.textContent = getEmailToken(node.attrs.key)?.label ?? node.attrs.key;
      return { dom };
    };
  },

  // Typing {{first_name}} turns it into a chip
  addInputRules() {
    const keys = EMAIL_TOKENS.map(({ key }) => key).join("|");
    return [
      nodeInputRule({
        find: new RegExp(`\\{\\{(${keys})\\}\\}$`),
        type: this.type,
        getAttributes: (match) => ({ key: match[1] }),
      }),
    ];
  },
});

// {{key}} text -> chip markup the editor understands
export function toEditorHtml(html: string) {
  return mapHtmlText(html, (text) =>
    text.replace(
      tokenPattern(),
      (_, key: EmailTokenKey) =>
        `<span data-token="${key}">${tokenText(key)}</span>`,
    ),
  );
}

// Chip markup -> plain {{key}} text, which is what gets stored and sent
export function fromEditorHtml(html: string) {
  return html.replace(
    /<span[^>]*\bdata-token="([a-z_]+)"[^>]*>[^<]*<\/span>/g,
    (_, key: EmailTokenKey) => tokenText(key),
  );
}
