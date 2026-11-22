// Applies supabase/migrations/*.sql in order, once each, inside a transaction.
// Usage: node scripts/cms/migrate.mjs            (apply pending)
//        node scripts/cms/migrate.mjs --status   (list only)
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { need } from "./env.mjs";

need("SUPABASE_DB_URL");
const dir = fileURLToPath(new URL("../../supabase/migrations/", import.meta.url));
const files = readdirSync(dir).filter((f) => /^\d+_.+\.sql$/.test(f)).sort();
const sql = postgres(process.env.SUPABASE_DB_URL, { ssl: "require", max: 1, onnotice: () => {} });

try {
  await sql`create schema if not exists cms_private`;
  await sql`create table if not exists cms_private.migrations (name text primary key, applied_at timestamptz not null default now())`;
  const done = new Set((await sql`select name from cms_private.migrations`).map((r) => r.name));
  for (const f of files) {
    if (done.has(f)) {
      console.log(`✓ ${f} (already applied)`);
      continue;
    }
    if (process.argv.includes("--status")) {
      console.log(`… ${f} (pending)`);
      continue;
    }
    await sql.begin(async (tx) => {
      await tx.unsafe(readFileSync(dir + f, "utf8"));
      await tx`insert into cms_private.migrations (name) values (${f})`;
    });
    console.log(`✓ ${f} applied`);
  }
} catch (e) {
  console.error(`Migration failed: ${e.message}`);
  process.exitCode = 1;
} finally {
  await sql.end();
}
