import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";

const container = "supabase_db_seedmoney";
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function session(name) {
  const child = spawn("docker", [
    "exec", "-i", container, "psql", "-X", "-U", "postgres", "-d", "postgres",
    "-v", "ON_ERROR_STOP=1", "-At",
  ]);
  const state = { child, output: "", error: "", exited: false };
  child.stdout.on("data", (data) => { state.output += data; });
  child.stderr.on("data", (data) => { state.error += data; });
  child.on("exit", () => { state.exited = true; });
  child.stdin.on("error", (error) => {
    if (error.code !== "EPIPE") state.error += error.message;
  });
  child.stdin.write(`set application_name='${name}'; begin; set local lock_timeout='5s';\n`);
  return state;
}

async function waitUntil(condition, message) {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (condition()) return;
    await pause(30);
  }
  throw new Error(message);
}

test("rebuilding and cascading campaign deletion do not deadlock", async () => {
  const writer = session(`standings_delete_${process.pid}`);
  const rebuildName = `standings_rebuild_${process.pid}`;
  const rebuild = session(rebuildName);
  try {
    writer.child.stdin.write("lock table public.campaigns in row exclusive mode;\n\\echo WRITER_READY\n");
    await waitUntil(() => writer.output.includes("WRITER_READY"), "Writer did not acquire its campaign lock");
    rebuild.child.stdin.write("select public.rebuild_competition_standings();\n\\echo REBUILD_FINISHED\n");

    await waitUntil(() => {
      const result = spawnSync("docker", [
        "exec", container, "psql", "-X", "-U", "postgres", "-d", "postgres", "-Atc",
        `select exists(select 1 from pg_locks l join pg_stat_activity a on a.pid=l.pid where a.application_name='${rebuildName}' and l.relation='public.campaigns'::regclass and not l.granted)`,
      ], { encoding: "utf8" });
      return result.status === 0 && result.stdout.trim() === "t";
    }, "Rebuild did not reach its campaign lock");

    writer.child.stdin.write("lock table public.transactions in row exclusive mode;\n\\echo WRITER_FINISHED\n");
    await waitUntil(() => writer.output.includes("WRITER_FINISHED"), "Cascading writer could not finish");
    writer.child.stdin.end("rollback;\n");
    await waitUntil(() => rebuild.output.includes("REBUILD_FINISHED") || rebuild.exited, "Rebuild could not finish");
    assert.equal(writer.error, "");
    assert.equal(rebuild.error, "");
    assert.ok(rebuild.output.includes("REBUILD_FINISHED"));
  } finally {
    for (const item of [writer, rebuild]) {
      if (!item.exited && !item.child.stdin.writableEnded) item.child.stdin.end("rollback;\n");
    }
    await waitUntil(() => writer.exited && rebuild.exited, "Test sessions did not close").catch(() => {
      writer.child.kill("SIGTERM");
      rebuild.child.kill("SIGTERM");
    });
  }
});

test("eligibility edits serialize with concurrent donation notifications", async () => {
  const config = JSON.parse(execFileSync("npx", ["supabase", "status", "-o", "json"], {
    encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
  }));
  assert.ok(["127.0.0.1", "localhost"].includes(new URL(config.API_URL).hostname));
  const client = createClient(config.API_URL, config.SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const id = -Date.now();
  const nextCompetition = id - 1;
  function sql(query) {
    const result = spawnSync("docker", [
      "exec", "-i", container, "psql", "-X", "-U", "postgres", "-d", "postgres",
      "-v", "ON_ERROR_STOP=1", "-q",
    ], { input: query, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  }
  let created = false;
  try {
    sql(`begin;
      insert into public.competition_metadata(competition_id,start_date,end_date) overriding system value
      values(${id},'2026-11-15','2026-12-15'),(${nextCompetition},'2026-11-15','2026-12-16');
      insert into public.campaigns(campaign_id,competition_id,status) overriding system value
      values(${id},${id},'published'); commit;`);
    created = true;
    const donation = (index) => client.from("transactions").insert({
      campaign_id: id, givebutter_id: `eligibility-${id}-${index}`,
      amount_donated: 1.25, status: "succeeded",
      transacted_at: "2026-12-15T17:30:00Z",
    });
    const firstBatch = await Promise.all([
      ...Array.from({ length: 40 }, (_, index) => donation(index)),
      client.from("competition_metadata").update({ end_date: "2026-12-16" }).eq("competition_id", id),
    ]);
    for (const result of firstBatch) assert.equal(result.error, null);
    const firstStanding = await client.from("competition_standings").select("raised, donation_count")
      .eq("campaign_id", id).eq("competition_id", id).single();
    assert.equal(firstStanding.error, null);
    assert.equal(Number(firstStanding.data.raised), 50);
    assert.equal(Number(firstStanding.data.donation_count), 40);

    const secondBatch = await Promise.all([
      ...Array.from({ length: 40 }, (_, index) => donation(index + 40)),
      client.from("campaigns").update({ competition_id: nextCompetition }).eq("campaign_id", id),
    ]);
    for (const result of secondBatch) assert.equal(result.error, null);
    const secondStanding = await client.from("competition_standings").select("competition_id, raised, donation_count")
      .eq("campaign_id", id).single();
    assert.equal(secondStanding.error, null);
    assert.equal(Number(secondStanding.data.competition_id), nextCompetition);
    assert.equal(Number(secondStanding.data.raised), 100);
    assert.equal(Number(secondStanding.data.donation_count), 80);
  } finally {
    if (created) sql(`begin; delete from public.campaigns where campaign_id=${id};
      delete from public.competition_metadata where competition_id in (${id},${nextCompetition}); commit;`);
  }
});
