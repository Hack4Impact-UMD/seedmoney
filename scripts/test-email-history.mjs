import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function load(file, imports = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, Date, Set, console: { error() {} }, require: name => imports[name] ?? {} });
  return exports;
}
const types = load('../src/types/emailHistory.ts');
const filters = load('../src/lib/emailHistory.ts', {
  '@/src/types/db/adminEmails': load('../src/types/db/adminEmails.ts'),
});
const paging = load('../src/lib/fetchAllPages.ts');
const plain = value => JSON.parse(JSON.stringify(value));
const input = { page: 0, pageSize: 10, month: 'all', group: 'any' };
function fixture() {
  const state = { authorized: true, queries: [], rows: [], count: 0, error: null, countError: false };
  const db = { from(table) {
    const calls = [['from', table]];
    const query = {};
    for (const method of ['select', 'eq', 'in', 'not', 'contains', 'gte', 'lt', 'order', 'range', 'limit', 'gt']) {
      query[method] = (...args) => { calls.push([method, ...args]); return query; };
    }
    const result = () => {
      state.queries.push(calls);
      const head = calls.find(call => call[0] === 'select')?.[2]?.head;
      return { data: head ? null : state.rows, count: state.count, error: head && state.countError ? Error('Count failed') : state.error };
    };
    query.then = (resolve, reject) => Promise.resolve(result()).then(resolve, reject);
    query.maybeSingle = async () => ({ ...result(), data: state.rows[0] ?? null });
    return query;
  } };
  const actions = load('../src/actions/email/history.ts', {
    '@/src/lib/requireAdmin': { requireAdmin: async () => { if (!state.authorized) throw Error('Denied'); return db; } },
    '@/src/lib/emailHistory': filters, '@/src/types/emailHistory': types, '@/src/lib/fetchAllPages': paging,
  });
  return { state, actions };
}

test('history filters reject invalid pagination, months and groups', () => {
  assert.ok(filters.validHistoryInput(input));
  for (const change of [{ page: -1 }, { page: 0.5 }, { pageSize: 1000 }, { month: '2026-13' }, { group: 'applicants' }, { group: '__proto__' }]) {
    assert.ok(!filters.validHistoryInput({ ...input, ...change }));
  }
  assert.ok(!filters.validHistoryInput(null));
  assert.deepEqual(plain(filters.historyMonthBounds('2026-12')), ['2026-12-01T00:00:00.000Z', '2027-01-01T00:00:00.000Z']);
  assert.deepEqual(plain(filters.historyMonthBounds('2028-02')), ['2028-02-01T00:00:00.000Z', '2028-03-01T00:00:00.000Z']);
});

test('authorization precedes every history query', async () => {
  const { state, actions } = fixture(); state.authorized = false;
  assert.equal((await actions.readEmailHistory(input)).success, false);
  assert.equal((await actions.readEmailHistoryMonths()).success, false);
  assert.equal((await actions.readEmailHistoryDetail('invalid')).success, false);
  assert.equal(state.queries.length, 0);
});

test('list pages are filtered on the server and ordered deterministically without recipient PII', async () => {
  const { state, actions } = fixture(); state.count = 55;
  const result = await actions.readEmailHistory({ page: 2, pageSize: 20, month: '2026-11', group: 'unfinished' });
  assert.equal(result.data.total, 55);
  const calls = plain(state.queries[0]);
  assert.ok(calls.some(c => c[0] === 'range' && c[1] === 40 && c[2] === 59));
  assert.ok(calls.some(c => c[0] === 'contains' && c[2][0] === 'unfinished'));
  assert.ok(calls.some(c => c[0] === 'gte' && c[2] === '2026-11-01T00:00:00.000Z'));
  assert.ok(calls.some(c => c[0] === 'lt' && c[2] === '2026-12-01T00:00:00.000Z'));
  assert.ok(calls.some(c => c[0] === 'not' && c[1] === 'queued_at'));
  assert.deepEqual(calls.find(c => c[0] === 'in')[2], ['sent', 'partially_failed', 'failed']);
  assert.ok(!calls.find(c => c[0] === 'select')[1].includes('recipient_email'));
  assert.deepEqual(calls.filter(c => c[0] === 'order').map(c => c[1]), ['completed_at', 'id']);
});

test('invalid filters and IDs never reach database reads', async () => {
  const { state, actions } = fixture();
  assert.equal((await actions.readEmailHistory({ ...input, pageSize: 0 })).success, false);
  assert.equal((await actions.readEmailHistoryDetail('invalid')).success, false);
  assert.equal(state.queries.length, 0);
});

test('empty history is successful, failed reads and missing counts are not empty history', async () => {
  const { state, actions } = fixture();
  assert.deepEqual(plain((await actions.readEmailHistory(input)).data), { emails: [], total: 0 });
  state.error = Error('Offline');
  assert.equal((await actions.readEmailHistory(input)).success, false);
  assert.equal((await actions.readEmailHistoryMonths()).success, false);
  state.error = null; state.count = null;
  assert.equal((await actions.readEmailHistory(input)).success, false);
});

test('detail counts all outcomes without returning recipient addresses', async () => {
  const { state, actions } = fixture(); const id = 'aa000000-0000-0000-0000-000000000001';
  assert.equal((await actions.readEmailHistoryDetail(id)).success, false);
  state.rows = [{ id, subject: 'News', body_html: '<p>Saved</p>' }]; state.count = 2;
  const result = await actions.readEmailHistoryDetail(id);
  assert.equal(result.success, true);
  assert.deepEqual(plain(result.data.counts), { pending: 2, sending: 2, accepted: 2, failed: 2, unknown: 2, skipped: 2 });
  state.countError = true;
  assert.equal((await actions.readEmailHistoryDetail(id)).success, false);
});

test('month options deduplicate completed dates and omit undated legacy records', async () => {
  const { state, actions } = fixture();
  let reads = 0;
  const original = state.rows;
  Object.defineProperty(state, 'rows', { get() { return reads++ === 0 ? [
    { id: 'a', completed_at: '2026-10-01T00:00:00Z' }, { id: 'b', completed_at: null },
    { id: 'c', completed_at: '2026-11-02T00:00:00Z' }, { id: 'd', completed_at: '2026-11-03T00:00:00Z' },
  ] : original; } });
  assert.deepEqual(plain((await actions.readEmailHistoryMonths()).data), ['2026-11', '2026-10']);
});

test('history hooks isolate filters and details and propagate action failures', async () => {
  let response = { success: true, data: { total: 1, emails: [] } };
  const hook = load('../src/hooks/email/useEmailHistory.ts', {
    '@tanstack/react-query': { useQuery: options => options },
    '@/src/actions/email/history': { readEmailHistory: async () => response, readEmailHistoryDetail: async () => response },
  });
  assert.notDeepEqual(plain(hook.useEmailHistory(input).queryKey), plain(hook.useEmailHistory({ ...input, page: 1 }).queryKey));
  assert.equal(hook.useEmailHistoryDetail(null).enabled, false);
  assert.equal(hook.useEmailHistoryDetail('id').enabled, true);
  assert.equal((await hook.useEmailHistory(input).queryFn()).total, 1);
  response = { success: false, error: 'Unavailable' };
  await assert.rejects(hook.useEmailHistory(input).queryFn(), /Unavailable/);
});
