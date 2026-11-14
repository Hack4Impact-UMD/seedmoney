import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";
const require = createRequire(import.meta.url);
function load(file, imports = {}) {
  const exports = {};
  const { outputText } = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  vm.runInNewContext(outputText, { exports, console, TextEncoder, URL,
    require: name => name === "server-only" ? {} : imports[name] ?? require(name) });
  return exports;
}
const types = load("../src/types/db/adminEmails.ts");
const tokens = load("../src/components/email/emailTokens.ts");
const fields = load("../src/lib/emailDraftValidation.ts", { "@/src/types/db/adminEmails": types });
const validation = load("../src/lib/emailSendValidation.ts", {
  "@/src/components/email/emailTokens": tokens, "@/src/lib/emailDraftValidation": fields,
});
const input = (values = {}) => ({ subject: "Hello {{first_name}}", bodyHtml: "<p>Garden news</p>",
  recipientGroups: ["approved"], competitionId: 1, mode: "send", ...values });
const errors = bodyHtml => validation.emailContentErrors(input({ bodyHtml }));

test("balanced editor HTML, tables, styles, images, and supported placeholders are accepted", () => {
  for (const html of ['<p style="text-align: center;">Hello {{first_name}}</p>',
    '<table cellpadding="0"><tr><td style="color: #123456; padding: 10px;">Garden</td></tr></table>',
    '<p><a href="{{campaign_url}}">Give to the garden</a> {{ campaign_url }}</p>',
    "<a href='{{campaign_url}}'>Give</a>", '<p><strong>News</strong><br><em>Thank you</em></p>',
    '<img src="https://example.org/garden.png" alt="Garden">', '<img src="http://127.0.0.1/garden.png" />',
    '<p><a href="mailto:hello@example.org">Email</a></p>', '<p title="a &gt; b">Hi&nbsp;there</p>']) {
    assert.equal(errors(html).length, 0, `${html}: ${errors(html).join("; ")}`);
  }
});

test("incomplete, mismatched, and ambiguous HTML is rejected without changing the draft", () => {
  for (const html of ['<div>Unclosed', '<p><strong>Bad</p>', '<p title="broken>Hi</p>', '<div/>',
    '<a href="https://example.org" HREF="javascript:alert(1)">Duplicate</a>', '<!-- comment --><p>Hi</p>',
    '<!doctype html><p>Hi</p>', '<table><p>Invalid child</p></table>',
    '<tr><td>Missing table</td></tr>', '<ul><div>Invalid list child</div></ul>',
    '<a href="https://example.org"><a href="https://example.org">Nested link</a></a>']) assert.ok(errors(html).length > 0, html);
  const draft = input({ bodyHtml: '<p>unfinished' });
  assert.equal(fields.emailDraftValuesError(draft), null);
  assert.ok(validation.emailContentErrors(draft).length > 0);
  assert.equal(draft.bodyHtml, '<p>unfinished');
});

test("unsafe tags, attributes, protocols, and CSS fail closed", () => {
  for (const html of ['<script>alert(1)</script>', '<iframe src="https://example.org"></iframe>',
    '<svg><a href="javascript:x">bad</a></svg>', '<form><input></form>', '<style>p{color:red}</style><p>x</p>',
    '<p onclick="alert(1)">Hi</p>', '<img src="https://example.org/x" onerror="x()">',
    '<a href="jav&#x61;script:alert(1)">Hi</a>', '<a href="data:text/html,bad">Hi</a>',
    '<a href="/relative">Hi</a>', '<img src="//example.org/x">', '<img src="data:image/png;base64,a">',
    '<img alt="No source">', '<p style="background-image: url(https://example.org/x)">Hi</p>',
    '<p style="width: expression(alert(1))">Hi</p>']) assert.ok(errors(html).length > 0, html);
});

test("unknown or broken placeholders and unsafe attribute locations are blocked", () => {
  for (const body of ['<p>{{unknown}}</p>', '<p>{{first_name</p>', '<p>{{{first_name}}}</p>',
    '<p title="{{first_name}}">Hi</p>', '<a href={{campaign_url}}>Hi</a>',
    '<a href="https://example.org/{{campaign_url}}">Hi</a>', '<img src="{{campaign_url}}">']) assert.ok(errors(body).length > 0, body);
  assert.ok(validation.emailContentErrors(input({ subject: '{{unknown}}' })).length > 0);
  assert.ok(validation.emailContentErrors(input({ subject: 'Hello\r\nBcc: bad@example.org' })).length > 0);
  for (const html of ['', '<p><br></p>', '<p>&nbsp;&#8203;</p>']) assert.ok(errors(html).length > 0);
});

test("campaign URLs must be unambiguous HTTPS Givebutter links", () => {
  assert.equal(validation.validCampaignUrl('https://givebutter.com/garden-2026'), true);
  for (const value of [null, '', 'https://givebutter.com/', 'javascript:bad', 'https://givebutter.com.evil.org/garden',
    'https://user:pass@givebutter.com/garden', 'http://givebutter.com/garden']) assert.equal(validation.validCampaignUrl(value), false);
});

function preparationFixture() {
  const state = { authorized: true, reads: 0, competitionId: 1,
    recipients: [{ userId: "1", email: "member@example.org", firstName: "Garden", campaignId: 1, campaignUrl: "https://givebutter.com/garden" }] };
  const preparation = load("../src/lib/prepareAdminEmail.ts", {
    "@/src/lib/requireAdmin": { requireAdmin: async () => { if (!state.authorized) throw new Error("Not authorized"); } },
    "@/src/lib/readEmailAudience": { readCurrentEmailAudience: async () => {
      state.reads++; return { competitionId: state.competitionId, total: state.recipients.length, recipients: state.recipients };
    } },
    "@/src/lib/emailSendValidation": validation, "@/src/components/email/emailTokens": tokens,
  });
  const action = load("../src/actions/email/validate.ts", { "@/src/lib/prepareAdminEmail": preparation });
  return { state, preparation, action };
}

test("both send modes use fresh recipients and the same content and campaign-URL rules", async () => {
  const { state, preparation } = preparationFixture();
  for (const mode of ["test", "send"]) {
    const message = input({ mode, testEmail: " test@example.org ", bodyHtml: '<p>{{campaign_url}}</p>' });
    assert.equal((await preparation.prepareAdminEmail(message)).success, true);
    assert.equal((await preparation.prepareAdminEmail({ ...message, recipientGroups: ["all"] })).success, false);
    state.recipients[0].campaignUrl = null;
    assert.equal((await preparation.prepareAdminEmail(message)).success, false);
    state.recipients[0].campaignUrl = 'https://givebutter.com/garden';
    assert.equal((await preparation.prepareAdminEmail({ ...message, bodyHtml: '<script>x</script>' })).success, false);
  }
  assert.ok(state.reads >= 6);
});

test("stale competitions, empty audiences, bad test addresses, and personalized subjects are rejected", async () => {
  const { state, preparation } = preparationFixture();
  assert.equal((await preparation.prepareAdminEmail(input({ competitionId: 2 }))).success, false);
  assert.equal((await preparation.prepareAdminEmail(input({ mode: "test", testEmail: "bad" }))).success, false);
  state.recipients[0].firstName = "Bad\nBcc: attacker@example.org";
  assert.equal((await preparation.prepareAdminEmail(input())).success, false);
  state.recipients[0].firstName = "";
  assert.equal((await preparation.prepareAdminEmail(input({ subject: "{{first_name}}" }))).success, false);
  state.recipients = [];
  assert.equal((await preparation.prepareAdminEmail(input())).success, false);
});

test("authorization precedes recipient reads and validation responses expose no recipient PII", async () => {
  const { state, action } = preparationFixture();
  const valid = await action.validateEmailForSend(input());
  assert.equal(valid.success, true);
  assert.equal(valid.recipientCount, 1);
  assert.ok(!JSON.stringify(valid).includes('member@example.org'));
  state.authorized = false;
  state.reads = 0;
  assert.equal((await action.validateEmailForSend(input())).success, false);
  assert.equal(state.reads, 0);
});

test("personalization escapes apostrophes, quotes, and markup", () => {
  const html = tokens.fillEmailTokens('<p>{{first_name}}</p>', { first_name: `O'Neil "<script>"` });
  assert.equal(html, '<p>O&#39;Neil &quot;&lt;script&gt;&quot;</p>');
});
