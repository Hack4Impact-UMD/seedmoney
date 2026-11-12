import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load(file, require, extras = {}) {
  const exports = {};
  const { outputText } = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  vm.runInNewContext(outputText, {
    exports, require, console, process: { env: {} },
    setTimeout: resolve => resolve(), ...extras,
  });
  return exports;
}

function fixture(status = "published") {
  const state = {
    campaign: { campaign_id: 1, givebutter_id: "remote-1", status },
    lock: null, calls: [], remotePublished: status === "published",
    failPublished: false, failSuspended: false, defer: false, remoteStatus: 200,
    networkError: false, authorized: true, failRelease: false,
  };
  function client() {
    return { from(table) {
      let values, deleting = false;
      const filters = {};
      const query = {
        select: () => query,
        eq: (key, value) => { filters[key] = value; return query; },
        update: data => { values = data; return query; },
        delete: () => { deleting = true; return query; },
        insert: data => { values = data; return query; },
        single: async () => {
          if (state.lock) return { data: null, error: { code: "23505" } };
          state.lock = { ...values, operation_id: "operation-1" };
          return { data: { ...state.lock }, error: null };
        },
        maybeSingle: async () => {
          if (values) {
            if ((values.status === "published" && state.failPublished) ||
                (values.status === "suspended" && state.failSuspended)) {
              return { data: null, error: { message: "Local update failed" } };
            }
            Object.assign(state.campaign, values);
          }
          return { data: { ...state.campaign }, error: null };
        },
        then(resolve, reject) {
          let result = { data: null, error: null };
          if (table === "campaign_publication_operations") {
            if (deleting) {
              if (state.failRelease) result.error = { message: "Release failed" };
              else if (state.lock?.operation_id === filters.operation_id) {
                result.data = [{ operation_id: state.lock.operation_id }];
                state.lock = null;
              }
            } else Object.assign(state.lock, values);
          }
          return Promise.resolve(result).then(resolve, reject);
        },
      };
      return query;
    } };
  }
  function instance() {
    const lock = load("../src/lib/givebutterCampaignLock.ts", name =>
      name === "server-only" ? {} : { createServiceRoleClient: client });
    return load("../src/actions/givebutter/campaignsGivebutter.ts", name => {
      if (name === "@/src/lib/requireAdmin") return { requireAdmin: async () => {
        if (!state.authorized) throw new Error("Not authorized");
        return client();
      } };
      if (name === "@/src/lib/givebutterCampaignLock") return lock;
      return {};
    }, { fetch: async (_url, init) => {
      const body = JSON.parse(init.body);
      const call = { body };
      state.calls.push(call);
      if (state.defer) await new Promise(resolve => { call.finish = resolve; });
      if (state.networkError) throw new Error("Connection lost");
      if (state.remoteStatus === 200) state.remotePublished = body.published;
      return new Response(state.remoteStatus === 200 ? "{}" : "Rejected", { status: state.remoteStatus });
    } });
  }
  return { state, instance };
}

async function until(condition) {
  for (let i = 0; i < 100; i++) {
    if (condition()) return;
    await new Promise(resolve => setImmediate(resolve));
  }
  throw new Error("Operation did not reach its checkpoint");
}

test("sequential suspend and republish preserve local and remote status", async () => {
  const { state, instance } = fixture();
  const actions = instance();
  await actions.unpublishGivebutterCampaign(1);
  assert.equal(state.campaign.status, "suspended");
  assert.equal(state.remotePublished, false);
  assert.equal(state.lock, null);
  await actions.republishSuspendedGivebutterCampaign(1);
  assert.equal(state.campaign.status, "published");
  assert.equal(state.remotePublished, true);
  assert.equal(state.lock, null);
});

test("separate server instances cannot republish while suspension is in flight", async () => {
  const { state, instance } = fixture();
  state.defer = true;
  const pending = instance().unpublishGivebutterCampaign(1);
  await until(() => state.calls.length === 1);
  await assert.rejects(instance().republishSuspendedGivebutterCampaign(1), /already running/);
  await assert.rejects(instance().unpublishGivebutterCampaign(1), /already running/);
  assert.equal(state.calls.length, 1);
  state.calls[0].finish();
  await pending;
  assert.equal(state.campaign.status, "suspended");
  assert.equal(state.remotePublished, false);
  assert.equal(state.lock, null);
});

test("uncertain remote outcomes retain the lock for reconciliation", async () => {
  for (const action of ["unpublishGivebutterCampaign", "republishSuspendedGivebutterCampaign"]) {
    const { state, instance } = fixture(action.startsWith("unpublish") ? "published" : "suspended");
    state.networkError = true;
    await assert.rejects(instance()[action](1), /Connection lost/);
    assert.match(state.lock.error, /outcome is unknown/);
    await assert.rejects(instance()[action](1), /already running/);
  }
});

test("definitive remote rejection releases the lock and permits suspension retry", async () => {
  const { state, instance } = fixture();
  state.remoteStatus = 403;
  await assert.rejects(instance().unpublishGivebutterCampaign(1), /Failed to unpublish/);
  assert.equal(state.campaign.status, "suspended");
  assert.equal(state.lock, null);
  state.remoteStatus = 200;
  await instance().unpublishGivebutterCampaign(1);
  assert.equal(state.remotePublished, false);
});

test("authorization, invalid status, and release failures are not silently ignored", async () => {
  const { state, instance } = fixture("approved");
  await assert.rejects(instance().republishSuspendedGivebutterCampaign(1), /not suspended/);
  assert.equal(state.lock, null);
  state.authorized = false;
  await assert.rejects(instance().unpublishGivebutterCampaign(1), /Not authorized/);
  assert.equal(state.lock, null);
  assert.equal(state.calls.length, 0);
  state.authorized = true;
  state.campaign.status = "published";
  state.failRelease = true;
  await assert.rejects(instance().unpublishGivebutterCampaign(1), /Unable to release/);
  assert.ok(state.lock);
});

test("a failed local republish write unpublishes remotely and restores Suspended", async () => {
  const { state, instance } = fixture("suspended");
  state.failPublished = true;
  await assert.rejects(instance().republishSuspendedGivebutterCampaign(1), /failed to update campaign status/);
  assert.equal(state.campaign.status, "suspended");
  assert.equal(state.remotePublished, false);
  assert.deepEqual(state.calls.map(call => call.body.published), [true, false]);
  assert.equal(state.lock, null);
});

test("failed compensation records the mismatch and blocks conflicting actions", async () => {
  const { state, instance } = fixture("suspended");
  state.failPublished = true;
  state.defer = true;
  const pending = instance().republishSuspendedGivebutterCampaign(1);
  await until(() => state.calls.length === 1);
  state.calls[0].finish();
  await until(() => state.calls.length === 2);
  state.remoteStatus = 403;
  state.calls[1].finish();
  await assert.rejects(pending, /reconciliation/i);
  assert.match(state.lock.error, /recovery failed/i);
  assert.equal(state.remotePublished, true);
  await assert.rejects(instance().unpublishGivebutterCampaign(1), /already running/);
});

test("failed local compensation also retains a reconciliation record", async () => {
  const { state, instance } = fixture("suspended");
  state.failPublished = true;
  state.failSuspended = true;
  await assert.rejects(instance().republishSuspendedGivebutterCampaign(1), /reconciliation/i);
  assert.equal(state.remotePublished, false);
  assert.match(state.lock.error, /recovery failed/i);
});
