import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load(file, imports = {}) {
  const exports = {};
  const { outputText } = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  vm.runInNewContext(outputText, { exports, console, require: name => imports[name] ?? {} });
  return exports;
}
const types = load("../src/types/db/adminEmails.ts");
const audience = load("../src/lib/competitionAudience.ts");
const resolver = load("../src/lib/emailRecipients.ts", {
  "@/src/types/db/adminEmails": types, "@/src/lib/competitionAudience": audience,
});
const user = (id, campaigns = [], fields = {}) => ({ id, email: `${id}@example.org`, first_name: id,
  last_name: "Tester", is_admin: false, campaigns, ...fields });
const campaign = (status, competition_id = 1) => ({ campaign_id: 1, name: "Garden", status, competition_id });
const plain = value => JSON.parse(JSON.stringify(value));

test("groups use current-competition statuses and account email only", () => {
  const result = resolver.resolveEmailRecipients([
    user("new"), user("old", [campaign("approved", 2)]),
    user("draft", [campaign("in_progress")]), user("approved", [campaign("approved")], { contact_email: "wrong@example.org" }),
    user("live", [campaign("published")]), user("pending", [campaign("pending")]),
    user("denied", [campaign("denied")]), user("suspended", [campaign("suspended")]),
    user("failed", [campaign("publish_failed")]), user("archived", [campaign("archived")]),
    user("admin", [], { is_admin: true }),
  ], 1, ["approved"]);
  assert.deepEqual(plain(result.groupCounts), { all: 10, not_started: 2, unfinished: 1, approved: 2 });
  assert.deepEqual(plain(result.recipients.map(value => value.email)), ["approved@example.org", "live@example.org"]);
});

test("multiple campaigns and overlapping groups send to each account once", () => {
  const users = [user("many", [campaign("approved"), campaign("published"), campaign("in_progress")]), user("new")];
  const result = resolver.resolveEmailRecipients(users, 1, ["approved", "unfinished", "approved"]);
  assert.equal(result.total, 1);
  assert.equal(result.groupCounts.approved, 1);
  assert.equal(result.groupCounts.unfinished, 1);
  assert.equal(resolver.resolveEmailRecipients(users, 1, ["all", "approved", "not_started"]).total, 2);
  assert.equal(resolver.resolveEmailRecipients(users, 1, []).total, 0);
});

test("email deduplication is trimmed and case-insensitive with stable recipient selection", () => {
  const users = [user("b", [campaign("approved")], { email: " SHARED@example.org " }),
    user("a", [campaign("in_progress")], { email: "shared@EXAMPLE.org" })];
  const result = resolver.resolveEmailRecipients(users, 1, ["all", "approved", "unfinished"]);
  assert.equal(result.total, 1);
  assert.equal(result.recipients[0].userId, "a");
  assert.equal(result.recipients[0].email, "shared@EXAMPLE.org");
  assert.equal(result.groupCounts.all, 1);
  assert.equal(resolver.resolveEmailRecipients(users.reverse(), 1, ["all"]).recipients[0].userId, "a");
  assert.equal(resolver.resolveEmailRecipients(users, 1, ["approved"]).recipients[0].userId, "b");
});

test("invalid account addresses are excluded visibly rather than counted as deliverable", () => {
  const result = resolver.resolveEmailRecipients([user("ok"), user("blank", [], { email: " " }),
    user("bad", [], { email: "broken" }), user("missing", [], { email: null })], 1, ["all"]);
  assert.equal(result.total, 1);
  assert.equal(result.excludedInvalidEmails, 3);
});

test("unknown groups and missing competition IDs fail closed", () => {
  for (const groups of [["applicants"], ["__proto__"], null, "all", ["all", "all", "all", "all", "all"]]) {
    assert.equal(resolver.validEmailGroups(groups), false);
    assert.throws(() => resolver.resolveEmailRecipients([], 1, groups), /Invalid/);
  }
  for (const id of [null, 0, -1, 1.2]) assert.throws(() => resolver.resolveEmailRecipients([], id, []), /Invalid/);
});

test("campaign personalization uses only one eligible current campaign and never guesses", () => {
  const eligible = { ...campaign("approved"), givebutterlink: " https://givebutter.com/garden " };
  const result = resolver.resolveEmailRecipients([
    user("single", [eligible, { ...campaign("approved", 2), campaign_id: 2 }]),
    user("many", [eligible, { ...eligible, campaign_id: 2 }]),
    user("pending", [{ ...eligible, status: "pending" }]),
  ], 1, ["all"]);
  const recipients = new Map(result.recipients.map(value => [value.userId, value]));
  assert.equal(recipients.get("single").campaignUrl, "https://givebutter.com/garden");
  assert.equal(recipients.get("single").campaignId, 1);
  assert.equal(recipients.get("many").campaignUrl, null);
  assert.equal(recipients.get("pending").campaignUrl, null);
});

const paging = load("../src/lib/fetchAllPages.ts");
function readerFixture() {
  const state = { authorized: true, services: 0, competition: { competition_id: 1 }, competitionError: null,
    users: [], members: [], reads: [], cap: 1000, failAt: null };
  const client = { from(table) {
    const filters = [];
    const query = {
      select(columns) { assert.ok(!columns.includes("contact_email")); return query; },
      eq(key, value) { filters.push([key, value]); return query; },
      order() { return query; },
      async maybeSingle() { return { data: state.competition, error: state.competitionError }; },
      async range(from, to) {
        state.reads.push({ table, from, to });
        if (state.failAt === `${table}:${from}`) return { data: null, count: null, error: { message: "Page failed" } };
        const rows = (table === "users" ? state.users : state.members).filter(row => filters.every(([key, value]) =>
          (key === "campaigns.competition_id" ? row.campaigns?.competition_id : row[key]) === value));
        return { data: rows.slice(from, Math.min(to + 1, from + state.cap)), count: rows.length, error: null };
      },
    };
    return query;
  } };
  const reader = load("../src/lib/readEmailAudience.ts", {
    "@/src/lib/requireAdmin": { requireAdmin: async () => { if (!state.authorized) throw new Error("Not authorized"); } },
    "@/src/lib/supabase-service": { createServiceRoleClient: () => { state.services++; return client; } },
    "@/src/lib/fetchAllPages": paging, "@/src/lib/emailRecipients": resolver,
  });
  const action = load("../src/actions/email/recipients.ts", { "@/src/lib/readEmailAudience": reader });
  return { state, reader, action };
}

test("database audience uses leader relationships, not contact or login-email matching", async () => {
  const { state, reader, action } = readerFixture();
  state.users = [user("leader"), user("member"), user("previous"), user("admin", [], { is_admin: true })];
  state.members = [
    { user_id: "leader", role: "campaign_leader", campaigns: campaign("approved") },
    { user_id: "member", role: "campaign_member", campaigns: campaign("published") },
    { user_id: "previous", role: "campaign_leader", campaigns: campaign("approved", 2) },
  ];
  const result = await reader.readCurrentEmailAudience(["not_started"]);
  assert.deepEqual(plain(result.recipients.map(value => value.userId)), ["member", "previous"]);
  assert.equal(result.groupCounts.approved, 1);
  const summary = await action.readEmailAudienceSummary(["all"]);
  assert.equal(summary.success, true);
  assert.equal(summary.summary.total, 3);
  assert.equal("recipients" in summary.summary, false);
  assert.ok(!JSON.stringify(summary).includes("@example.org"));
});

test("all users and memberships are paginated beyond Supabase's response limit", async () => {
  const { state, reader } = readerFixture();
  state.users = Array.from({ length: 1005 }, (_, i) => user(`u${i}`));
  state.members = state.users.map(value => ({ user_id: value.id, role: "campaign_leader", campaigns: campaign("in_progress") }));
  const result = await reader.readCurrentEmailAudience(["unfinished"]);
  assert.equal(result.total, 1005);
  assert.equal(result.groupCounts.not_started, 0);
  assert.equal(state.reads.filter(value => value.from === 1000).length, 2);
});

test("pagination also works with a smaller server row cap", async () => {
  const { state, reader } = readerFixture();
  state.cap = 2;
  state.users = Array.from({ length: 5 }, (_, i) => user(`u${i}`));
  assert.equal((await reader.readCurrentEmailAudience(["all"])).total, 5);
  assert.deepEqual(state.reads.filter(value => value.table === "users").map(value => value.from), [0, 2, 4]);
});

test("authorization, missing competition, and partial-page failures fail closed", async () => {
  const { state, reader, action } = readerFixture();
  state.authorized = false;
  await assert.rejects(reader.readCurrentEmailAudience(["all"]), /Not authorized/);
  assert.equal(state.services, 0);
  state.authorized = true;
  await assert.rejects(reader.readCurrentEmailAudience(["bad"]), /Invalid/);
  assert.equal(state.services, 0);
  state.competition = null;
  await assert.rejects(reader.readCurrentEmailAudience(["all"]), /No current competition/);
  state.competition = { competition_id: 1 };
  state.competitionError = { message: "Multiple current competitions" };
  await assert.rejects(reader.readCurrentEmailAudience(["all"]));
  state.competitionError = null;
  state.cap = 2;
  state.users = [user("one"), user("two"), user("three")];
  state.failAt = "users:2";
  await assert.rejects(reader.readCurrentEmailAudience(["all"]), /Page failed/);
  const result = await action.readEmailAudienceSummary(["all"]);
  assert.equal(result.success, false);
  assert.equal("summary" in result, false);
});

test("audience hook isolates selections, refreshes counts, and propagates errors", async () => {
  let result = { success: true, summary: { competitionId: 1, total: 2 } };
  const selections = [];
  const hook = load("../src/hooks/email/useEmailAudience.ts", {
    "@tanstack/react-query": { useQuery: options => options },
    "@/src/actions/email/recipients": { readEmailAudienceSummary: async groups => { selections.push(groups); return result; } },
  }).default;
  const approved = hook(["unfinished", "approved", "approved"]);
  assert.deepEqual(plain(approved.queryKey), ["admin-emails", "audience", ["approved", "unfinished"]]);
  assert.deepEqual(plain(hook(["approved", "unfinished"]).queryKey), plain(approved.queryKey));
  assert.notDeepEqual(plain(hook(["all"]).queryKey), plain(approved.queryKey));
  assert.equal(approved.refetchInterval, 30_000);
  assert.equal(approved.refetchOnWindowFocus, true);
  assert.equal(hook([], false).enabled, false);
  assert.equal((await approved.queryFn()).total, 2);
  assert.deepEqual(plain(selections[0]), ["approved", "unfinished"]);
  result = { success: false, error: "Recipients unavailable" };
  await assert.rejects(approved.queryFn(), /Recipients unavailable/);
});
