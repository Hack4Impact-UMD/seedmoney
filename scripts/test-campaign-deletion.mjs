import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const { outputText } = ts.transpileModule(readFileSync(new URL(
  "../src/actions/givebutter/campaignsGivebutter.ts", import.meta.url,
), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

const deleted = { data: [{ campaign_id: 1 }], error: null };
const deadlock = { data: null, error: { code: "40P01", message: "deadlock detected" } };

function deletionFlow(results, { remoteId = 123, remoteStatus = 204, authorized = true } = {}) {
  let attempts = 0;
  const requests = [];
  const delays = [];
  const client = {
    from(table) {
      assert.equal(table, "campaigns");
      return {
        select: () => ({ eq: () => ({ single: async () => ({
          data: { campaign_id: 1, givebutter_id: remoteId }, error: null,
        }) }) }),
        delete: () => ({ eq: () => ({ select: async () => {
          const result = results[attempts++];
          assert.ok(result, "Unexpected additional deletion attempt");
          if (result instanceof Error) throw result;
          return result;
        } }) }),
      };
    },
  };
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, console, process: { env: {} },
    setTimeout(resolve, delay) { delays.push(delay); resolve(); },
    fetch: async (url, init) => {
      requests.push({ url, method: init.method });
      return new Response(null, { status: remoteStatus });
    },
    require(name) {
      if (name === "@/src/lib/requireAdmin") return { requireAdmin: async () => {
        if (!authorized) throw new Error("Not authorized");
        return client;
      } };
      return {};
    },
  });
  return {
    run: () => exports.deleteCampaignAndGivebutter(1),
    attempts: () => attempts, requests, delays,
  };
}

test("a local deadlock is retried without repeating Givebutter deletion", async () => {
  const flow = deletionFlow([deadlock, deleted]);
  await flow.run();
  assert.equal(flow.attempts(), 2);
  assert.equal(flow.requests.length, 1);
  assert.equal(flow.requests[0].method, "DELETE");
  assert.equal(flow.delays.length, 1);
  assert.ok(flow.delays[0] > 0);
});

test("persistent deadlocks stop after three attempts with an explicit partial-failure error", async () => {
  const flow = deletionFlow([deadlock, deadlock, deadlock]);
  await assert.rejects(flow.run(), /deleted from Givebutter.*local cleanup failed/i);
  assert.equal(flow.attempts(), 3);
  assert.equal(flow.requests.length, 1);
  assert.equal(flow.delays.length, 2);
});

test("successful deletion does not retry", async () => {
  const flow = deletionFlow([deleted]);
  await flow.run();
  assert.equal(flow.attempts(), 1);
  assert.equal(flow.requests.length, 1);
  assert.equal(flow.delays.length, 0);
});

test("other SQL errors and empty deletion results are not retried", async () => {
  for (const result of [
    { data: null, error: { code: "42501", message: "permission denied" } },
    { data: [], error: null },
  ]) {
    const flow = deletionFlow([result]);
    await assert.rejects(flow.run(), /deleted from Givebutter.*local cleanup failed/i);
    assert.equal(flow.attempts(), 1);
    assert.equal(flow.delays.length, 0);
  }
});

test("network exceptions are not retried as deadlocks", async () => {
  const flow = deletionFlow([new Error("Network failure")]);
  await assert.rejects(flow.run(), /Network failure/);
  assert.equal(flow.attempts(), 1);
  assert.equal(flow.delays.length, 0);
});

test("campaigns without a Givebutter ID still retry local deadlocks", async () => {
  const flow = deletionFlow([deadlock, deleted], { remoteId: null });
  await flow.run();
  assert.equal(flow.attempts(), 2);
  assert.equal(flow.requests.length, 0);
  const failed = deletionFlow([deadlock, deadlock, deadlock], { remoteId: null });
  await assert.rejects(failed.run(), /^Error: Failed to delete campaign$/);
});

test("remote failures and authorization failures prevent local deletion", async () => {
  const remoteFailure = deletionFlow([], { remoteStatus: 403 });
  await assert.rejects(remoteFailure.run(), /Failed to delete campaign on Givebutter/);
  assert.equal(remoteFailure.attempts(), 0);
  const unauthorized = deletionFlow([], { authorized: false });
  await assert.rejects(unauthorized.run(), /Not authorized/);
  assert.equal(unauthorized.requests.length, 0);
  assert.equal(unauthorized.attempts(), 0);
});
