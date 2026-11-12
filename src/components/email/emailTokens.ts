// Personalization tokens. In the email HTML a token is plain text like
// {{first_name}}, and it's filled in separately for each recipient at send time.
// Nothing here touches the DOM, so the send code on the server can use it too.

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
export type EmailTokenValues = Partial<Record<EmailTokenKey, string>>;

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
    .replace(/"/g, "&quot;");
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
  const valueFor = (key: string) =>
    escapeHtml(values[key as EmailTokenKey] ?? "");

  return mapHtmlText(
    html,
    (text, insideLink) =>
      text.replace(tokenPattern(), (_, key: string) => {
        const value = valueFor(key);
        if (!value) return "";

        const isUrl = getEmailToken(key)?.isUrl;
        const content =
          isUrl && !insideLink ? `<a href="${value}">${value}</a>` : value;
        return wrapValue(content);
      }),
    // Tokens inside attributes, e.g. <a href="{{campaign_url}}">
    (tag) => tag.replace(tokenPattern(), (_, key: string) => valueFor(key)),
  );
}

// For plain text such as the subject line
export function fillTextTokens(text: string, values: EmailTokenValues) {
  return text.replace(
    tokenPattern(),
    (_, key: string) => values[key as EmailTokenKey] ?? "",
  );
}
