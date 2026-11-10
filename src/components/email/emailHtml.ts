import { generateHTML, generateJSON } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import {
  EmailTokenNode,
  fromEditorHtml,
  toEditorHtml,
} from "@/src/components/email/emailTokenNode";
import { mapHtmlText } from "@/src/components/email/emailTokens";

// Only the formatting the email supports. Anything else (code blocks, quotes,
// tables, etc.) is dropped when HTML is loaded into the Text tab.
export const EMAIL_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    // target/rel are web-page defaults that email clients ignore
    link: { openOnClick: false, HTMLAttributes: { target: null, rel: null } },
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
  }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Image,
  EmailTokenNode,
];

const EMPTY_PARAGRAPH = /<p([^>]*)><\/p>/g;
const BLANK_LINE_PARAGRAPH = /<p([^>]*)><br\s*\/?><\/p>/g;

// The editor shows blank lines and repeated spaces, but in an email (and the
// preview) an empty <p></p> has no height and runs of spaces collapse to one.
// Write them so they survive outside the editor.
function keepWhitespace(html: string) {
  return mapHtmlText(
    html.replace(EMPTY_PARAGRAPH, "<p$1><br></p>"),
    // Every space after another space becomes a non-breaking space
    (text) => text.replace(/ (?= )/g, "&nbsp;"),
  );
}

// Text tab output -> the HTML that's stored, previewed and sent
export function fromTextEditorHtml(html: string) {
  return keepWhitespace(fromEditorHtml(html));
}

// Stored HTML -> what the Text tab loads. A <br> alone in a paragraph would
// otherwise load as a line break and make the blank line two lines tall.
export function toTextEditorHtml(html: string) {
  return toEditorHtml(html.replace(BLANK_LINE_PARAGRAPH, "<p$1></p>"));
}

// Runs HTML through the Text tab's rules, giving exactly what it would show
export function normalizeEmailHtml(html: string) {
  if (!html.trim()) return "";
  const json = generateJSON(toTextEditorHtml(html), EMAIL_EXTENSIONS);
  return fromTextEditorHtml(generateHTML(json, EMAIL_EXTENSIONS));
}

// The editor writes <b> as <strong> and <i> as <em>; that isn't a loss
const TAG_ALIASES: Record<string, string> = { b: "strong", i: "em" };

// Wrappers with no formatting of their own (their styles are still checked)
const STRUCTURAL_TAGS = new Set(["div", "span"]);

function collectFormatting(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const found = new Set<string>();

  doc.body.querySelectorAll("*").forEach((element) => {
    const tag = element.tagName.toLowerCase();
    if (!STRUCTURAL_TAGS.has(tag)) {
      found.add(`<${TAG_ALIASES[tag] ?? tag}>`);
    }

    if (element instanceof HTMLElement) {
      Array.from(element.style).forEach((property) => found.add(property));
    }
  });

  return found;
}

// Tags and inline styles in the HTML that switching to Text would remove
export function findUnsupportedFormatting(html: string) {
  const after = collectFormatting(normalizeEmailHtml(html));
  return [...collectFormatting(html)].filter((item) => !after.has(item));
}
