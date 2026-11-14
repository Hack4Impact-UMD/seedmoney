import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const ID = "cfa20000-0000-0000-0000-000000000001";
function load(file, imports = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, TextEncoder, console: { error() {} }, require: name => imports[name] });
  return exports;
}
const tokens = load("../src/components/email/emailTokens.ts");
function fixture() {
  const state = { authorized: true, validationErrors: null, serviceCalls: 0, calls: [], preparation: null,
    response: { data: { test: true, request_id: ID, accepted: true }, error: null }, throws: false };
  const action = load("../src/actions/email/test.ts", {
    "@/src/lib/prepareAdminEmail": { prepareAdminEmail: async input => {
      if (!state.authorized) throw new Error("Not authorized");
      state.preparation = input;
      return state.validationErrors ? { success: false, errors: state.validationErrors } : {
        success: true, subject: input.subject, bodyHtml: input.bodyHtml, testEmail: input.testEmail.trim(),
        recipients: [{ email: "never-send-here@example.org", firstName: "Private name", campaignUrl: "https://givebutter.com/private" }],
      };
    } },
    "@/src/lib/supabase-service": { createServiceRoleClient: () => {
      state.serviceCalls++;
      return { functions: { invoke: async (name, options) => {
        state.calls.push({ name, ...options });
        if (state.throws) throw new Error("Connection interrupted");
        return state.response;
      } } };
    } },
    "@/src/components/email/emailTokens": tokens,
  });
  return { state, send: action.sendAdminTestEmail };
}
const input = (overrides = {}) => ({ requestId: ID, subject: "Hello {{first_name}}", bodyHtml: "<p>{{campaign_url}}</p>",
  testEmail: " test@example.org ", recipientGroups: ["approved"], competitionId: 1, mode: "test", ...overrides });

test("sends exactly one test address using example tokens, never audience addresses", async () => {
  const { state, send } = fixture();
  const result = await send(input({ mode: "send", recipients: ["attacker@example.org"] }));
  assert.equal(result.success, true);
  assert.equal(result.testEmail, "test@example.org");
  assert.equal(state.preparation.mode, "test");
  assert.equal(state.calls.length, 1);
  const call = state.calls[0];
  assert.equal(call.name, "send-admin-emails");
  assert.deepEqual(Object.keys(call.body).sort(), ["body_html", "mode", "recipient_email", "request_id", "subject"]);
  assert.equal(call.body.recipient_email, "test@example.org");
  assert.equal(call.body.subject, "Hello Jane");
  assert.match(call.body.body_html, /https:\/\/givebutter.com\/jane-doe-garden/);
  assert.ok(!JSON.stringify(call).includes("Private name"));
  assert.ok(!JSON.stringify(call).includes("never-send-here"));
  assert.ok(!JSON.stringify(call).includes("attacker"));
});

test("authorization and validation errors prevent all sending", async () => {
  const { state, send } = fixture();
  state.authorized = false;
  assert.equal((await send(input())).success, false);
  assert.equal(state.serviceCalls, 0);
  state.authorized = true;
  state.validationErrors = ["Invalid HTML"];
  assert.equal((await send(input())).errors[0], "Invalid HTML");
  assert.equal(state.serviceCalls, 0);
});

test("invalid IDs and oversized example personalization are blocked", async () => {
  const { state, send } = fixture();
  assert.equal((await send(input({ requestId: "bad" }))).success, false);
  assert.equal((await send(input({ subject: "x".repeat(985) + "{{campaign_url}}" }))).success, false);
  assert.equal(state.serviceCalls, 0);
});

test("unavailable or unauthorized Edge Functions show a definite configuration error", async () => {
  const { state, send } = fixture();
  for (const status of [400, 404, 405, 409, 401, 403]) {
    state.response = { data: null, error: { context: { status } } };
    const result = await send(input());
    assert.equal(result.success, false);
    assert.ok(!result.uncertain);
  }
});

test("network, malformed, and duplicate outcomes stay uncertain without automatic retries", async () => {
  for (const response of [{ data: null, error: new Error("Fetch failed") },
    { data: { test: true, request_id: "another-request", accepted: true }, error: null },
    { data: { test: true, request_id: ID, accepted: false, code: "uncertain" }, error: null }]) {
    const { state, send } = fixture();
    state.response = response;
    assert.equal((await send(input())).uncertain, true);
    assert.equal(state.calls.length, 1);
  }
  const { state, send } = fixture();
  state.throws = true;
  assert.equal((await send(input())).uncertain, true);
  assert.equal(state.calls.length, 1);
});

test("rate limits and definite provider rejections are not reported as success", async () => {
  const { state, send } = fixture();
  for (const code of ["rate_limited", "rejected"]) {
    state.response = { data: { test: true, request_id: ID, accepted: false, code }, error: null };
    const result = await send(input());
    assert.equal(result.success, false);
    assert.ok(!result.uncertain);
  }
});
