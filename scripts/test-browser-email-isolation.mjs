import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('browser test intercepts test sends before execution, not after fetching an action', () => {
  const source = readFileSync(new URL('./test-email-drafts-browser.mjs', import.meta.url), 'utf8');
  const intercept = source.indexOf("await context.route('**/dashboard/email-users'");
  assert.ok(intercept >= 0 && intercept < source.indexOf('await page.goto('));
  const stub = source.slice(intercept, source.indexOf('const errors = []', intercept));
  assert.ok(!stub.includes('route.fetch('), 'Fetching the test action can execute a real provider send');
  assert.match(stub, /requestId[\s\S]*?route\.fulfill/);
});
