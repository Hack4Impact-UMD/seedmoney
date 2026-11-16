import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function fixture(outcome = async () => ({ error: { message: 'Invalid password' } })) {
  const state = [];
  let index = 0;
  const calls = [];
  let resets = 0;
  let googleCalls = 0;
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  const slot = initial => { const key = index++; if (!(key in state)) state[key] = initial;
    return [state[key], value => { state[key] = value; }]; };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/components/LoginForm.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, process: { env: {} }, console,
    window: { localStorage: { removeItem() {} } }, require(name) {
      if (name === 'react') return { useState: slot, useRef: initial => slot({ current: initial })[0] };
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name === 'next/navigation') return { useRouter: () => ({ push() {}, refresh() {} }), useSearchParams: () => new URLSearchParams() };
      if (name.includes('supabase-client')) return { createBrowserClient: () => ({ auth: {
        signInWithPassword: async args => { calls.push(args); return outcome(); },
      } }) };
      if (name.includes('google-auth')) return { signInWithGoogle: async () => { googleCalls++; return { error: 'Google unavailable' }; } };
      if (name.includes('react-turnstile')) return { Turnstile: 'Turnstile' };
      return new Proxy({ default: name }, { get(target, key) { return target[key] ?? String(key); } });
    }, URLSearchParams });
  const render = () => { index = 0; return exports.default(); };
  const captcha = () => render().props.children.find(node => node?.type === 'Turnstile');
  captcha().props.ref.current = { reset() { resets++; } };
  return { render, captcha, calls, get resets() { return resets; }, get googleCalls() { return googleCalls; } };
}
const loginButton = f => f.render().props.children.find(node => node?.props?.children === 'Log in');

test('failed login consumes the token; a retry requires a fresh CAPTCHA', async () => {
  const f = fixture();
  assert.ok(loginButton(f).props.disabled);
  f.captcha().props.onSuccess('first-token');
  await f.render().props.onSubmit({ preventDefault() {} });
  assert.equal(f.calls[0].options.captchaToken, 'first-token');
  assert.equal(f.resets, 1);
  assert.ok(loginButton(f).props.disabled);
  await f.render().props.onSubmit({ preventDefault() {} });
  assert.equal(f.calls.length, 1);
  f.captcha().props.onSuccess('second-token');
  await f.render().props.onSubmit({ preventDefault() {} });
  assert.equal(f.calls[1].options.captchaToken, 'second-token');
});

test('synchronous guard prevents concurrent reuse and clears after network exceptions', async () => {
  let reject;
  const f = fixture(() => new Promise((_, fail) => { reject = fail; }));
  f.captcha().props.onSuccess('token');
  const handler = f.render().props.onSubmit;
  const first = handler({ preventDefault() {} });
  await handler({ preventDefault() {} });
  assert.equal(f.calls.length, 1);
  reject(new Error('offline'));
  await first;
  assert.equal(f.resets, 1);
  assert.ok(loginButton(f).props.disabled);
});

test('expired and timed-out CAPTCHA tokens disable login; Google failures reset the widget', async () => {
  const f = fixture();
  for (const callback of ['onExpire', 'onTimeout', 'onError']) {
    f.captcha().props.onSuccess('token');
    f.captcha().props[callback]();
    assert.ok(loginButton(f).props.disabled);
  }
  f.captcha().props.onSuccess('token');
  await f.render().props.children.find(node => node?.props?.children === 'Log in with Google').props.onClick();
  assert.equal(f.googleCalls, 1);
  assert.equal(f.resets, 1);
  assert.ok(loginButton(f).props.disabled);
});
