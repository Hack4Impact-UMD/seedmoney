import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const exports = {};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL(
  '../src/lib/passwordRecovery.ts', import.meta.url,
), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
  exports, URLSearchParams, URL,
  window: { location: { href: 'http://localhost:3000/reset-password' } },
});
const verify = exports.verifyPasswordRecovery;
const url = (suffix) => new URL(`http://localhost:3000/reset-password${suffix}`);

function client({ error = null, session = { user: {} } } = {}) {
  let verifiedType;
  return { auth: {
    verifyOtp: async (params) => {
      verifiedType = params.type;
      return { data: { session }, error };
    },
    initialize: async () => ({ error }),
    getSession: async () => ({ data: { session }, error }),
    setSession: async () => ({ data: { session }, error }),
    exchangeCodeForSession: async () => ({ data: { session }, error }),
  }, get verifiedType() { return verifiedType; } };
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

test('standard PKCE and implicit recovery links require successful authentication', async () => {
  for (const suffix of ['?code=test', '#access_token=test&refresh_token=test&type=recovery']) {
    const good = client();
    assert.equal(await verify(good, url(suffix)), true);
    assert.equal(await verify(client({ session: null }), url(suffix)), false);
    assert.equal(await verify(client({ error: {} }), url(suffix)), false);
  }
});
