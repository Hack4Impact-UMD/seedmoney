import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import { parser } from "@lezer/html";
import ts from "typescript";
import { updateAdminEmailFunction } from './prepare-admin-email-function.mjs';

test('deployment preparation refuses unfamiliar function code instead of guessing', () => {
  assert.throws(() => updateAdminEmailFunction('unrelated function'), /Expected one deployed-code marker/);
});

// Exercise a read-only download without executing database or provider requests.
const edgeFile = process.env.ADMIN_EMAIL_EDGE_SOURCE;
test('updated dashboard function preserves transport and renders frozen links', { skip: !edgeFile }, () => {
  const original = readFileSync(edgeFile, 'utf8');
  const updated = updateAdminEmailFunction(original);
  assert.equal(updated.slice(updated.indexOf('async function authorized('), updated.indexOf('const pending =')),
    original.slice(original.indexOf('async function authorized('), original.indexOf('const pending =')));
  assert.equal(updated.slice(updated.lastIndexOf('let response: Response;')),
    original.slice(original.lastIndexOf('let response: Response;')), 'Provider calls, outcomes, and retry behavior must not change');
  const exported = {};
  vm.runInNewContext(ts.transpileModule(updated + '\nexport { personalize, validCampaignSnapshot };', {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports: exported, URL, TextEncoder, Deno: { serve() {} },
    require(name) {
      if (name === 'npm:@lezer/html@1.3.13') return { parser };
      if (name.startsWith('npm:@supabase/supabase-js@')) return { createClient() { throw Error('No database calls allowed'); } };
      throw Error(`Unexpected dependency: ${name}`);
    },
  });
  const legacy = { first_name: 'Sam', campaign_id: 1, campaign_url: 'https://givebutter.com/one' };
  assert.equal(exported.validCampaignSnapshot(legacy), true);
  assert.equal(exported.personalize('<p>{{campaign_url}}</p>', legacy, true),
    '<p><a href="https://givebutter.com/one">https://givebutter.com/one</a></p>');
  const multi = { ...legacy, campaign_id: null, campaign_url: null, campaign_links: [
    { campaignId: 1, name: 'One', url: 'https://givebutter.com/one' },
    { campaignId: 2, name: 'Two', url: 'https://givebutter.com/two' },
  ] };
  assert.equal(exported.validCampaignSnapshot(multi), true);
  assert.equal(exported.personalize('<a href="{{campaign_url}}">View</a>', multi, true),
    '<a href="https://givebutter.com/one">View (One)</a><br><a href="https://givebutter.com/two">View (Two)</a>');
  assert.equal(exported.personalize('{{campaign_url}}', multi, false),
    'https://givebutter.com/one, https://givebutter.com/two');
  for (const template of ['<a href="https://seedmoney.org">{{campaign_url}}</a>', '<a>{{campaign_url}}</a>']) {
    assert.equal(exported.personalize(template, multi, true),
      '<a href="https://givebutter.com/one">https://givebutter.com/one (One)</a><br><a href="https://givebutter.com/two">https://givebutter.com/two (Two)</a>');
  }
  for (const value of [[], {}, [null], [{ campaignId: 1, name: 'Bad', url: 'javascript:bad' }]]) {
    const invalid = { ...multi, campaign_links: value };
    assert.equal(exported.validCampaignSnapshot(invalid), false);
    assert.doesNotThrow(() => exported.personalize('<p>{{campaign_url}}</p>', invalid, true));
  }
  assert.ok(updated.includes('campaign_url, campaign_links, campaign_id'));
  assert.ok(updated.includes('new TextEncoder().encode(html).length > 500_000'));
});
