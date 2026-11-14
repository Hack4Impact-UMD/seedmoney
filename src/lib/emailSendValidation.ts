import "server-only";

import { parser } from "@lezer/html";
import { HtmlValidate } from "html-validate/browser";
import sanitizeHtml from "sanitize-html";
import { EXAMPLE_TOKEN_VALUES, fillEmailTokens, tokenPattern } from "@/src/components/email/emailTokens";
import { emailDraftValuesError } from "@/src/lib/emailDraftValidation";
import type { EmailDraftValues } from "@/src/types/db/adminEmails";

export type EmailSendInput = EmailDraftValues & {
  competitionId: number | null;
  mode: "send" | "test";
  testEmail?: string;
};
export type EmailSendValidationResult = { success: true; recipientCount: number } | { success: false; errors: string[] };

const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
// The static entry point avoids filesystem config discovery on the server.
const HTML_VALIDATOR = new HtmlValidate({ root: true, elements: ["html5"], rules: {
  "close-order": "error", "void-content": "error", "element-permitted-content": "error",
  "element-permitted-parent": "error", "element-permitted-order": "error", "element-required-ancestor": "error",
} });
const LENGTH = /^(?:0|\d+(?:\.\d+)?(?:px|pt|em|rem|%))(?:\s+(?:0|\d+(?:\.\d+)?(?:px|pt|em|rem|%))){0,3}$/;
const COLOR = /^(?:#[\da-f]{3,8}|[a-z]+|rgba?\([\d\s.,%/]+\))$/i;
const STYLES = {
  "text-align": [/^(?:left|right|center|justify)$/], "color": [COLOR], "background-color": [COLOR],
  "font-size": [LENGTH], "font-family": [/^[\w\s,'"-]+$/], "font-weight": [/^(?:normal|bold|[1-9]00)$/],
  "font-style": [/^(?:normal|italic|oblique)$/], "text-decoration": [/^(?:none|underline|line-through)$/],
  "line-height": [/^(?:normal|\d+(?:\.\d+)?(?:px|pt|em|rem|%)?)$/],
  "margin": [LENGTH], "margin-top": [LENGTH], "margin-bottom": [LENGTH], "margin-left": [LENGTH], "margin-right": [LENGTH],
  "padding": [LENGTH], "padding-top": [LENGTH], "padding-bottom": [LENGTH], "padding-left": [LENGTH], "padding-right": [LENGTH],
  "width": [LENGTH], "height": [LENGTH], "max-width": [LENGTH], "border-collapse": [/^(?:collapse|separate)$/],
};

function safeUrl(value: string, protocols: string[]) {
  if (/[\s\p{Cc}]/u.test(value)) return false;
  try {
    const url = new URL(value);
    return protocols.includes(url.protocol) && !url.username && !url.password && Boolean(url.hostname || url.pathname);
  } catch { return false; }
}

export function validCampaignUrl(value: string | null) {
  if (!value || !safeUrl(value, ["https:"])) return false;
  const url = new URL(value);
  return ["givebutter.com", "www.givebutter.com"].includes(url.hostname) && !url.port && url.pathname !== "/";
}

export function emailContentErrors(input: unknown): string[] {
  const invalid = emailDraftValuesError(input);
  if (invalid) return [invalid];
  const { subject, bodyHtml } = input as EmailDraftValues;
  const errors = new Set<string>();
  if (!subject.trim()) errors.add("Enter an email subject.");
  if (/\p{Cc}/u.test(subject)) errors.add("The subject cannot contain line breaks or control characters.");
  for (const source of [subject, bodyHtml]) {
    if (/\{\{\{|\}\}\}/.test(source) || /\{\{|\}\}/.test(source.replace(tokenPattern(), ""))) {
      errors.add("Use only complete {{first_name}} and {{campaign_url}} placeholders.");
    }
  }
  const tree = parser.parse(bodyHtml);
  tree.iterate({ enter(ref) {
    const node = ref.node;
    if (node.type.isError) errors.add("The message contains malformed HTML. Check tag nesting and attribute quotes.");
    if (node.name === "Comment" || node.name === "DoctypeDecl") errors.add("Use an HTML body fragment without comments or a document declaration.");
    if (node.name === "OpenTag" || node.name === "SelfClosingTag") {
      const seen = new Set<string>();
      for (const attribute of node.getChildren("Attribute")) {
        const name = attribute.getChild("AttributeName");
        const key = name ? bodyHtml.slice(name.from, name.to).toLowerCase() : "";
        if (seen.has(key)) errors.add("Remove duplicate HTML attributes before sending.");
        seen.add(key);
      }
    }
    if (node.name === "Element" && node.firstChild?.name === "OpenTag" && node.lastChild?.name !== "CloseTag") {
      errors.add("Close every non-void HTML tag before sending.");
    }
    if (node.name === "SelfClosingTag") {
      const name = node.getChild("TagName");
      if (name && !VOID_TAGS.has(bodyHtml.slice(name.from, name.to).toLowerCase())) errors.add("Use closing tags for non-void HTML elements.");
    }
    if (node.name === "Attribute") {
      const source = bodyHtml.slice(node.from, node.to);
      if (/\{\{|\}\}/.test(source)) {
        const name = node.getChild("AttributeName"), value = node.getChild("AttributeValue");
        if (!name || bodyHtml.slice(name.from, name.to).toLowerCase() !== "href" || !value ||
          !/^(["'])\{\{\s*campaign_url\s*\}\}\1$/.test(bodyHtml.slice(value.from, value.to))) {
          errors.add("Placeholders belong in text, or use {{campaign_url}} as the entire quoted href value.");
        }
      }
    }
  } });
  if (!errors.size) {
    const report = HTML_VALIDATOR.validateStringSync(`<div>\n${bodyHtml}\n</div>`);
    for (const message of report.results.flatMap(result => result.messages).slice(0, 5)) {
      errors.add(`HTML line ${Math.max(1, message.line - 1)}, column ${message.column}: ${message.message}`);
    }
  }
  if (errors.size) return [...errors];

  const html = fillEmailTokens(bodyHtml, EXAMPLE_TOKEN_VALUES);
  // Compare canonical forms, so normal quote/entity/style serialization isn't an error.
  // Never send a silently stripped or repaired version of the admin's draft.
  const canonical = sanitizeHtml(html, { allowedTags: false, allowedAttributes: false,
    allowedSchemesAppliedToAttributes: [], allowVulnerableTags: true });
  const safe = sanitizeHtml(html, {
    allowedTags: ["p", "br", "div", "span", "strong", "b", "em", "i", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "a", "img", "table", "thead", "tbody", "tfoot", "tr", "td", "th", "hr", "blockquote", "pre", "code", "center"],
    allowedAttributes: {
      "*": ["style", "title", "dir", "lang"], a: ["href", "target", "rel", "name"], img: ["src", "alt", "width", "height"],
      table: ["border", "cellpadding", "cellspacing", "width", "align", "bgcolor", "role"],
      td: ["colspan", "rowspan", "width", "height", "align", "valign", "bgcolor"],
      th: ["colspan", "rowspan", "width", "height", "align", "valign", "bgcolor"],
      ol: ["start"], p: ["align"],
    },
    allowedStyles: { "*": STYLES }, allowProtocolRelative: false,
    allowedSchemes: ["https", "http", "mailto", "tel"], allowedSchemesByTag: { img: ["https", "http"] },
    onOpenTag(tag, attributes) {
      if (attributes.href && !safeUrl(attributes.href, ["https:", "http:", "mailto:", "tel:"])) errors.add("Links must use an absolute HTTP(S), mailto, or tel URL.");
      if (tag === "img" && (!attributes.src || !safeUrl(attributes.src, ["https:", "http:"]))) errors.add("Images need an absolute HTTP(S) source URL.");
    },
  });
  if (safe !== canonical) errors.add("The HTML contains unsafe or unsupported tags, attributes, or styles. Remove them before sending.");
  const text = sanitizeHtml(safe, { allowedTags: [], allowedAttributes: {} }).replace(/[\s\u200b-\u200d\ufeff]/g, "");
  if (!text && !/<img\b/i.test(safe)) errors.add("Enter a message before sending.");
  return [...errors];
}
