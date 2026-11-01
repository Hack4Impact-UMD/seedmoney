import { generateHTML, generateJSON } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";

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
];

// Runs HTML through the Text tab's rules, giving exactly what it would show
export function normalizeEmailHtml(html: string) {
  if (!html.trim()) return "";
  return generateHTML(generateJSON(html, EMAIL_EXTENSIONS), EMAIL_EXTENSIONS);
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
