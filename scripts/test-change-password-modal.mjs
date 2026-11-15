import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function fixture(recovery = false, updateError = null) {
  const state = [];
  let index = 0;
  let reauthenticated = 0;
  let update;
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(
    '../src/components/settings-modals/ChangePasswordModal.tsx', import.meta.url,
  ), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, require: (name) => {
    if (name === 'react') return { useState(initial) {
      const slot = index++;
      if (!(slot in state)) state[slot] = initial;
      return [state[slot], (value) => { state[slot] = typeof value === 'function' ? value(state[slot]) : value; }];
    } };
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
    if (name.includes('supabase-client')) return { createBrowserClient: () => ({ auth: {
      reauthenticate: async () => { reauthenticated++; return { error: null }; },
      updateUser: async (value) => { update = value; return { error: updateError }; },
    } }) };
    return { default: name };
  } });
  const render = () => { index = 0; return exports.default({ open: true, recovery, onClose() {} }); };
  return { render, get update() { return update; }, get reauthenticated() { return reauthenticated; } };
}

function find(node, predicate) {
  if (!node || typeof node !== 'object') return null;
  if (predicate(node)) return node;
  for (const child of Object.values(node)) {
    if (Array.isArray(child)) {
      for (const item of child) { const match = find(item, predicate); if (match) return match; }
    } else { const match = find(child, predicate); if (match) return match; }
  }
  return null;
}
const button = (tree, text) => find(tree, (node) => node.props?.children === text && !!node.props?.onClick);
const field = (tree, label) => find(tree, (node) => node.props?.label === label);

test('settings still requires email verification and saves its nonce', async () => {
  const f = fixture();
  assert.equal(f.render().props.title, 'Verify Email');
  await button(f.render(), 'SEND VERIFICATION EMAIL').props.onClick();
  assert.equal(f.reauthenticated, 1);
  const codeStep = find(f.render(), (node) => !!node.props?.onCodeChange);
  codeStep.props.onCodeChange(' 123456 ');
  button(f.render(), 'NEXT').props.onClick();
  field(f.render(), 'Type new password').props.onChange({ target: { value: 'Password-123!' } });
  field(f.render(), 'Confirm new password').props.onChange({ target: { value: 'Password-123!' } });
  await button(f.render(), 'NEXT').props.onClick();
  assert.equal(f.update.password, 'Password-123!');
  assert.equal(f.update.nonce, '123456');
  assert.equal(f.render().props.title, 'Password Change Success');
});

test('recovery skips verification and keeps token failures on the password step', async () => {
  const f = fixture(true, { message: 'Recovery token expired' });
  assert.equal(f.render().props.title, 'Change Password');
  field(f.render(), 'Type new password').props.onChange({ target: { value: 'Password-123!' } });
  field(f.render(), 'Confirm new password').props.onChange({ target: { value: 'Password-123!' } });
  await button(f.render(), 'NEXT').props.onClick();
  assert.equal(f.reauthenticated, 0);
  assert.equal(Object.hasOwn(f.update, 'nonce'), false);
  assert.equal(f.render().props.title, 'Change Password');
  assert.equal(field(f.render(), 'Type new password').props.helperText, 'Recovery token expired');
});
