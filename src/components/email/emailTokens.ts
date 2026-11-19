// Personalization tokens. In the email HTML a token is plain text like
// {{first_name}}, and it's filled in separately for each recipient at send time.
// Nothing here touches the DOM, so the send code on the server can use it too.
import { parser } from "@lezer/html";
import type { EmailCampaignLink } from "@/src/types/emailCampaignLink";

export const EMAIL_TOKENS = [
  {
    key: "first_name",
    label: "First Name",
    example: "Jane",
    isUrl: false,
  },
  {
    key: "campaign_url",
    label: "Campaign URL",
    example: "https://givebutter.com/jane-doe-garden",
    isUrl: true,
  },
] as const;

export type EmailTokenKey = (typeof EMAIL_TOKENS)[number]["key"];
export type EmailTokenValues = Partial<Record<EmailTokenKey, string>> & {
  campaign_links?: EmailCampaignLink[] | null;
};

export const EXAMPLE_TOKEN_VALUES: EmailTokenValues = Object.fromEntries(
  EMAIL_TOKENS.map(({ key, example }) => [key, example]),
);

const TOKEN_KEYS = EMAIL_TOKENS.map(({ key }) => key).join("|");

export function tokenText(key: EmailTokenKey) {
  return `{{${key}}}`;
}

export function getEmailToken(key: string) {
  return EMAIL_TOKENS.find((token) => token.key === key);
}

// Only known keys, so other {{...}} text is left alone
export function tokenPattern() {
  return new RegExp(`\\{\\{\\s*(${TOKEN_KEYS})\\s*\\}\\}`, "g");
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Splits HTML into tags (odd indexes) and the text between them (even indexes)
const TAG = /(<!--[\s\S]*?-->|<[^>]*>)/;

// Calls onText for each run of text, with whether it's already inside a link
export function mapHtmlText(
  html: string,
  onText: (text: string, insideLink: boolean) => string,
  onTag: (tag: string) => string = (tag) => tag,
) {
  let linkDepth = 0;

  return html
    .split(TAG)
    .map((part, index) => {
      if (index % 2 === 0) return onText(part, linkDepth > 0);

      if (/^<a[\s>]/i.test(part)) linkDepth++;
      else if (/^<\/a\s*>/i.test(part)) linkDepth = Math.max(0, linkDepth - 1);
      return onTag(part);
    })
    .join("");
}

interface FillOptions {
  // Wraps each filled-in value in the body text, e.g. to highlight it in the preview
  wrapValue?: (html: string) => string;
}

// Replaces tokens with one recipient's values. Values are HTML-escaped, and a URL
// token in body text becomes a link unless it's already inside one.
export function fillEmailTokens(
  html: string,
  values: EmailTokenValues,
  { wrapValue = (value) => value }: FillOptions = {},
) {
  const links = values.campaign_links;
  const render = (source: string, link?: EmailCampaignLink) => mapHtmlText(
    source,
    (text, insideLink) =>
      text.replace(tokenPattern(), (_, key: string) => {
        if (key === "campaign_url" && !link && links?.length) {
          return wrapValue(links.map(item => {
            const url = escapeHtml(item.url);
            return insideLink ? url : `<a href="${url}">${url}</a>`;
          }).join("<br>"));
        }
        const value = escapeHtml(key === "campaign_url" && link ? link.url : values[key as EmailTokenKey] ?? "");
        if (!value) return "";

        const isUrl = getEmailToken(key)?.isUrl;
        const content =
          isUrl && !insideLink ? `<a href="${value}">${value}</a>` : value;
        return wrapValue(content);
      }),
    // Tokens inside attributes, e.g. <a href="{{campaign_url}}">
    (tag) => tag.replace(tokenPattern(), (_, key: string) =>
      escapeHtml(key === "campaign_url" ? link?.url ?? links?.[0]?.url ?? values.campaign_url ?? "" : values.first_name ?? "")),
  );

  if (!links || links.length < 2) return render(html, links?.[0]);

  // Expand whole anchors, not href values: one href can only contain one URL.
  // Parse boundaries so quoted attributes containing '>' remain intact.
  const anchors: { from: number; to: number; close: number }[] = [];
  parser.parse(html).iterate({ enter({ node }) {
    if (node.name !== "Element") return;
    const tag = node.firstChild?.getChild("TagName");
    if (!tag || html.slice(tag.from, tag.to).toLowerCase() !== "a" || node.lastChild?.name !== "CloseTag") return;
    if ([...html.slice(node.from, node.to).matchAll(tokenPattern())].some(match => match[1] === "campaign_url")) {
      anchors.push({ from: node.from, to: node.to, close: node.lastChild.from });
      return false;
    }
  } });
  let result = "", cursor = 0;
  for (const anchor of anchors) {
    result += render(html.slice(cursor, anchor.from));
    result += links.map(link => {
      const label = ` (${escapeHtml(link.name || link.url)})`;
      return render(html.slice(anchor.from, anchor.close), link) + label + html.slice(anchor.close, anchor.to);
    }).join("<br>");
    cursor = anchor.to;
  }
  return result + render(html.slice(cursor));
}

// For plain text such as the subject line
export function fillTextTokens(text: string, values: EmailTokenValues) {
  return text.replace(
    tokenPattern(),
    (_, key: string) => key === "campaign_url" && values.campaign_links?.length
      ? values.campaign_links.map(link => link.url).join(", ")
      : values[key as EmailTokenKey] ?? "",
  );
}
