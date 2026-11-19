import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Prepare a dashboard paste artifact, not a checked-in or deployed Edge Function.
export function updateAdminEmailFunction(original) {
  let source = original;
  const replaceOnce = (before, after) => {
    assert.equal(source.split(before).length, 2, `Expected one deployed-code marker: ${before.slice(0, 80)}`);
    source = source.replace(before, () => after);
  };
  replaceOnce('campaign_id: number | null; attempts:', 'campaign_links?: EmailCampaignLink[] | null; campaign_id: number | null; attempts:');
  replaceOnce('first_name, campaign_url, campaign_id, attempts, provider_request_id',
    'first_name, campaign_url, campaign_links, campaign_id, attempts, provider_request_id');
  replaceOnce('(needsUrl && (!row.campaign_id || !validCampaignUrl(row.campaign_url)))',
    '(needsUrl && !validCampaignSnapshot(row)) || new TextEncoder().encode(html).length > 500_000');

  const start = source.indexOf('function escapeHtml(value: string) {');
  const end = source.indexOf('function validCampaignUrl(value: string | null) {');
  assert.ok(start > 0 && end > start, 'Expected existing personalization helpers');
  assert.ok(source.slice(start, end).includes('function personalize(source: string, row: Recipient, html: boolean) {'));

  const tokens = readFileSync(new URL('../src/components/email/emailTokens.ts', import.meta.url), 'utf8')
    .replace('import { parser } from "@lezer/html";', 'import { parser } from "npm:@lezer/html@1.3.13";')
    .replace('import type { EmailCampaignLink } from "@/src/types/emailCampaignLink";',
      readFileSync(new URL('../src/types/emailCampaignLink.ts', import.meta.url), 'utf8').trim());
  const helpers = `
function validCampaignSnapshot(row: Recipient) {
  if (row.campaign_links == null) return Boolean(row.campaign_id && validCampaignUrl(row.campaign_url));
  return Array.isArray(row.campaign_links) && row.campaign_links.length > 0 && row.campaign_links.every(link =>
    link && Number.isSafeInteger(link.campaignId) && link.campaignId > 0 && typeof link.name === "string" &&
    typeof link.url === "string" && validCampaignUrl(link.url));
}
function personalize(source: string, row: Recipient, html: boolean) {
  const values: EmailTokenValues = { first_name: row.first_name ?? "", campaign_url: row.campaign_url ?? "",
    campaign_links: validCampaignSnapshot(row) ? row.campaign_links : null };
  return html ? fillEmailTokens(source, values) : fillTextTokens(source, values);
}
`;
  source = source.slice(0, start) + tokens + helpers + source.slice(end);
  return source;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [, , input, output] = process.argv;
  assert.ok(input && output, 'Usage: node scripts/prepare-admin-email-function.mjs <downloaded index.ts> <output.ts>');
  assert.notEqual(resolve(input), resolve(output), 'Keep the original download unchanged');
  const source = updateAdminEmailFunction(readFileSync(input, 'utf8'));
  writeFileSync(output, source, { flag: 'wx' });
  console.log(`Prepared ${output}. Nothing was deployed.`);
}
