import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { test } from "node:test";

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
