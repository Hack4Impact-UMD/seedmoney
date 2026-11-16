import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3002';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(baseUrl).hostname));
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
});
const user = {
  id: '11111111-1111-4111-8111-111111111111',
  aud: 'authenticated', role: 'authenticated',
  email: 'recovery-test@example.invalid',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: {}, created_at: new Date().toISOString(),
};
const exp = Math.floor(Date.now() / 1000) + 3600;
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const session = {
  access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, exp, role: 'authenticated' })}.fake`,
  refresh_token: 'fake-refresh-token', token_type: 'bearer', expires_in: 3600,
  expires_at: exp, user,
};

try {
  for (const scenario of ['valid', 'implicit', 'expired', 'wrong-type', 'missing', 'save-failed']) {
    const context = await browser.newContext();
    const calls = [];
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.pathname.includes('/auth/v1/')) {
        const body = request.postDataJSON();
        calls.push({ path: url.pathname, method: request.method(), body });
        if (url.pathname.endsWith('/verify')) {
          assert.equal(body.token_hash, 'fake-recovery-token');
          assert.equal(body.type, 'recovery');
          return route.fulfill({ status: scenario === 'expired' ? 403 : 200,
            contentType: 'application/json',
            body: JSON.stringify(scenario === 'expired'
              ? { code: 'otp_expired', msg: 'Token has expired' } : session) });
        }
        if (url.pathname.endsWith('/user')) {
          if (scenario === 'save-failed' && request.method() === 'PUT') {
            return route.fulfill({ status: 422, contentType: 'application/json',
              body: JSON.stringify({ msg: 'Password was previously used.' }) });
          }
          return route.fulfill({ contentType: 'application/json', body: JSON.stringify(user) });
        }
        if (url.pathname.endsWith('/logout')) return route.fulfill({ status: 204 });
        throw new Error(`Unexpected auth request: ${url.pathname}`);
      }
      // Never allow this test to contact a provider or external service.
      if (url.origin !== new URL(baseUrl).origin) return route.abort();
      return route.continue();
    });
    const page = await context.newPage();
    const query = scenario === 'implicit'
      ? `#access_token=${session.access_token}&refresh_token=fake-refresh-token&type=recovery&token_type=bearer&expires_in=3600`
      : scenario === 'missing' ? ''
      : `?token_hash=fake-recovery-token&type=${scenario === 'wrong-type' ? 'magiclink' : 'recovery'}`;
    await page.goto(`${baseUrl}/reset-password${query}`);
    if (['expired', 'wrong-type', 'missing'].includes(scenario)) {
      await page.getByRole('main').getByRole('alert').waitFor();
      assert.equal(await page.getByRole('dialog').count(), 0);
      assert.equal(calls.filter((call) => call.path.endsWith('/verify')).length,
        scenario === 'expired' ? 1 : 0);
    } else {
      await page.getByRole('dialog').waitFor();
      assert.equal(calls.filter((call) => call.path.endsWith('/verify')).length, scenario === 'implicit' ? 0 : 1);
      assert.equal(new URL(page.url()).search, '');
      assert.equal(calls.some((call) => call.path.endsWith('/reauthenticate')), false);
      await page.getByLabel('Type new password', { exact: true }).fill('Recovery-Test123!');
      await page.getByLabel('Confirm new password', { exact: true }).fill('Recovery-Test123!');
      if (scenario === 'valid') {
        for (const width of [1280, 375]) {
          await page.setViewportSize({ width, height: 850 });
          assert.ok(await page.getByRole('button', { name: 'NEXT', exact: true }).isVisible());
        }
      }
      await page.getByRole('button', { name: 'NEXT', exact: true }).click();
      if (scenario === 'save-failed') {
        await page.getByText('Password was previously used.').waitFor();
        assert.equal(await page.getByText('Verify Email', { exact: true }).count(), 0);
      } else {
        await page.getByText('Your password has been successfully changed!').waitFor();
        await page.getByRole('button', { name: 'LOG IN', exact: true }).click();
        await page.waitForURL(`${baseUrl}/`);
        assert.equal(calls.filter((call) => call.path.endsWith('/logout')).length, 1);
      }
      const update = calls.find((call) => call.method === 'PUT').body;
      assert.equal(update.password, 'Recovery-Test123!');
      assert.equal(Object.hasOwn(update, 'nonce'), false);
    }
    console.log(`pass: ${scenario}`);
    await context.close();
  }

  for (const scenario of ['request-sent', 'request-failed', 'request-network-error']) {
    const context = await browser.newContext();
    const recoveries = [];
    let exchangeCount = 0;
    let releaseRequest;
    const requestGate = new Promise((resolve) => { releaseRequest = resolve; });
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.hostname === 'challenges.cloudflare.com') {
        return route.fulfill({ contentType: 'application/javascript', body: `
          window.testWidgets = {};
          window.turnstile = {
            render(element, options) { window.testWidgets[element.id] = options; return element.id; },
            reset() {}, remove() {}, getResponse() { return 'fake-captcha'; }
          };
          window[${JSON.stringify(url.searchParams.get('onload'))}]?.();
        ` });
      }
      if (url.pathname.includes('/auth/v1/')) {
        if (url.pathname.endsWith('/recover')) {
          recoveries.push({ body: request.postDataJSON(), redirect: url.searchParams.get('redirect_to') });
          await requestGate;
          if (scenario === 'request-network-error') return route.abort();
          return route.fulfill({ status: scenario === 'request-failed' ? 429 : 200,
            contentType: 'application/json', body: JSON.stringify(scenario === 'request-failed'
              ? { msg: 'Too many requests. Please try again later.' } : {}) });
        }
        if (url.pathname.endsWith('/token')) {
          assert.equal(url.searchParams.get('grant_type'), 'pkce');
          assert.equal(request.postDataJSON().auth_code, 'fake-recovery-code');
          exchangeCount++;
          return route.fulfill({ contentType: 'application/json', body: JSON.stringify(session) });
        }
        if (url.pathname.endsWith('/user')) {
          return route.fulfill({ contentType: 'application/json', body: JSON.stringify(user) });
        }
        throw new Error(`Unexpected auth request: ${url.pathname}`);
      }
      if (url.origin !== new URL(baseUrl).origin) return route.abort();
      return route.continue();
    });
    const page = await context.newPage();
    await page.goto(baseUrl);
    await page.getByRole('button', { name: 'Forgot Password / Activate Account', exact: true }).click();
    const dialog = page.getByRole('dialog');
    const send = dialog.getByRole('button', { name: 'SEND RECOVERY EMAIL', exact: true });
    await dialog.getByRole('textbox', { name: /Email address/ }).fill('recovery-test@example.invalid');
    assert.ok(await send.isDisabled(), 'CAPTCHA must complete before sending');
    await page.waitForFunction(() => !!window.testWidgets?.['password-recovery-captcha']);
    await page.evaluate(() => window.testWidgets['password-recovery-captcha'].callback('fake-captcha'));
    await send.click();
    await dialog.getByRole('button', { name: 'SENDING...', exact: true }).waitFor();
    assert.ok(await dialog.getByRole('button', { name: 'CANCEL', exact: true }).isDisabled());
    releaseRequest();
    if (scenario === 'request-sent') {
      await dialog.getByRole('heading', { name: 'Check Your Email' }).waitFor();
      await dialog.getByText(/If an account exists/).waitFor();
      assert.equal(recoveries.length, 1);
      assert.equal(recoveries[0].redirect, `${baseUrl}/reset-password`);
      assert.equal(recoveries[0].body.email, 'recovery-test@example.invalid');
      assert.equal(recoveries[0].body.gotrue_meta_security.captcha_token, 'fake-captcha');
      // Simulate opening the emailed standard recovery link in this browser.
      await page.goto(`${baseUrl}/reset-password?code=fake-recovery-code`);
      await page.getByRole('dialog').getByText('Change Password', { exact: true }).waitFor();
      assert.equal(exchangeCount, 1, 'Recovery code must be exchanged only once');
    } else {
      await dialog.getByRole('alert').waitFor();
      assert.ok(await send.isDisabled(), 'A failed request must require a fresh CAPTCHA');
    }
    console.log(`pass: ${scenario}`);
    await context.close();
  }
  const loginContext = await browser.newContext();
  const loginRequests = [];
  await loginContext.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'challenges.cloudflare.com') {
      return route.fulfill({ contentType: 'application/javascript', body: `
        window.testWidgets = {}; window.testCaptchaResets = 0;
        window.turnstile = {
          render(element, options) { window.testWidgets[element.id] = options; return element.id; },
          reset() { window.testCaptchaResets++; }, remove() {}, getResponse() { return ''; }
        };
        window[${JSON.stringify(url.searchParams.get('onload'))}]?.();
      ` });
    }
    if (url.pathname.endsWith('/auth/v1/token')) {
      loginRequests.push(route.request().postDataJSON());
      return route.fulfill({ status: 400, contentType: 'application/json',
        body: JSON.stringify({ code: 'invalid_credentials', msg: 'Invalid login credentials' }) });
    }
    if (url.pathname.includes('/auth/v1/')) return route.abort();
    if (url.origin !== new URL(baseUrl).origin) return route.abort();
    return route.continue();
  });
  const loginPage = await loginContext.newPage();
  await loginPage.goto(baseUrl);
  await loginPage.getByText('Signed up with Google? Use Log in with Google instead of resetting a password.').waitFor();
  await loginPage.getByRole('textbox', { name: 'Email', exact: true }).fill('test@example.invalid');
  await loginPage.getByLabel('Password', { exact: true }).fill('Wrong-Password123!');
  const login = loginPage.getByRole('button', { name: 'Log in', exact: true });
  assert.ok(await login.isDisabled());
  await loginPage.waitForFunction(() => !!window.testWidgets?.['login-captcha']);
  for (const token of ['first-token', 'fresh-token']) {
    await loginPage.evaluate(token => window.testWidgets['login-captcha'].callback(token), token);
    await login.click();
    await loginPage.getByText('Invalid login credentials', { exact: true }).waitFor();
    await loginPage.waitForFunction(count => window.testCaptchaResets >= count, loginRequests.length);
    assert.ok(await login.isDisabled());
  }
  assert.equal(loginRequests.length, 2);
  assert.equal(loginRequests[0].gotrue_meta_security.captcha_token, 'first-token');
  assert.equal(loginRequests[1].gotrue_meta_security.captcha_token, 'fresh-token');
  console.log('pass: login failures require fresh CAPTCHA; Google guidance visible');
  await loginContext.close();
} finally {
  await browser.close();
}
