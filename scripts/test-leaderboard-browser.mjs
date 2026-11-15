import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname));
const browser = await chromium.launch({ headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
const campaigns = Array.from({ length: 37 }, (_, index) => ({
  campaign_id: 1001 + index, name: `Garden ${index + 1}`, status: 'published',
  competition_id: 3, goal: 1000, project_category: 'School Garden',
  givebutterlink: 'https://example.invalid', city: 'Test City', state: 'MD', country: 'USA',
  competition_standings: [{ competition_id: 3, campaign_id: 1001 + index,
    raised: 1000 - index, donation_count: 1 }],
}));
try {
  for (const width of [1280, 375]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const batches = [];
    const errors = [];
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      const reply = (data) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
      if (url.pathname.startsWith('/rest/v1/')) {
        if (url.pathname.endsWith('/competition_metadata')) return reply([
          { competition_id: 3, start_date: '2026-11-15', end_date: '2026-12-15', is_current: true },
        ]);
        if (url.pathname.endsWith('/campaigns')) return reply(campaigns);
        if (url.pathname.endsWith('/leaderboard_transactions')) return reply([]);
        if (url.pathname.endsWith('/campaign_image_records')) {
          const ids = url.searchParams.get('campaign_id').match(/\d+/g).map(Number);
          assert.ok(ids.length <= 12);
          return reply(ids.map(id => ({ campaign_id: id, storage_path: `campaigns/${id}/main.png`,
            is_main: true, display_order: 0 })));
        }
        throw new Error(`Unexpected database read ${url.pathname}`);
      }
      if (url.pathname === '/storage/v1/object/sign/campaign_images') {
        const { paths } = route.request().postDataJSON();
        assert.ok(paths.length <= 12);
        batches.push(paths);
        return reply(paths.map(path => ({ path, signedURL: `/object/sign/campaign_images/${path}?token=fake`, error: null })));
      }
      if (url.pathname.startsWith('/storage/v1/object/sign/') || url.pathname === '/_next/image') {
        return route.fulfill({ contentType: 'image/png', body: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==', 'base64') });
      }
      if (url.origin !== new URL(base).origin) return route.abort();
      return route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') console.error(message.text()); });
    await page.goto(`${base}/leaderboard`);
    try {
      await page.getByRole('heading', { name: 'Garden 1', exact: true }).waitFor();
    } catch (error) {
      console.error({ errors, body: (await page.locator('body').innerText()).slice(0, 800) });
      throw error;
    }
    await page.getByRole('img', { name: 'Garden 1', exact: true }).waitFor();
    await page.waitForFunction(() => {
      const image = document.querySelector('article img');
      return image?.complete && image.naturalWidth > 0;
    }, null, { timeout: 10000 });
    const image = page.getByRole('img', { name: 'Garden 1', exact: true });
    const source = await image.getAttribute('src');
    assert.ok(source.startsWith('/_next/image?') || source.startsWith('http://127.0.0.1:54321/'));
    assert.equal(await image.getAttribute('loading'), 'lazy');
    assert.equal(await page.locator('article').count(), 12);
    await page.getByRole('button', { name: 'Go to page 2', exact: true }).click();
    await page.getByRole('heading', { name: 'Garden 13', exact: true }).waitFor();
    assert.equal(await page.locator('article').count(), 12);
    await page.getByPlaceholder('Search value by campaign').fill('Garden 37');
    await page.getByRole('heading', { name: 'Garden 37', exact: true }).waitFor();
    assert.equal(await page.locator('article').count(), 1);
    await page.getByPlaceholder('Search value by campaign').fill('');
    await page.getByRole('heading', { name: 'Garden 1', exact: true }).waitFor();
    assert.equal(await page.locator('article').count(), 12);
    await page.screenshot({ path: `/private/tmp/leaderboard-pagination-${width}.png`, fullPage: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'No horizontal overflow');
    assert.ok(batches.length >= 2);
    assert.deepEqual(errors, []);
    console.log(`pass: ${width}px navigation, filters, 12-image batches and layout`);
    await context.close();
  }
} finally { await browser.close(); }
