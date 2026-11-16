import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function fixture(pendingSignup = null) {
  const state = [];
  let index = 0;
  let calls = 0;
  let release;
  let firstRender = true;
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  const slot = initial => { const key = index++; if (!(key in state)) state[key] = typeof initial === 'function' ? initial() : initial;
    return [state[key], value => { state[key] = typeof value === 'function' ? value(state[key]) : value; }]; };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/components/SignupForm.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, process: { env: {} }, console, URLSearchParams,
    window: { location: { origin: 'http://localhost:3000' }, localStorage: { getItem: () => pendingSignup && JSON.stringify(pendingSignup), setItem() {}, removeItem() {} } }, require(name) {
      if (name === 'react') return { useState: slot, useRef: initial => slot({ current: initial })[0], useEffect(callback) { if (firstRender) callback(); } };
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name === 'next/navigation') return { useRouter: () => ({ push() {}, refresh() {} }), useSearchParams: () => new URLSearchParams() };
      if (name.includes('supabase-client')) return { createBrowserClient: () => ({ auth: {
        signUp: async () => { calls++; return new Promise(resolve => { release = () => resolve({ error: { message: 'Captcha failed' } }); }); },
        resend: async () => new Promise(resolve => { release = () => resolve({ error: null }); }),
      } }) };
      if (name.includes('google-auth')) return { signInWithGoogle: async () => ({ error: null }) };
      if (name.includes('react-turnstile')) return { Turnstile: 'Turnstile' };
      return new Proxy({ default: name }, { get(target, key) { return target[key] ?? String(key); } });
    } });
  return { render() { index = 0; const tree = exports.default(); firstRender = false; return tree; }, get calls() { return calls; }, release() { release(); } };
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return null;
  if (predicate(node)) return node;
  for (const child of Object.values(node)) for (const item of Array.isArray(child) ? child : [child]) {
    const result = find(item, predicate); if (result) return result;
  }
  return null;
}
const captcha = f => find(f.render(), node => node.type === 'Turnstile');

test('signup consumes one CAPTCHA per attempt and blocks concurrent submissions', async () => {
  const f = fixture();
  for (const [label, value] of [['First Name', 'Test'], ['Last Name', 'User'], ['Email', 'test@example.invalid'], ['Password', 'Password-123!'], ['Confirm Password', 'Password-123!']]) {
    const input = find(f.render(), node => node.props?.label === label);
    assert.ok(input, label);
    input.props.onChange({ target: { value } });
  }
  find(f.render(), node => node.type === 'Checkbox').props.onChange({ target: { checked: true } });
  captcha(f).props.onSuccess('first-token');
  const handler = f.render().props.onSubmit;
  const first = handler({ preventDefault() {} });
  await handler({ preventDefault() {} });
  assert.equal(f.calls, 1);
  f.release(); await first;
  await f.render().props.onSubmit({ preventDefault() {} });
  assert.equal(f.calls, 1, 'old token must not be reused');
  captcha(f).props.onSuccess('second-token');
  const second = f.render().props.onSubmit({ preventDefault() {} });
  assert.equal(f.calls, 2);
  f.release(); await second;
});

test('email switching is disabled and guarded while confirmation resend is pending', async () => {
  const f = fixture({ email: 'original@example.invalid', createdAt: Date.now() - 120000, lastSentAt: Date.now() - 120000 });
  f.render();
  captcha(f).props.onSuccess('token');
  const switchEmail = find(f.render(), node => node.props?.children === 'Use a different email');
  const resend = find(f.render(), node => node.props?.children === 'Resend email');
  assert.ok(resend);
  const pending = resend.props.onClick();
  assert.equal(find(f.render(), node => node.props?.children === 'Use a different email').props.disabled, true);
  switchEmail.props.onClick();
  assert.ok(find(f.render(), node => node.props?.children === 'Use a different email'));
  f.release(); await pending;
  const available = find(f.render(), node => node.props?.children === 'Use a different email');
  assert.equal(available.props.disabled, false);
  available.props.onClick();
  assert.ok(find(f.render(), node => node.props?.label === 'Email'));
});
