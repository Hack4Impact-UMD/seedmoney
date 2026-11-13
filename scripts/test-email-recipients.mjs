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
