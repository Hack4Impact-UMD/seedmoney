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

test("campaign personalization retains all eligible current campaigns without guessing a single URL", () => {
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
  assert.equal(recipients.get("single").campaignLinks.length, 1);
  assert.equal(recipients.get("many").campaignLinks.length, 1, "duplicate URLs are listed once");
  assert.equal(recipients.get("pending").campaignLinks.length, 0);
});

test("campaign links are ordered, deduplicated, and retain missing URLs for validation", () => {
  const campaigns = [
    { ...campaign("published"), campaign_id: 3, givebutterlink: "https://givebutter.com/three" },
    { ...campaign("approved"), campaign_id: 1, givebutterlink: " https://givebutter.com/one " },
    { ...campaign("published"), campaign_id: 2, givebutterlink: "https://givebutter.com/one" },
    { ...campaign("approved"), campaign_id: 4 },
    { ...campaign("suspended"), campaign_id: 5 },
    { ...campaign("approved", 2), campaign_id: 6 },
  ];
  const links = resolver.resolveEmailRecipients([user("many", campaigns)], 1, ["approved"]).recipients[0].campaignLinks;
  assert.deepEqual(plain(links.map(link => link.campaignId)), [1, 3, 4]);
  assert.equal(links[0].url, "https://givebutter.com/one");
  assert.equal(links[2].url, "");
  assert.deepEqual(plain(resolver.resolveEmailRecipients([user("many", campaigns.reverse())], 1, ["approved"])
    .recipients[0].campaignLinks), plain(links));
});

const paging = load("../src/lib/fetchAllPages.ts");
test('keyset paging ignores changing counts and rejects stalled or failed reads', async () => {
  const rows = await paging.fetchAllPagesAfter(async after => ({
    data: after === null ? [{ id: 1 }] : after === 1 ? [{ id: 2 }] : [], count: 1, error: null,
  }), row => row.id);
  assert.deepEqual(plain(rows), [{ id: 1 }, { id: 2 }]);
  await assert.rejects(paging.fetchAllPagesAfter(async () => ({ data: [{ id: 1 }], count: null, error: null }), row => row.id), /did not advance/);
  await assert.rejects(paging.fetchAllPagesAfter(async after => after === null
    ? { data: [{ id: 1 }], count: null, error: null }
    : { data: null, count: null, error: { message: 'Membership page failed' } }, row => row.id), /Membership page failed/);
});
function readerFixture() {
  const state = { authorized: true, services: 0, competition: { competition_id: 1 }, competitionError: null,
    users: [], members: [], reads: [], cap: 1000, failAt: null, deleteMemberAfterFirst: false, deleteUserAfterFirst: false };
  const client = { from(table) {
    const filters = [];
    let after = null, limit = 1000;
    const query = {
      select(columns) { assert.ok(!columns.includes("contact_email")); return query; },
      eq(key, value) { filters.push([key, value]); return query; },
      order() { return query; },
      limit(value) { limit = value; return query; },
      gt(key, value) { assert.equal(key, 'id'); after = value; return query; },
      or(value) {
        const match = value.match(/^user_id.gt.([^,]+),and\(user_id.eq.([^,]+),campaign_id.gt.(\d+)\)$/);
        assert.ok(match); assert.equal(match[1], match[2]);
        after = { userId: match[1], campaignId: Number(match[3]) };
        return query;
      },
      then(resolve, reject) {
        return Promise.resolve().then(() => {
          state.reads.push({ table, after });
          if (state.failAt === `${table}:${after}`) return { data: null, count: null, error: { message: 'Page failed' } };
          if (table === 'users') {
            if (after && state.deleteUserAfterFirst) { state.users.shift(); state.deleteUserAfterFirst = false; }
            const rows = state.users.filter(row => filters.every(([key, value]) => row[key] === value))
              .sort((a, b) => a.id.localeCompare(b.id)).filter(row => !after || row.id > after);
            return { data: rows.slice(0, Math.min(limit, state.cap)), count: null, error: null };
          }
          if (after && state.deleteMemberAfterFirst) { state.members.shift(); state.deleteMemberAfterFirst = false; }
          const rows = state.members.map(row => ({ ...row, campaign_id: row.campaign_id ?? row.campaigns.campaign_id }))
            .filter(row => filters.every(([key, value]) => (key === 'campaigns.competition_id' ? row.campaigns?.competition_id : row[key]) === value))
            .sort((a, b) => a.user_id.localeCompare(b.user_id) || a.campaign_id - b.campaign_id)
            .filter(row => !after || row.user_id > after.userId || (row.user_id === after.userId && row.campaign_id > after.campaignId));
          return { data: rows.slice(0, Math.min(limit, state.cap)), count: null, error: null };
        }).then(resolve, reject);
      },
      async maybeSingle() { return { data: state.competition, error: state.competitionError }; },
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
  assert.ok(state.reads.some(value => value.table === 'users' && value.after));
  assert.ok(state.reads.some(value => value.table === 'campaign_members' && value.after));
});

test("pagination also works with a smaller server row cap", async () => {
  const { state, reader } = readerFixture();
  state.cap = 2;
  state.users = Array.from({ length: 5 }, (_, i) => user(`u${i}`));
  assert.equal((await reader.readCurrentEmailAudience(["all"])).total, 5);
  assert.deepEqual(state.reads.filter(value => value.table === "users").map(value => value.after), [null, 'u1', 'u3', 'u4']);
});

test('deleting an earlier user between pages does not skip another recipient', async () => {
  const { state, reader } = readerFixture();
  state.cap = 1;
  state.users = [user('a'), user('b'), user('c')];
  state.deleteUserAfterFirst = true;
  const result = await reader.readCurrentEmailAudience(['not_started']);
  assert.deepEqual(plain(result.recipients.map(row => row.userId)), ['a', 'b', 'c']);
  assert.equal(result.total, 3);
  assert.deepEqual(state.reads.filter(row => row.table === 'users').map(row => row.after), [null, 'a', 'b', 'c']);
});

test('membership cursors keep both keys and do not skip rows after deletion', async () => {
  const { state, reader } = readerFixture();
  state.cap = 1;
  state.users = [user('leader'), user('next')];
  state.members = [
    { user_id: 'leader', role: 'campaign_leader', campaigns: { ...campaign('approved'), campaign_id: 1 } },
    { user_id: 'leader', role: 'campaign_leader', campaigns: { ...campaign('approved'), campaign_id: 2 } },
    { user_id: 'next', role: 'campaign_leader', campaigns: { ...campaign('approved'), campaign_id: 3 } },
  ];
  state.deleteMemberAfterFirst = true;
  const result = await reader.readCurrentEmailAudience(['approved']);
  assert.equal(result.total, 2);
  assert.equal(result.recipients.find(row => row.userId === 'leader').campaignUrl, null);
  assert.ok(state.reads.some(row => row.after?.userId === 'leader' && row.after.campaignId === 2));
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
  state.failAt = "users:three";
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
