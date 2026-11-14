import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const ID = "ee220000-0000-0000-0000-000000000001";
function fixture() {
  const state = { authorized: true, user: { id: "admin-1" }, authError: null, services: 0, calls: [], preparations: [],
    readError: null, rpcError: null, loseResponse: false, malformedReceipt: false,
    draft: { id: ID, created_by: "admin-1", competition_id: 1, subject: "Saved subject", body_html: "<p>Saved body</p>",
      recipient_groups: ["approved"], status: "draft", version: 3, queued_at: null },
    preparedError: null,
    recipients: [{ userId: "recipient-1", email: "signup@example.org", firstName: "Garden", campaignId: 1, campaignUrl: "https://givebutter.com/garden" }],
  };
  const client = {
    from() {
      const filters = [];
      const query = { select: () => query, eq: (key, value) => { filters.push([key, value]); return query; },
        maybeSingle: async () => ({ error: state.readError,
          data: state.draft && filters.every(([key, value]) => state.draft[key] === value) ? structuredClone(state.draft) : null }) };
      return query;
    },
    async rpc(name, args) {
      state.calls.push({ name, args });
      if (state.rpcError) return { data: null, error: state.rpcError };
      const already = state.draft.status !== "draft";
      if (!already) { state.draft.status = "queued"; state.draft.queued_at = new Date().toISOString(); state.draft.version++; }
      if (state.loseResponse) { state.loseResponse = false; throw new Error("Response lost after commit"); }
      return { error: null, data: state.malformedReceipt ? {} : {
        email_id: ID, status: state.draft.status, recipient_count: state.recipients.length, already_queued: already,
      } };
    },
  };
  const imports = {
    "@/src/lib/requireAdmin": { requireAdmin: async () => {
      if (!state.authorized) throw new Error("Not authorized");
      return { auth: { getUser: async () => ({ data: { user: state.user }, error: state.authError }) } };
    } },
    "@/src/lib/supabase-service": { createServiceRoleClient: () => { state.services++; return client; } },
    "@/src/lib/prepareAdminEmail": { prepareAdminEmail: async input => {
      state.preparations.push(input);
      return state.preparedError ? { success: false, errors: state.preparedError } : {
        success: true, subject: input.subject, bodyHtml: input.bodyHtml, competitionId: input.competitionId,
        recipients: state.recipients,
      };
    } },
  };
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/actions/email/queue.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, console, require: name => imports[name] ?? {} });
  return { state, queue: exports.queueAdminEmail };
}
const input = { id: ID, version: 3 };
const plain = value => JSON.parse(JSON.stringify(value));

test("queue revalidates saved content and snapshots only server-resolved recipients", async () => {
  const { state, queue } = fixture();
  const result = await queue({ ...input, subject: "Forged", recipients: ["wrong@example.org"], actorId: "other-admin" });
  assert.equal(result.success, true);
  assert.equal(result.receipt.alreadyQueued, false);
  assert.deepEqual(plain(state.preparations[0]), { subject: "Saved subject", bodyHtml: "<p>Saved body</p>",
    competitionId: 1, recipientGroups: ["approved"], mode: "send" });
  const call = state.calls[0];
  assert.equal(call.name, "queue_admin_email");
  assert.equal(call.args.p_actor_id, "admin-1");
  assert.equal(call.args.p_expected_version, 3);
  assert.deepEqual(plain(call.args.p_recipients), [{ user_id: "recipient-1", recipient_email: "signup@example.org",
    first_name: "Garden", campaign_id: 1, campaign_url: "https://givebutter.com/garden" }]);
  assert.ok(!JSON.stringify(result).includes("signup@example.org"));
});

test("authorization and identity checks precede privileged access", async () => {
  const { state, queue } = fixture();
  state.authorized = false;
  assert.equal((await queue(input)).success, false);
  assert.equal(state.services, 0);
  state.authorized = true; state.user = null;
  assert.equal((await queue(input)).success, false);
  assert.equal(state.services, 0);
});

test("invalid IDs and versions cannot queue", async () => {
  const { state, queue } = fixture();
  for (const value of [null, { ...input, id: "bad" }, { ...input, version: 0 }, { ...input, version: 1.1 }]) {
    assert.equal((await queue(value)).code, "validation");
  }
  assert.equal(state.services, 0);
});

test("other owners, missing drafts, stale versions, and validation errors do not reach the RPC", async () => {
  const { state, queue } = fixture();
  state.draft.created_by = "other-admin";
  assert.equal((await queue(input)).code, "conflict");
  state.draft.created_by = "admin-1";
  assert.equal((await queue({ ...input, version: 2 })).code, "conflict");
  state.preparedError = ["Invalid HTML"];
  assert.deepEqual(plain((await queue(input)).errors), ["Invalid HTML"]);
  state.draft = null;
  assert.equal((await queue(input)).code, "conflict");
  assert.equal(state.calls.length, 0);
});

test("SQL conflict and competition changes are visible without reporting queue success", async () => {
  const { state, queue } = fixture();
  for (const message of ["email_draft_conflict", "email_competition_changed"]) {
    state.rpcError = { message };
    assert.equal((await queue(input)).code, "conflict");
  }
  assert.equal(state.draft.status, "draft");
});

test("response-loss retries report the same existing queue without re-resolving recipients", async () => {
  const { state, queue } = fixture();
  state.loseResponse = true;
  assert.equal((await queue(input)).success, false);
  state.preparedError = ["Competition no longer current"];
  const result = await queue(input);
  assert.equal(result.success, true);
  assert.equal(result.receipt.emailId, ID);
  assert.equal(result.receipt.alreadyQueued, true);
  assert.equal(state.preparations.length, 1);
  assert.deepEqual(plain(state.calls[1].args.p_recipients), []);
});

test("already sending or completed jobs never create a new snapshot", async () => {
  const { state, queue } = fixture();
  for (const status of ["sending", "sent", "partially_failed", "failed"]) {
    state.draft.status = status; state.draft.queued_at = new Date().toISOString(); state.draft.version = 20;
    const result = await queue(input);
    assert.equal(result.success, true);
    assert.equal(result.receipt.status, status);
    assert.equal(result.receipt.alreadyQueued, true);
  }
  assert.equal(state.preparations.length, 0);
  state.draft.queued_at = null;
  assert.equal((await queue(input)).code, "conflict");
});

test("database and malformed receipt failures do not become false success", async () => {
  const { state, queue } = fixture();
  state.readError = { message: "Database unavailable" };
  assert.equal((await queue(input)).success, false);
  assert.equal(state.calls.length, 0);
  state.readError = null; state.malformedReceipt = true;
  assert.equal((await queue(input)).success, false);
});
