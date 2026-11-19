import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.EMAIL_HISTORY_TEST_URL || 'http://localhost:3034';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname));
const config = JSON.parse(execFileSync('npx', ['supabase', 'status', '-o', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
assert.ok(['localhost', '127.0.0.1'].includes(new URL(config.API_URL).hostname));
const db = createClient(config.API_URL, config.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
let userId, browser;
const prefix = `History browser ${Date.now()}`;
try {
  const email = `history-${Date.now()}@example.org`, password = `History-${Date.now()}-test!`;
  const created = await db.auth.admin.createUser({ email, password, email_confirm: true });
  assert.equal(created.error, null); userId = created.data.user.id;
  assert.equal((await db.from('users').delete().eq('id', userId)).error, null);
  assert.equal((await db.from('users').insert({ id: userId, email, is_admin: true })).error, null);
  const seeded = await db.from('admin_emails').insert(Array.from({ length: 12 }, (_, i) => ({
    created_by: userId, subject: `${prefix} ${i}`, body_html: '<p>Hello {{first_name}} <script>alert(1)</script></p>',
    recipient_groups: i === 0 ? ['unfinished'] : ['approved'], status: i === 0 ? 'partially_failed' : 'sent',
    queued_at: `2098-11-${String(i + 1).padStart(2, '0')}T12:00:00Z`,
    completed_at: `2098-11-${String(i + 1).padStart(2, '0')}T12:01:00Z`,
  }))).select('id, subject');
  assert.equal(seeded.error, null);
  const partial = seeded.data.find(row => row.subject === `${prefix} 0`);
  assert.equal((await db.from('admin_email_recipients').insert(['accepted', 'unknown', 'failed'].map((status, i) => ({
    email_id: partial.id, recipient_email: `recipient-${i}@example.org`, status,
  })))).error, null);
  const cookies = [];
  const auth = createServerClient(config.API_URL, config.ANON_KEY, {
    cookies: { getAll: () => cookies, setAll: values => { cookies.push(...values); } },
  });
  assert.equal((await auth.auth.signInWithPassword({ email, password })).error, null);
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE ||
    (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined) });
  const context = await browser.newContext({ viewport: { width: 1365, height: 1000 } });
  await context.addCookies(cookies.map(({ name, value }) => ({ name, value, url: base, sameSite: 'Lax' })));
  await context.route('**/functions/v1/**', route => route.abort());
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/dashboard/email-users/sent-history`);
  await page.getByRole('button', { name: `${prefix} 11`, exact: true }).waitFor({ timeout: 90_000 });
  await page.getByLabel('Go to next page').click();
  await page.getByRole('button', { name: `${prefix} 0`, exact: true }).waitFor();
  await page.getByRole('combobox', { name: /Recipient groups/ }).click();
  await page.getByRole('option', { name: 'Unfinished applications', exact: true }).click();
  await page.getByRole('button', { name: `${prefix} 0`, exact: true }).waitFor();
  await page.getByRole('combobox', { name: /Date \(UTC\)/ }).click();
  await page.getByRole('option', { name: 'November 2098', exact: true }).click();
  await page.getByRole('button', { name: `${prefix} 0`, exact: true }).click();
  await page.getByText('Message preview (example values)', { exact: true }).waitFor();
  await page.getByText('Hello Jane', { exact: true }).waitFor();
  assert.equal(await page.locator('[role="presentation"] script').count(), 0);
  await page.screenshot({ path: path.join(tmpdir(), 'email-history-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.screenshot({ path: path.join(tmpdir(), 'email-history-mobile.png'), fullPage: true });
  assert.deepEqual(errors, []);
  console.log('PASS: local history pagination, filters, sanitized detail preview, and mobile layout.');
} finally {
  if (browser) await browser.close();
  if (userId) {
    const deleted = await db.from('admin_emails').delete().eq('created_by', userId);
    const account = await db.auth.admin.deleteUser(userId);
    if (deleted.error || account.error) { console.error('History test cleanup failed:', deleted.error || account.error); process.exitCode = 1; }
  }
}
