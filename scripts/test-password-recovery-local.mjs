import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const api = process.env.NEXT_PUBLIC_SUPABASE_URL;
const base = process.env.TEST_BASE_URL || 'http://localhost:3004';
for (const url of [api, base]) {
  assert.ok(['localhost', '127.0.0.1'].includes(new URL(url).hostname), 'LOCAL testing only');
}
const status = JSON.parse(execFileSync('npx', ['supabase', 'status', '-o', 'json'], {
  encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000,
}));
assert.equal(new URL(status.API_URL).origin, new URL(api).origin);
const { createClient } = require('@supabase/supabase-js');
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(api, status.SERVICE_ROLE_KEY, options);
const anon = () => createClient(api, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
let userId;
let browser;
try {
  const email = `recovery-audit-${randomUUID()}@example.invalid`;
  const oldPassword = `Old-${randomUUID()}!`;
  const password = `New-${randomUUID()}!`;
  const created = await admin.auth.admin.createUser({ email, password: oldPassword, email_confirm: true });
  if (created.error) throw created.error;
  userId = created.data.user.id;
  const link = await admin.auth.admin.generateLink({ type: 'recovery', email });
  if (link.error) throw link.error;
  const token = link.data.properties.hashed_token;
  browser = await chromium.launch({ headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const page = await browser.newPage();
  await page.route('**/*', route => {
    const origin = new URL(route.request().url()).origin;
    return [new URL(base).origin, new URL(api).origin].includes(origin) ? route.continue() : route.abort();
  });
  const recoveryUrl = `${base}/reset-password?token_hash=${encodeURIComponent(token)}&type=recovery`;
  await page.goto(recoveryUrl);
  await page.getByRole('dialog').waitFor();
  await page.getByLabel('Type new password', { exact: true }).fill(password);
  await page.getByLabel('Confirm new password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'NEXT', exact: true }).click();
  await page.getByText('Your password has been successfully changed!').waitFor();
  await page.getByRole('button', { name: 'LOG IN', exact: true }).click();
  await page.waitForURL(`${base}/`);
  assert.ok((await anon().auth.signInWithPassword({ email, password: oldPassword })).error);
  const loggedIn = await anon().auth.signInWithPassword({ email, password });
  if (loggedIn.error) throw loggedIn.error;
  assert.equal(loggedIn.data.user.id, userId);
  await page.goto(recoveryUrl);
  await page.getByRole('main').getByRole('alert').waitFor();
  assert.equal(await page.getByRole('dialog').count(), 0);
  console.log('pass: real local recovery, password update, logout, old/new credentials, reused-link rejection');
} finally {
  try { if (browser) await browser.close(); }
  finally {
    if (userId) {
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) throw error;
      console.log('Removed temporary local test account');
    }
  }
}
