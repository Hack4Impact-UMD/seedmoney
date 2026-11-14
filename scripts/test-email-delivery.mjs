import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const ID = "email-1";
function fixture() {
  const waits = [];
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/lib/emailDelivery.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, setTimeout: (callback, ms) => { waits.push(ms); return setTimeout(callback, 0); }, clearTimeout });
  return { send: exports.sendEmailBatches, waits };
}
function batch(overrides = {}) {
  return { email_id: ID, status: "sending", done: false,
    counts: { pending: 2, sending: 0, accepted: 3, failed: 0, unknown: 0, skipped: 0 },
    paused: null, retry_after_seconds: 1, needs_manual_review: false, ...overrides };
}
const complete = () => batch({ status: "sent", done: true, retry_after_seconds: null,
  counts: { pending: 0, sending: 0, accepted: 5, failed: 0, unknown: 0, skipped: 0 } });

test("continues batches and stops at completion", async () => {
  const { send, waits } = fixture();
  const responses = [batch(), complete()];
  const progress = [];
  await send(ID, async () => ({ data: responses.shift(), error: null }), value => progress.push(value), new AbortController().signal);
  assert.equal(progress.length, 2);
  assert.equal(progress[1].counts.accepted, 5);
  assert.deepEqual(waits, [1000]);
});

test("honors rate limit retry delay", async () => {
  const { send, waits } = fixture();
  const responses = [batch({ paused: "rate_limited", retry_after_seconds: 60 }), complete()];
  await send(ID, async () => ({ data: responses.shift(), error: null }), () => {}, new AbortController().signal);
  assert.deepEqual(waits, [60000]);
});

test("credential failures stop instead of looping", async () => {
  const { send, waits } = fixture();
  let calls = 0;
  await assert.rejects(send(ID, async () => {
    calls++;
    return { data: batch({ paused: "check_brevo_credentials_or_sender" }), error: null };
  }, () => {}, new AbortController().signal), /credentials/);
  assert.equal(calls, 1);
  assert.deepEqual(waits, []);
});

test("network failures and unexpected responses stop with a visible error", async () => {
  const { send } = fixture();
  for (const result of [{ error: new Error("Network"), data: null },
    { error: null, data: batch({ email_id: "another-email" }) },
    { error: null, data: batch({ retry_after_seconds: 0 }) },
    { error: null, data: batch({ done: true, status: "sent" }) },
    { error: null, data: batch({ needs_manual_review: true }) }]) {
    await assert.rejects(send(ID, async () => result, () => {}, new AbortController().signal), /same email|same queued email/);
  }
});

test("unknown recipients finish with manual review, not another send", async () => {
  const { send, waits } = fixture();
  let calls = 0;
  await send(ID, async () => {
    calls++;
    return { error: null, data: { ...complete(), status: "partially_failed", needs_manual_review: true,
      counts: { ...complete().counts, accepted: 4, unknown: 1 } } };
  }, () => {}, new AbortController().signal);
  assert.equal(calls, 1);
  assert.deepEqual(waits, []);
});

test("unmount abort prevents further batches", async () => {
  const { send } = fixture();
  const abort = new AbortController();
  let calls = 0;
  await assert.rejects(send(ID, async () => { calls++; return { error: null, data: batch() }; },
    () => abort.abort(), abort.signal));
  assert.equal(calls, 1);
});

test("pending lookup authorizes first, scopes to the owner, and reports count failures", async () => {
  let authorized = false;
  let privilegedCalls = 0;
  let countError = false;
  const filters = [];
  const exports = {};
  const query = {
    select: () => query, order: () => query, limit: () => query,
    eq: (key, value) => { filters.push([key, value]); return query; },
    in: (key, value) => { filters.push([key, value]); return query; },
    maybeSingle: async () => ({ data: { id: ID, subject: "Saved email", status: "queued" }, error: null }),
    then: resolve => resolve({ count: countError ? null : 5, error: countError ? new Error("Read failed") : null }),
  };
  const imports = {
    "@/src/lib/requireAdmin": { requireAdmin: async () => {
      if (!authorized) throw new Error("Not authorized");
      return { auth: { getUser: async () => ({ data: { user: { id: "admin-1" } }, error: null }) } };
    } },
    "@/src/lib/supabase-service": { createServiceRoleClient: () => { privilegedCalls++; return { from: () => query }; } },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/actions/email/delivery.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, console: { error() {} }, require: name => imports[name] });
  assert.equal((await exports.readPendingAdminEmail()).success, false);
  assert.equal(privilegedCalls, 0);
  authorized = true;
  assert.equal((await exports.readPendingAdminEmail()).email.recipientCount, 5);
  assert.ok(filters.some(([key, value]) => key === "created_by" && value === "admin-1"));
  assert.ok(filters.some(([key, value]) => key === "status" && value.join() === "queued,sending"));
  countError = true;
  assert.equal((await exports.readPendingAdminEmail()).success, false);
});
