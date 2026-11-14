import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";

const psql = ["exec", "-i", "supabase_db_seedmoney", "psql", "-X", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-Atq"];
function sql(input) {
  const result = spawnSync("docker", psql, { input, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check) {
  for (let i = 0; i < 150; i++) { if (check()) return; await pause(50); }
  throw new Error("Timed out waiting for SQL session");
}
function session() {
  const child = spawn("docker", psql);
  const state = { child, output: "", error: "", exited: false, code: null };
  child.stdout.on("data", value => { state.output += value; });
  child.stderr.on("data", value => { state.error += value; });
  child.on("close", code => { state.code = code; state.exited = true; });
  child.stdin.on("error", error => { if (error.code !== "EPIPE") state.error += error.message; });
  child.stdin.write("begin; set local lock_timeout='5s';\n");
  return state;
}

test("atomic queue SQL permissions, rollback, versions, and full snapshots", () => {
  const output = sql(readFileSync(new URL("../supabase/tests/admin_email_queue.test.sql", import.meta.url), "utf8"));
  assert.doesNotMatch(output, /not ok|Looks like you failed/);
  assert.match(output, /1\.\.24/);
});

function fixture() {
  const actor = randomUUID(), recipient = randomUUID(), email = randomUUID();
  const competition = sql("select min(competition_id) from public.competition_metadata where is_current having count(*)=1;").trim();
  assert.match(competition, /^\d+$/, "Local tests need exactly one current competition");
  sql(`begin;
    insert into auth.users(id,email) values('${actor}','${actor}@example.org'),('${recipient}','${recipient}@example.org');
    delete from public.users where id in ('${actor}','${recipient}');
    insert into public.users(id,email,is_admin) values('${actor}','${actor}@example.org',true),('${recipient}','${recipient}@example.org',false);
    insert into public.admin_emails(id,created_by,competition_id,subject,body_html,recipient_groups)
    values('${email}','${actor}',${competition},'Queue race','<p>News</p>',array['all']); commit;`);
  return { actor, recipient, email, competition };
}
function cleanup({ email, actor, recipient }) {
  sql(`begin; delete from public.admin_emails where id='${email}'; delete from auth.users where id in ('${actor}','${recipient}'); commit;`);
}
async function race(editFirst) {
  const data = fixture();
  const { actor, recipient, email, competition } = data;
  const call = `select public.queue_admin_email('${email}','${actor}',1,${competition},'Queue race','<p>News</p>',array['all'],
    '[{"user_id":"${recipient}","recipient_email":"${recipient}@example.org"}]')->>'already_queued';`;
  const first = session(), second = session();
  try {
    first.child.stdin.write(editFirst ? `update public.admin_emails set subject='Edited' where id='${email}';\n\\echo FIRST_READY\n`
      : `${call}\n\\echo FIRST_READY\n`);
    await until(() => first.output.includes("FIRST_READY") || first.exited);
    assert.equal(first.exited, false, first.error);
    second.child.stdin.end(`${call}\ncommit;\n`);
    // The waiting session must actually reach the row lock before releasing it.
    await until(() => sql(`select exists(select 1 from pg_stat_activity where wait_event_type='Lock' and query like '%queue_admin_email%' and query like '%${email}%');`).trim() === "t");
    first.child.stdin.end("commit;\n");
    await until(() => first.exited && second.exited);
    assert.equal(first.code, 0, first.error);
    if (editFirst) {
      assert.notEqual(second.code, 0);
      assert.match(second.error, /email_draft_conflict/);
      assert.equal(sql(`select status||':'||(select count(*) from public.admin_email_recipients where email_id='${email}') from public.admin_emails where id='${email}';`).trim(), "draft:0");
    } else {
      assert.equal(second.code, 0, second.error);
      assert.match(first.output, /false/);
      assert.match(second.output, /true/);
      assert.equal(sql(`select status||':'||(select count(*) from public.admin_email_recipients where email_id='${email}') from public.admin_emails where id='${email}';`).trim(), "queued:1");
    }
  } finally {
    for (const item of [first, second]) if (!item.exited && !item.child.stdin.writableEnded) item.child.stdin.end("rollback;\n");
    await until(() => first.exited && second.exited).catch(() => {
      first.child.kill("SIGTERM"); second.child.kill("SIGTERM");
    });
    cleanup(data);
  }
}

test("concurrent queue requests commit only one recipient snapshot", () => race(false));
test("an edit committed while queueing waits causes a version conflict", () => race(true));

test("the service-only queue RPC works through the local REST API", async () => {
  const config = JSON.parse(execFileSync("npx", ["supabase", "status", "-o", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
  assert.ok(["127.0.0.1", "localhost"].includes(new URL(config.API_URL).hostname));
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const service = createClient(config.API_URL, config.SERVICE_ROLE_KEY, options);
  const anon = createClient(config.API_URL, config.ANON_KEY, options);
  const data = fixture();
  const args = { p_email_id: data.email, p_actor_id: data.actor, p_expected_version: 1,
    p_competition_id: Number(data.competition), p_subject: "Queue race", p_body_html: "<p>News</p>", p_recipient_groups: ["all"],
    p_recipients: [{ user_id: data.recipient, recipient_email: `${data.recipient}@example.org`, first_name: "Garden", campaign_id: null, campaign_url: null }] };
  try {
    assert.ok((await anon.rpc("queue_admin_email", args)).error, "Anonymous REST callers cannot bypass validation");
    const first = await service.rpc("queue_admin_email", args);
    assert.equal(first.error, null);
    assert.deepEqual(first.data, { email_id: data.email, status: "queued", recipient_count: 1, already_queued: false });
    const replay = await service.rpc("queue_admin_email", args);
    assert.equal(replay.error, null);
    assert.equal(replay.data.already_queued, true);
    const snapshot = await service.from("admin_email_recipients").select("recipient_email, first_name, user_id, status").eq("email_id", data.email);
    assert.equal(snapshot.error, null);
    assert.deepEqual(snapshot.data, [{ recipient_email: `${data.recipient}@example.org`, first_name: "Garden", user_id: data.recipient, status: "pending" }]);
  } finally { cleanup(data); }
});
