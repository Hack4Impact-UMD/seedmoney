import assert from 'node:assert/strict';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const req = createRequire(path.join(process.cwd(), 'package.json'));
const { createClient } = req('@supabase/supabase-js');
const { createServerClient } = req('@supabase/ssr');
const { chromium } = req(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config = JSON.parse(execFileSync('npx', ['supabase', 'status', '-o', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(config.API_URL).hostname));
const service = createClient(config.API_URL, config.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const token = Date.now();
const email = `email-draft-test-${token}@example.com`;
const password = `Draft-test-${token}!`;
const base = 'http://localhost:3001';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, message) {
  for (let i = 0; i < 100; i++) { if (await check()) return; await pause(100); }
  throw new Error(message);
}
(async () => {
  let userId, browser, uploadedPath;
  const audienceUsers = [], audienceCampaigns = [];
  let pastCompetitionId;
  try {
    const created = await service.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { first_name: 'Draft', last_name: 'Tester' } });
    assert.equal(created.error, null);
    userId = created.data.user.id;
    assert.equal((await service.from('users').delete().eq('id', userId)).error, null);
    const seeded = await service.from('users').insert({ id: userId, email, first_name: 'Draft', last_name: 'Tester', is_admin: true });
    assert.equal(seeded.error, null);
    const cookies = [];
    const session = createServerClient(config.API_URL, config.ANON_KEY, {
      cookies: { getAll: () => cookies, setAll: values => { for (const value of values) { const i = cookies.findIndex(cookie => cookie.name === value.name); if (i >= 0) cookies.splice(i, 1); cookies.push(value); } } },
    });
    assert.equal((await session.auth.signInWithPassword({ email, password })).error, null);
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined) });
    const context = await browser.newContext({ viewport: { width: 1365, height: 1000 } });
    await context.addCookies(cookies.map(({ name, value }) => ({ name, value, url: base, sameSite: 'Lax' })));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/dashboard/email-users`);
    await page.getByText('No draft saved', { exact: true }).waitFor();
    assert.equal((await service.from('admin_emails').select('id').eq('created_by', userId)).data.length, 0);
    const subject = page.getByRole('textbox', { name: 'Subject', exact: true });
    await subject.fill('Autosave browser test');
    await page.getByRole('tab', { name: 'HTML', exact: true }).click();
    const code = page.locator('.cm-content');
    await code.fill('<table><tr><td>Hello {{first_name}}</td></tr></table>');
    await page.getByRole('combobox', { name: 'Recipient groups' }).click();
    await page.getByRole('option', { name: /^All Users \(/ }).click();
    await page.keyboard.press('Escape');
    await until(async () => (await service.from('admin_emails').select('*').eq('created_by', userId)).data?.[0]?.body_html === '<table><tr><td>Hello {{first_name}}</td></tr></table>', 'Body did not autosave');
    let rows = (await service.from('admin_emails').select('*').eq('created_by', userId)).data;
    assert.equal(rows.length, 1);
    const draftId = rows[0].id;
    assert.deepEqual(rows[0].recipient_groups, ['all']);
    await page.reload();
    await subject.waitFor();
    await until(async () => (await subject.inputValue()) === 'Autosave browser test', 'Subject did not restore');
    assert.equal(await page.getByRole('tab', { name: 'HTML', exact: true }).getAttribute('aria-selected'), 'true');
    assert.match(await code.innerText(), /Hello/);
    assert.match(await code.innerText(), /<table>/);
    console.log('PASS: lazy creation, persisted subject/body/groups, and reload restoration.');

    let delayed = false;
    await page.route('**/dashboard/email-users', async route => {
      if (route.request().method() === 'POST' && !delayed) { delayed = true; await pause(1600); }
      await route.continue();
    });
    await subject.fill('Slow save');
    await page.getByText('Saving...', { exact: true }).waitFor();
    await subject.fill('Latest edit wins');
    await until(async () => (await service.from('admin_emails').select('subject').eq('id', draftId).single()).data?.subject === 'Latest edit wins', 'Latest edit was lost during an in-flight save');
    await page.unroute('**/dashboard/email-users');
    assert.equal((await service.from('admin_emails').select('id').eq('created_by', userId)).data.length, 1);
    console.log('PASS: edits during an in-flight save are serialized without duplicate drafts.');

    const second = await context.newPage();
    await second.goto(`${base}/dashboard/email-users`);
    const secondSubject = second.getByRole('textbox', { name: 'Subject', exact: true });
    await until(async () => (await secondSubject.inputValue()) === 'Latest edit wins', 'Second tab did not restore');
    await subject.fill('First tab version');
    await until(async () => (await service.from('admin_emails').select('subject').eq('id', draftId).single()).data?.subject === 'First tab version', 'First tab save failed');
    await secondSubject.fill('Stale tab text');
    await second.getByRole('alert').filter({ hasText: 'another session' }).waitFor();
    assert.equal(await secondSubject.inputValue(), 'Stale tab text');
    assert.equal((await service.from('admin_emails').select('subject').eq('id', draftId).single()).data.subject, 'First tab version');
    console.log('PASS: stale tab cannot overwrite newer server content, and its local text is preserved.');
    await second.close();

    await page.route('**/dashboard/email-users', async route => {
      if (route.request().method() === 'POST') await route.abort('failed');
      else await route.continue();
    });
    await subject.fill('Retry this save');
    await page.getByRole('alert').filter({ hasText: 'Unable to save' }).waitFor();
    assert.equal(await subject.inputValue(), 'Retry this save');
    await page.unroute('**/dashboard/email-users');
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await until(async () => (await service.from('admin_emails').select('subject').eq('id', draftId).single()).data?.subject === 'Retry this save', 'Retry did not save the retained content');
    console.log('PASS: failed saves are visible and explicit retry preserves the content.');

    await page.screenshot({ path: '/private/tmp/email-draft-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: '/private/tmp/email-draft-mobile.png', fullPage: true });
    await page.route('**/dashboard/email-users', async route => {
      if (route.request().method() === 'POST') await route.abort('failed');
      else await route.continue();
    });
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Discard draft', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Unable to discard' }).waitFor();
    assert.equal(await subject.inputValue(), 'Retry this save');
    assert.equal((await service.from('admin_emails').select('id').eq('created_by', userId)).data.length, 1);
    await page.unroute('**/dashboard/email-users');
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await page.getByText('No draft saved', { exact: true }).waitFor();
    assert.equal(await subject.inputValue(), '');
    assert.equal((await service.from('admin_emails').select('id').eq('created_by', userId)).data.length, 0);
    await page.reload();
    await page.getByText('No draft saved', { exact: true }).waitFor();
    assert.equal(await subject.inputValue(), '');
    let lostResponse = false;
    await page.route('**/dashboard/email-users', async route => {
      if (route.request().method() === 'POST' && !lostResponse) {
        lostResponse = true;
        await route.fetch();
        await route.abort('failed');
      } else await route.continue();
    });
    await subject.fill('Committed but response lost');
    await page.getByRole('alert').filter({ hasText: 'Unable to save' }).waitFor();
    assert.equal((await service.from('admin_emails').select('id').eq('created_by', userId)).data.length, 1);
    await subject.fill('Newer edits after lost response');
    await page.unroute('**/dashboard/email-users');
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await until(async () => (await service.from('admin_emails').select('subject').eq('created_by', userId)).data?.[0]?.subject === 'Newer edits after lost response', 'Response-lost creation did not recover before newer edits');
    assert.equal((await service.from('admin_emails').select('id').eq('created_by', userId)).data.length, 1);
    console.log('PASS: a committed creation with a lost response is recovered before newer edits without duplicate rows.');
    await subject.fill('x'.repeat(1001));
    await page.getByRole('alert').filter({ hasText: 'oversized' }).waitFor();
    await subject.fill('Corrected validation');
    await until(async () => (await service.from('admin_emails').select('subject').eq('created_by', userId)).data?.[0]?.subject === 'Corrected validation', 'Corrected fields did not resume autosave');
    console.log('PASS: correcting an oversized field clears validation and resumes autosave.');
    await page.locator('input[type="file"]').setInputFiles({
      name: `draft-${token}.png`, mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/ZAAAAABJRU5ErkJggg==', 'base64'),
    });
    await until(async () => (await service.from('admin_emails').select('body_html').eq('created_by', userId)).data?.[0]?.body_html.includes('<img'), 'Uploaded image did not persist');
    const latest = (await service.from('admin_emails').select('*').eq('created_by', userId).single()).data;
    uploadedPath = latest.body_html.match(/email_images\/([^"<>]+)/)?.[1];
    assert.ok(uploadedPath);
    await subject.fill('Saved before navigation');
    await page.getByRole('link', { name: 'Sent history', exact: true }).click();
    await page.waitForURL('**/email-users/sent-history');
    assert.equal((await service.from('admin_emails').select('subject').eq('id', latest.id).single()).data.subject, 'Saved before navigation');
    await page.goto(`${base}/dashboard/email-users`);
    await until(async () => (await subject.inputValue()) === 'Saved before navigation', 'Draft did not restore after sent-history navigation');
    console.log('PASS: images persist and sent-history navigation waits for the latest edits.');
    assert.equal((await service.from('admin_emails').update({ status: 'queued' }).eq('id', latest.id)).error, null);
    await subject.fill('Must not change queued content');
    await page.getByRole('alert').filter({ hasText: 'no longer editable' }).waitFor();
    assert.equal((await service.from('admin_emails').select('subject').eq('id', latest.id).single()).data.subject, 'Saved before navigation');
    console.log('PASS: an already-queued message cannot be edited by the stale compose form.');
    assert.equal((await service.from('admin_emails').delete().eq('id', latest.id)).error, null);
    assert.deepEqual(errors, []);
    console.log('PASS: discard removes only the draft and reload does not recreate it. No browser errors.');

    await page.reload();
    await page.getByText('No draft saved', { exact: true }).waitFor();
    const labels = ['All Users', "Haven't started an application", 'Unfinished applications', 'Approved Campaigns'];
    const option = label => page.getByRole('option').filter({ hasText: label });
    const readCounts = async () => {
      await page.getByRole('combobox', { name: 'Recipient groups' }).click();
      await until(async () => /\([\d,]+\)/.test(await option(labels[0]).innerText()), 'Audience counts did not load');
      const counts = [];
      for (const label of labels) counts.push(Number((await option(label).innerText()).match(/\(([\d,]+)\)/)[1].replaceAll(',', '')));
      return counts;
    };
    const baseline = await readCounts();
    await option(labels[2]).click();
    await option(labels[3]).click();
    await page.keyboard.press('Escape');
    const selectedCount = async () => Number((await page.getByTestId('email-recipient-count').innerText()).match(/^([\d,]+)/)?.[1].replaceAll(',', ''));
    await until(async () => Number.isFinite(await selectedCount()), 'Baseline selected count did not load');
    const baselineSelected = await selectedCount();
    await until(async () => (await service.from('admin_emails').select('recipient_groups').eq('created_by', userId).eq('status', 'draft').maybeSingle()).data?.recipient_groups.length === 2,
      'Recipient selection did not autosave before reload');
    const competition = await service.from('competition_metadata').select('competition_id').eq('is_current', true).single();
    assert.equal(competition.error, null);
    const past = await service.from('competition_metadata').insert({ competition_id: token, start_date: '2000-01-01', end_date: '2000-12-15', is_current: false }).select('competition_id').single();
    assert.equal(past.error, null);
    pastCompetitionId = past.data.competition_id;
    for (let i = 0; i < 5; i++) {
      const account = await service.auth.admin.createUser({ email: `audience-${token}-${i}@example.com`, password, email_confirm: true,
        user_metadata: { first_name: 'Audience', last_name: 'Tester' } });
      assert.equal(account.error, null);
      audienceUsers.push(account.data.user.id);
    }
    const addCampaign = async (ownerIndex, status, competitionId = competition.data.competition_id) => {
      const created = await service.from('campaigns').insert({ campaign_id: token + audienceCampaigns.length, name: `Audience test ${token}`, status, competition_id: competitionId,
        contact_email: 'not-the-account-email@example.com' }).select('campaign_id').single();
      assert.equal(created.error, null);
      audienceCampaigns.push(created.data.campaign_id);
      assert.equal((await service.from('campaign_members').insert({ campaign_id: created.data.campaign_id,
        user_id: audienceUsers[ownerIndex], role: 'campaign_leader' })).error, null);
      return created.data.campaign_id;
    };
    const approvedId = await addCampaign(0, 'approved');
    await addCampaign(0, 'in_progress');
    const draftIdForAudience = await addCampaign(1, 'in_progress');
    await addCampaign(2, 'approved', pastCompetitionId);
    await addCampaign(4, 'published');
    assert.equal((await service.from('campaign_members').insert({ campaign_id: approvedId, user_id: audienceUsers[3], role: 'campaign_member' })).error, null);
    await page.reload();
    const counts = await readCounts();
    assert.deepEqual(counts, baseline.map((count, i) => count + [5, 2, 2, 2][i]));
    await page.keyboard.press('Escape');
    await until(async () => (await selectedCount()) === baselineSelected + 3, 'Overlapping recipient groups were not deduplicated');
    assert.equal((await service.from('campaigns').update({ status: 'pending' }).eq('campaign_id', draftIdForAudience)).error, null);
    await page.reload();
    await until(async () => (await selectedCount()) === baselineSelected + 2, 'Changed application status did not refresh the audience');
    await page.getByRole('combobox', { name: 'Recipient groups' }).click();
    await option(labels[0]).click();
    await page.keyboard.press('Escape');
    await until(async () => (await selectedCount()) === baseline[0] + 5, 'All Users was double counted with other groups');
    await subject.fill('Audience confirmation');
    await code.fill('<p>Unclosed message');
    await page.getByRole('button', { name: 'Send Email', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Close every non-void' }).waitFor();
    assert.equal(await page.getByRole('heading', { name: 'Send this email?', exact: true }).count(), 0);
    assert.equal((await service.from('admin_emails').select('body_html').eq('created_by', userId).eq('status', 'draft').single()).data.body_html, '<p>Unclosed message');
    await code.fill('<p>{{unknown}}</p>');
    await page.getByRole('button', { name: 'Send Email', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Use only complete' }).waitFor();
    await code.fill('<p onclick="alert(1)">Unsafe message</p>');
    await page.getByRole('button', { name: 'Test send', exact: true }).click();
    await page.getByRole('textbox', { name: 'Email address', exact: true }).fill('test@example.org');
    await page.getByRole('button', { name: 'Send Test Email', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'unsafe or unsupported' }).waitFor();
    assert.equal(await page.getByText(/Test email accepted by the email provider/).count(), 0);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await code.fill('<p>{{campaign_url}}</p>');
    await page.getByRole('button', { name: 'Send Email', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Every recipient must have exactly one' }).waitFor();
    await code.fill('<p>Hello {{first_name}}</p>');
    await until(async () => await page.getByRole('button', { name: 'Send Email', exact: true }).isEnabled(), 'Valid audience did not enable confirmation');
    await page.getByRole('button', { name: 'Send Email', exact: true }).click();
    await page.getByText(`${(baseline[0] + 5).toLocaleString()} unique recipients`, { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    const testRequests = [];
    // Mock only the test action's result. Its real validation still runs against
    // local Supabase; no provider is contacted or bulk snapshot is created.
    await page.route('**/dashboard/email-users', async route => {
      let args;
      try { args = JSON.parse(route.request().postData() || 'null'); } catch { /* Not a server action. */ }
      if (route.request().method() !== 'POST' || !args?.[0]?.requestId) { await route.continue(); return; }
      testRequests.push(args[0]);
      const response = await route.fetch();
      const lines = (await response.text()).split('\n');
      let replaced = false;
      const body = lines.map(line => {
        const colon = line.indexOf(':');
        let value;
        try { value = JSON.parse(line.slice(colon + 1)); } catch { return line; }
        if (typeof value?.success !== 'boolean' || (!value.errors && !value.testEmail)) return line;
        replaced = true;
        const result = testRequests.length === 1
          ? { success: false, uncertain: true, errors: ['Test acceptance is uncertain. Check your inbox or provider logs before trying again.'] }
          : { success: true, testEmail: 'test@example.org' };
        return line.slice(0, colon + 1) + JSON.stringify(result);
      }).join('\n');
      assert.equal(replaced, true);
      await route.fulfill({ response, body });
    });
    await page.getByRole('button', { name: 'Test send', exact: true }).click();
    await page.getByRole('button', { name: 'Send Test Email', exact: true }).evaluate(button => { button.click(); button.click(); });
    await page.getByRole('alert').filter({ hasText: 'Test acceptance is uncertain' }).waitFor();
    assert.equal(testRequests.length, 1, 'Duplicate clicks must not start duplicate tests');
    assert.equal(await page.getByText(/Test email accepted by the email provider/).count(), 0);
    await page.getByRole('button', { name: 'Send Test Email', exact: true }).click();
    await page.getByText('Test email accepted by the email provider for test@example.org. Check your inbox.', { exact: true }).waitFor();
    assert.equal(testRequests.length, 2);
    assert.equal(testRequests[0].requestId, testRequests[1].requestId, 'Uncertain retries must reuse their request ID');
    assert.equal(testRequests[1].testEmail, 'test@example.org');
    const unchanged = (await service.from('admin_emails').select('id, status, body_html').eq('created_by', userId)).data;
    assert.equal(unchanged.length, 1);
    assert.equal(unchanged[0].status, 'draft');
    assert.equal(unchanged[0].body_html, '<p>Hello {{first_name}}</p>');
    assert.equal((await service.from('admin_email_recipients').select('id').eq('email_id', unchanged[0].id)).data.length, 0);
    await page.screenshot({ path: '/private/tmp/email-test-send-mobile.png' });
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.unroute('**/dashboard/email-users');
    console.log('PASS: test-send uncertainty, same-request retry, duplicate-click protection, and provider-acceptance feedback without queueing the bulk audience.');
    console.log('PASS: send and test-send validation block malformed/unsafe HTML and invalid personalization without changing the saved draft.');
    await page.route('**/dashboard/email-users', async route => {
      let args;
      try { args = JSON.parse(route.request().postData() || 'null'); } catch { /* Not a JSON server action. */ }
      if (route.request().method() === 'POST' && Array.isArray(args) && args.length === 1 && Array.isArray(args[0])) {
        await route.abort('failed');
      } else await route.continue();
    });
    await page.getByRole('combobox', { name: 'Recipient groups' }).click();
    await option(labels[1]).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Retry recipients', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Send Email', exact: true }).isDisabled(), true);
    assert.equal(await page.getByTestId('email-recipient-count').innerText(), 'Recipient count unavailable');
    await page.unroute('**/dashboard/email-users');
    await page.getByRole('button', { name: 'Retry recipients', exact: true }).click();
    await until(async () => (await selectedCount()) === baseline[0] + 5, 'Recipient counts did not recover after retry');
    console.log('PASS: recipient-query failures are visible, block confirmation, and recover through retry.');
    await until(async () => {
      const saved = (await service.from('admin_emails').select('subject, recipient_groups').eq('created_by', userId).eq('status', 'draft').single()).data;
      return saved?.subject === 'Audience confirmation' && saved.recipient_groups.length === 4;
    }, 'Audience draft did not save');
    assert.equal((await service.from('admin_emails').update({ competition_id: pastCompetitionId }).eq('created_by', userId).eq('status', 'draft')).error, null);
    await page.reload();
    await page.getByRole('alert').filter({ hasText: 'different or removed competition' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Send Email', exact: true }).isDisabled(), true);
    await page.setViewportSize({ width: 1365, height: 1000 });
    await page.screenshot({ path: '/private/tmp/email-audience-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.getByRole('heading', { name: 'Email Users', exact: true }).count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await page.screenshot({ path: '/private/tmp/email-audience-mobile.png' });
    assert.deepEqual(errors, []);
    console.log('PASS: real group counts, current leader membership, status changes, deduplication, confirmation totals, and old-draft guards.');

    assert.equal((await service.from('admin_emails').update({ competition_id: competition.data.competition_id }).eq('created_by', userId).eq('status', 'draft')).error, null);
    let calls = 0, queuedId, snapshotSize;
    await page.route('**/functions/v1/send-admin-email', async route => {
      const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, apikey, x-client-info, content-type' };
      if (route.request().method() === 'OPTIONS') { await route.fulfill({ status: 200, headers }); return; }
      calls++;
      const { email_id: id } = route.request().postDataJSON();
      if (queuedId) assert.equal(id, queuedId);
      queuedId = id;
      const snapshot = await service.from('admin_email_recipients').select('*').eq('email_id', id);
      assert.equal(snapshot.error, null);
      snapshotSize ??= snapshot.data.length;
      assert.equal(snapshot.data.length, snapshotSize);
      assert.ok(snapshotSize > 1);
      if (calls === 2) { await route.abort('failed'); return; }
      const done = calls > 2;
      const update = service.from('admin_email_recipients').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('email_id', id);
      assert.equal((await (done ? update : update.eq('id', snapshot.data[0].id))).error, null);
      assert.equal((await service.from('admin_emails').update({ status: done ? 'sent' : 'sending',
        completed_at: done ? new Date().toISOString() : null }).eq('id', id)).error, null);
      await route.fulfill({ status: 200, headers, json: { email_id: id, processed: done ? snapshotSize - 1 : 1,
        status: done ? 'sent' : 'sending', done, paused: null, retry_after_seconds: done ? null : 1, needs_manual_review: false,
        counts: { pending: done ? 0 : snapshotSize - 1, sending: 0, accepted: done ? snapshotSize : 1, failed: 0, unknown: 0, skipped: 0 } } });
    });
    await page.reload();
    await until(async () => await page.getByRole('button', { name: 'Send Email', exact: true }).isEnabled(), 'Send did not enable');
    await page.getByRole('button', { name: 'Send Email', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm and send', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Unable to confirm this batch' }).waitFor();
    assert.equal(calls, 2);
    assert.equal(await subject.inputValue(), '');
    assert.equal((await service.from('admin_emails').select('id').eq('created_by', userId)).data.length, 1);
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await page.screenshot({ path: '/private/tmp/email-delivery-mobile.png' });
    await page.reload();
    await page.getByRole('button', { name: 'Resume sending', exact: true }).waitFor();
    assert.equal(calls, 2, 'Reload must not automatically send');
    assert.equal(await page.getByRole('button', { name: 'Send Email', exact: true }).isDisabled(), true);
    await page.getByRole('button', { name: 'Resume sending', exact: true }).click();
    await page.getByText(/Sending finished\./).waitFor();
    assert.equal(calls, 3);
    assert.equal((await service.from('admin_email_recipients').select('id').eq('email_id', queuedId)).data.length, snapshotSize);
    assert.equal((await service.from('admin_emails').select('status').eq('id', queuedId).single()).data.status, 'sent');
    await page.setViewportSize({ width: 1365, height: 1000 });
    await page.screenshot({ path: '/private/tmp/email-delivery-desktop.png', fullPage: true });
    console.log('PASS: mocked delivery batches, visible interruption, reload without auto-send, and same-job resume without duplicate recipients. No emails sent.');
  } finally {
    if (browser) await browser.close();
    if (userId) {
      assert.equal((await service.from('admin_emails').delete().eq('created_by', userId)).error, null);
      if (uploadedPath) assert.equal((await service.storage.from('email_images').remove([uploadedPath])).error, null);
      assert.equal((await service.auth.admin.deleteUser(userId)).error, null);
    }
    if (audienceCampaigns.length) assert.equal((await service.from('campaigns').delete().in('campaign_id', audienceCampaigns)).error, null);
    for (const id of audienceUsers) assert.equal((await service.auth.admin.deleteUser(id)).error, null);
    if (pastCompetitionId) assert.equal((await service.from('competition_metadata').delete().eq('competition_id', pastCompetitionId)).error, null);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
