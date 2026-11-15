import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const exports = {};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL(
  '../src/lib/passwordRecovery.ts', import.meta.url,
), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
  exports, URLSearchParams, clearTimeout,
  setTimeout: (callback) => setTimeout(callback, 0),
});
const verify = exports.verifyPasswordRecovery;
const url = (suffix) => new URL(`http://localhost:3000/reset-password${suffix}`);

function client({ event = 'PASSWORD_RECOVERY', error = null, session = { user: {} } } = {}) {
  let listener;
  let unsubscribeCount = 0;
  let verifiedType;
  return { auth: {
    verifyOtp: async (params) => {
      verifiedType = params.type;
      return { data: { session }, error };
    },
    onAuthStateChange(callback) {
      listener = callback;
      return { data: { subscription: { unsubscribe() { unsubscribeCount++; } } } };
    },
    async initialize() {
      if (!error) queueMicrotask(() => listener(event, session));
      return { error };
    },
  }, get unsubscribeCount() { return unsubscribeCount; }, get verifiedType() { return verifiedType; } };
}

test('token hash recovery is verified and rejects invalid or missing sessions', async () => {
  const good = client();
  assert.equal(await verify(good, url('?token_hash=test&type=recovery')), true);
  assert.equal(good.verifiedType, 'recovery');
  assert.equal(await verify(client({ error: {} }), url('?token_hash=test&type=recovery')), false);
  assert.equal(await verify(client({ session: null }), url('?token_hash=test&type=recovery')), false);
});

test('wrong-type and missing tokens cannot reuse an existing session', async () => {
  for (const suffix of ['', '?token_hash=test&type=magiclink', '#access_token=test&type=magiclink']) {
    assert.equal(await verify(client(), url(suffix)), false);
  }
});

test('standard PKCE and implicit recovery links require the recovery event', async () => {
  for (const suffix of ['?code=test', '#access_token=test&refresh_token=test&type=recovery']) {
    const good = client();
    assert.equal(await verify(good, url(suffix)), true);
    assert.equal(good.unsubscribeCount, 1);
    assert.equal(await verify(client({ event: 'SIGNED_IN' }), url(suffix)), false);
    assert.equal(await verify(client({ event: 'INITIAL_SESSION' }), url(suffix)), false);
    assert.equal(await verify(client({ error: {} }), url(suffix)), false);
  }
});
