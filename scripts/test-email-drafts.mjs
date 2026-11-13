import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { randomUUID } from "node:crypto";

const ID = "00000000-0000-0000-0000-000000000001";
function load(file, imports = {}, globals = {}) {
  const exports = {};
  const { outputText } = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  vm.runInNewContext(outputText, { exports, console, TextEncoder, require: name => imports[name] ?? {}, ...globals });
  return exports;
}
const types = load("../src/types/db/adminEmails.ts");
const validation = load("../src/lib/emailDraftValidation.ts", { "@/src/types/db/adminEmails": types });
const input = (fields = {}) => ({ id: ID, version: 0, subject: "Hello", bodyHtml: "<p>Hi</p>", recipientGroups: ["all"], ...fields });

function fixture() {
  const state = { rows: [], authorized: true, fail: false, services: 0, writes: 0 };
  const client = { from(table) {
    let operation = "read", fields, limit;
    const filters = [], orders = [];
    const query = {
      select: () => query,
      eq: (key, value) => { filters.push([key, value]); return query; },
      order: (key, options) => { orders.push([key, options?.ascending ?? true]); return query; },
      limit: value => { limit = value; return query; },
      insert: value => { operation = "insert"; fields = value; return query; },
      update: value => { operation = "update"; fields = value; return query; },
      delete: () => { operation = "delete"; return query; },
      async maybeSingle() {
        if (state.fail) return { data: null, error: { message: "Database unavailable" } };
        if (table === "competition_metadata") return { data: { competition_id: 1 }, error: null };
        let rows = state.rows.filter(row => filters.every(([key, value]) => row[key] === value));
        if (operation === "insert") {
          if (state.rows.some(row => row.id === fields.id)) return { data: null, error: { code: "23505" } };
          state.writes++;
          const row = { ...fields, version: 1, updated_at: "2026-11-12T10:00:00Z" };
          state.rows.push(row);
          return { data: { ...row }, error: null };
        }
        if (operation === "update") {
          for (const row of rows) { Object.assign(row, fields); row.version++; state.writes++; }
        } else if (operation === "delete") {
          for (const row of rows) { state.rows.splice(state.rows.indexOf(row), 1); state.writes++; }
        }
        rows = [...rows].sort((a, b) => {
          for (const [key, ascending] of orders) {
            if (a[key] !== b[key]) return (a[key] < b[key] ? -1 : 1) * (ascending ? 1 : -1);
          }
          return 0;
        });
        if (limit) rows = rows.slice(0, limit);
        return { data: rows[0] ? { ...rows[0] } : null, error: null };
      },
      single() { return query.maybeSingle(); },
    };
    return query;
  } };
  const actions = load("../src/actions/email/drafts.ts", {
    "@/src/lib/requireAdmin": { requireAdmin: async () => {
      if (!state.authorized) throw new Error("Not authorized");
      return { auth: { getUser: async () => ({ data: { user: { id: "admin-1" } }, error: null }) } };
    } },
    "@/src/lib/supabase-service": { createServiceRoleClient: () => { state.services++; return client; } },
    "@/src/lib/emailDraftValidation": validation,
  });
  return { state, actions };
}

test("creating a draft sets its owner and competition and preserves unfinished HTML", async () => {
  const { state, actions } = fixture();
  const result = await actions.saveEmailDraft(input({ subject: "  Subject  ", bodyHtml: "<p>unfinished" }));
  assert.equal(result.success, true);
  assert.equal(result.draft.created_by, "admin-1");
  assert.equal(result.draft.competition_id, 1);
  assert.equal(result.draft.subject, "  Subject  ");
  assert.equal(result.draft.body_html, "<p>unfinished");
  assert.equal(state.rows.length, 1);
});

test("only the latest draft owned by the signed-in admin is restored", async () => {
  const { state, actions } = fixture();
  state.rows = [
    { id: "1", created_by: "admin-1", status: "draft", updated_at: "2026-01-01" },
    { id: "2", created_by: "admin-1", status: "draft", updated_at: "2026-02-01" },
    { id: "3", created_by: "admin-2", status: "draft", updated_at: "2026-03-01" },
    { id: "4", created_by: "admin-1", status: "sent", updated_at: "2026-04-01" },
  ];
  assert.equal((await actions.readLatestEmailDraft()).draft.id, "2");
});

test("compare-and-swap rejects stale changes and non-draft statuses", async () => {
  const { state, actions } = fixture();
  await actions.saveEmailDraft(input());
  const saved = await actions.saveEmailDraft(input({ version: 1, subject: "New" }));
  assert.equal(saved.draft.version, 2);
  const stale = await actions.saveEmailDraft(input({ version: 1, subject: "Stale" }));
  assert.equal(stale.code, "conflict");
  assert.equal(state.rows[0].subject, "New");
  for (const status of ["queued", "sending", "sent", "partially_failed", "failed"]) {
    state.rows[0].status = status;
    assert.equal((await actions.saveEmailDraft(input({ version: 2, subject: "Overwrite" }))).code, "conflict");
    assert.equal(state.rows[0].subject, "New");
  }
});

test("replaying an acknowledged or response-lost request does not duplicate or overwrite", async () => {
  const { state, actions } = fixture();
  await actions.saveEmailDraft(input());
  assert.equal((await actions.saveEmailDraft(input())).success, true);
  assert.equal(state.rows.length, 1);
  assert.equal(state.writes, 1);
  const update = input({ version: 1, subject: "Updated" });
  await actions.saveEmailDraft(update);
  assert.equal((await actions.saveEmailDraft(update)).success, true);
  assert.equal(state.writes, 2);
  assert.equal((await actions.saveEmailDraft(input())).code, "conflict");
});

test("a draft cannot be edited or discarded by a different admin", async () => {
  const { state, actions } = fixture();
  await actions.saveEmailDraft(input());
  state.rows[0].created_by = "admin-2";
  assert.equal((await actions.saveEmailDraft(input({ version: 1, subject: "Other admin" }))).code, "conflict");
  await actions.discardEmailDraft(ID, 1);
  assert.equal(state.rows.length, 1);
});

test("discard only removes an owned draft at its expected version and is repeatable", async () => {
  const { state, actions } = fixture();
  await actions.saveEmailDraft(input());
  assert.equal((await actions.discardEmailDraft(ID, 2)).code, "conflict");
  state.rows[0].status = "queued";
  assert.equal((await actions.discardEmailDraft(ID, 1)).code, "conflict");
  state.rows[0].status = "draft";
  assert.equal((await actions.discardEmailDraft(ID, 1)).success, true);
  assert.equal((await actions.discardEmailDraft(ID, 1)).success, true);
  assert.equal(state.rows.length, 0);
});

test("authorization and database failures never report a successful load or save", async () => {
  const { state, actions } = fixture();
  state.authorized = false;
  assert.equal((await actions.readLatestEmailDraft()).success, false);
  assert.equal((await actions.saveEmailDraft(input())).success, false);
  assert.equal((await actions.discardEmailDraft(ID, 1)).success, false);
  assert.equal(state.services, 0);
  state.authorized = true;
  state.fail = true;
  assert.equal((await actions.readLatestEmailDraft()).success, false);
  assert.equal((await actions.saveEmailDraft(input())).success, false);
  assert.equal(state.writes, 0);
});

test("invalid identity, version, groups, and oversized payloads are rejected", async () => {
  const { state, actions } = fixture();
  for (const fields of [{ id: "bad" }, { version: -1 }, { version: 1.1 },
    { recipientGroups: ["applicants"] }, { recipientGroups: ["__proto__"] },
    { subject: "a".repeat(1001) }, { bodyHtml: "a".repeat(500_001) },
    { bodyHtml: "\u20ac".repeat(200_000) }]) {
    assert.equal((await actions.saveEmailDraft(input(fields))).code, "validation");
  }
  assert.equal(state.writes, 0);
});

async function hookFixture(save, discard = async () => ({ success: true, draft: null })) {
  const effects = [];
  const hook = load("../src/hooks/email/useEmailDraft.ts", {
    react: {
      useState: initial => [typeof initial === "function" ? initial() : initial, () => {}],
      useRef: current => ({ current }), useCallback: callback => callback,
      useEffect: effect => { effects.push(effect); },
    },
    "@/src/actions/email/drafts": {
      readLatestEmailDraft: async () => ({ success: true, draft: null }),
      saveEmailDraft: save, discardEmailDraft: discard,
    },
    "@/src/lib/emailDraftValidation": validation,
  }, { crypto: { randomUUID }, window: { addEventListener() {}, removeEventListener() {} } });
  const result = hook.default();
  effects[0]();
  await new Promise(resolve => setImmediate(resolve));
  return result;
}

function saved(input) {
  return { success: true, draft: {
    id: input.id, version: input.version + 1, subject: input.subject,
    body_html: input.bodyHtml, recipient_groups: input.recipientGroups,
    status: "draft", updated_at: new Date().toISOString(),
  } };
}

test("a synchronous validation failure does not leave a rejected save in flight", async () => {
  const writes = [];
  const hook = await hookFixture(async value => { writes.push(value); return saved(value); });
  hook.update({ subject: "x".repeat(1001) });
  await assert.rejects(hook.flush(), /oversized/);
  hook.update({ subject: "Corrected" });
  await hook.flush();
  assert.equal(writes.length, 1);
  assert.equal(writes[0].subject, "Corrected");
});

test("the hook serializes initial creation and saves edits made during it", async () => {
  const writes = [];
  let finish;
  const hook = await hookFixture(value => {
    writes.push(value);
    return writes.length === 1 ? new Promise(resolve => { finish = () => resolve(saved(value)); }) : Promise.resolve(saved(value));
  });
  hook.update({ subject: "First" });
  const first = hook.flush();
  await new Promise(resolve => setImmediate(resolve));
  hook.update({ subject: "Latest" });
  const second = hook.flush();
  finish();
  await Promise.all([first, second]);
  assert.equal(writes.length, 2);
  assert.equal(writes[0].id, writes[1].id);
  assert.equal(writes[1].version, 1);
  assert.equal(writes[1].subject, "Latest");
});

test("retry resolves an unacknowledged creation before saving newer local text", async () => {
  const writes = [];
  const hook = await hookFixture(async value => {
    writes.push(value);
    return writes.length === 1 ? { success: false, code: "error", error: "Response lost" } : saved(value);
  });
  hook.update({ subject: "Unacknowledged" });
  await assert.rejects(hook.flush(), /Response lost/);
  hook.update({ subject: "Newer text" });
  await hook.retry();
  assert.equal(writes.map(value => value.subject).join(","), "Unacknowledged,Unacknowledged,Newer text");
  assert.equal(new Set(writes.map(value => value.id)).size, 1);
  assert.equal(writes[2].version, 1);
});

test("retrying failed discard retries deletion rather than reporting a false save", async () => {
  let deletes = 0;
  const hook = await hookFixture(async value => saved(value), async () => {
    deletes++;
    return deletes === 1 ? { success: false, code: "error", error: "Delete failed" } : { success: true, draft: null };
  });
  hook.update({ subject: "Draft" });
  await hook.flush();
  assert.equal(await hook.discard(), false);
  await hook.retry();
  assert.equal(deletes, 2);
});

test("restored HTML can open without passing through the restricted text editor", () => {
  const element = (type, props) => ({ type, props });
  const component = value => ({ __esModule: true, default: value });
  const editor = load("../src/components/email/EmailEditor.tsx", {
    react: { useState: value => [value, () => {}] },
    "react/jsx-runtime": { jsx: element, jsxs: element },
    "@/src/components/email/EmailHtmlEditor": component("html-editor"),
    "@/src/components/email/EmailTextEditor": component("text-editor"),
  }).default;
  const props = { value: "<table><tr><td>Keep this</td></tr></table>", onChange() {} };
  const restored = editor({ ...props, initialFormat: "html" }).props.children[1];
  assert.equal(restored.type, "html-editor");
  assert.equal(restored.props.value, props.value);
  assert.equal(editor(props).props.children[1].type, "text-editor");
});
