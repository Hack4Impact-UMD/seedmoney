import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function fixture({ rows = [], queryError = null, signingError = null, failedPath = null } = {}) {
  const calls = { orders: [], batches: [], clients: 0 };
  const query = {
    select() { return this; }, in(_, ids) { calls.ids = ids; return this; },
    order(...args) { calls.orders.push(args); return this; },
    then(resolve) { return Promise.resolve({ data: rows, error: queryError }).then(resolve); },
  };
  const db = { from: () => query, storage: { from: () => ({
    async createSignedUrls(paths, ttl) {
      calls.batches.push({ paths: Array.from(paths), ttl });
      return { error: signingError, data: paths.map(path => ({
        path, signedUrl: `signed-${path}`, error: path === failedPath ? 'not found' : null,
      })).reverse() };
    },
  }) } };
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(
    '../src/actions/db/campaign-image-records.ts', import.meta.url,
  ), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
    exports, process: { env: {} }, console: { error() {} }, require: (name) => {
      assert.ok(name.includes('supabase-client'));
      const create = () => { calls.clients++; return db; };
      return { createBrowserClient: create, createServerClient: create };
    },
  });
  return { read: exports.readCampaignImageUrlsByCampaignIds, calls };
}

test('signs only the selected cover per campaign in one batch; response order is irrelevant', async () => {
  const rows = Array.from({ length: 12 }, (_, index) => [
    { campaign_id: 1001 + index, storage_path: `cover-${index}`, is_main: true },
    { campaign_id: 1001 + index, storage_path: `supporting-${index}`, is_main: false },
  ]).flat();
  const f = fixture({ rows });
  const result = await f.read(Array.from({ length: 12 }, (_, index) => 1001 + index));
  assert.equal(Object.keys(result).length, 12);
  assert.equal(result[1001], 'signed-cover-0');
  assert.equal(result[1012], 'signed-cover-11');
  assert.equal(f.calls.batches.length, 1);
  assert.equal(f.calls.batches[0].paths.length, 12);
  assert.equal(f.calls.batches[0].ttl, 3600);
  assert.equal(f.calls.orders.map(([column]) => column).join(','), 'campaign_id,is_main,display_order');
});

test('empty IDs and absent records do not issue signing requests', async () => {
  const f = fixture();
  assert.equal(Object.keys(await f.read([])).length, 0);
  assert.equal(f.calls.clients, 0);
  assert.equal(Object.keys(await f.read([1])).length, 0);
  assert.equal(f.calls.batches.length, 0);
});

test('individual missing files do not hide successful images; request errors remain retryable', async () => {
  const rows = [{ campaign_id: 1, storage_path: 'missing' }, { campaign_id: 2, storage_path: 'good' }];
  const result = await fixture({ rows, failedPath: 'missing' }).read([1, 2]);
  assert.equal(result[1], null);
  assert.equal(result[2], 'signed-good');
  await assert.rejects(fixture({ rows, signingError: { message: 'busy' } }).read([1, 2]), /busy/);
  await assert.rejects(fixture({ queryError: { message: 'busy' } }).read([1]), /busy/);
});
