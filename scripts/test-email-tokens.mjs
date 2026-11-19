import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const tokens = {};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/components/email/emailTokens.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: tokens, require });
const links = [
  { campaignId: 1, name: "Garden & Community", url: "https://givebutter.com/one?a=1&b=2" },
  { campaignId: 2, name: 'Garden "Two" <script>', url: "https://givebutter.com/two" },
];
const values = { first_name: "Sam", campaign_links: links };

test("legacy and single-campaign rendering stay unchanged", () => {
  const html = '<p>{{first_name}}: {{campaign_url}}</p><a href="{{campaign_url}}">Donate</a>';
  const legacy = { first_name: "Sam", campaign_url: links[0].url };
  assert.equal(tokens.fillEmailTokens(html, { ...legacy, campaign_links: [links[0]] }), tokens.fillEmailTokens(html, legacy));
  assert.equal(tokens.fillEmailTokens('<p>{{campaign_url}}</p>', {}), '<p></p>');
});

test("multiple URLs in body text become separate escaped links", () => {
  assert.equal(tokens.fillEmailTokens('<p>{{campaign_url}}</p>', values),
    '<p><a href="https://givebutter.com/one?a=1&amp;b=2">https://givebutter.com/one?a=1&amp;b=2</a><br><a href="https://givebutter.com/two">https://givebutter.com/two</a></p>');
  assert.equal(tokens.fillTextTokens('{{first_name}}: {{campaign_url}}', values), `Sam: ${links.map(link => link.url).join(', ')}`);
});

test("hyperlink placeholders expand whole anchors, preserving labels and formatting", () => {
  const html = '<p>Hi {{first_name}}. <a title="a &gt; b" href="{{ campaign_url }}"><strong>Donate</strong></a></p>';
  const result = tokens.fillEmailTokens(html, values);
  assert.equal((result.match(/<a /g) ?? []).length, 2);
  assert.match(result, /<strong>Donate<\/strong> \(Garden &amp; Community\)<\/a><br><a /);
  assert.ok(result.includes('Garden &quot;Two&quot; &lt;script&gt;'));
  assert.ok(!result.includes('{{'));
  assert.ok(!result.includes('<script>'));
  assert.ok(result.startsWith('<p>Hi Sam. '));
});

test("inserted values are never interpreted as template instructions", () => {
  const result = tokens.fillEmailTokens('<a href="{{campaign_url}}">{{first_name}}</a>', {
    first_name: '{{campaign_url}}', campaign_links: links.map(link => ({ ...link, name: '{{first_name}}' })),
  });
  assert.equal((result.match(/\{\{first_name\}\}/g) ?? []).length, 2);
  assert.equal((result.match(/\{\{campaign_url\}\}/g) ?? []).length, 2);
});

test("multiple token locations do not create nested anchors or miss later occurrences", () => {
  const result = tokens.fillEmailTokens('<p>{{campaign_url}} <a href=\'{{campaign_url}}\'>{{campaign_url}}</a> {{campaign_url}}</p>', values);
  assert.equal((result.match(/<a /g) ?? []).length, 6);
  assert.equal((result.match(/<\/a>/g) ?? []).length, 6);
  assert.ok(!result.includes('{{'));
  assert.ok(!/<a\b[^>]*>[^<]*<a\b/.test(result));
  const upper = tokens.fillEmailTokens('<A HREF="{{campaign_url}}">Donate</A>', values);
  assert.equal((upper.match(/<A /g) ?? []).length, 2);
  assert.ok(upper.includes('href="https://givebutter.com/two"'));
});

test("expanded anchors always point to their own campaign, replacing fixed or missing destinations", () => {
  for (const html of [
    '<a href="https://seedmoney.org">{{campaign_url}}</a>',
    '<a HREF=\'https://seedmoney.org\'>{{campaign_url}}</a>',
    '<a href=https://seedmoney.org>{{campaign_url}}</a>',
    '<a>{{campaign_url}}</a>',
    '<a title="Garden" target="_blank">{{campaign_url}}</a>',
  ]) {
    const result = tokens.fillEmailTokens(html, values);
    assert.equal((result.match(/href="https:\/\/givebutter.com\//g) ?? []).length, 2, html);
    assert.ok(!result.includes('https://seedmoney.org'), html);
    assert.ok(result.includes('href="https://givebutter.com/one?a=1&amp;b=2"'), html);
    assert.ok(result.includes('href="https://givebutter.com/two"'), html);
    assert.ok(!result.includes('{{'), html);
    if (html.includes('title=')) assert.equal((result.match(/title="Garden" target="_blank"/g) ?? []).length, 2);
  }
});
