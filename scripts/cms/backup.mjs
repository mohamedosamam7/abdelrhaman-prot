// Read-only backup of the dashboard content: every CMS table as JSON, plus a
// copy of every uploaded file (published and draft buckets). Nothing in the
// database or storage is changed. Output: backups/<timestamp>/ (not in Git).
// Usage: npm run cms:backup
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { need } from "./env.mjs";

need("SUPABASE_DB_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY");
const root = fileURLToPath(new URL("../../backups/", import.meta.url));
const dir = join(root, new Date().toISOString().replace(/[:.]/g, "-"));
mkdirSync(dir, { recursive: true });

const sql = postgres(process.env.SUPABASE_DB_URL, { ssl: "require", max: 1, onnotice: () => {} });
const tables = ["site_settings", "pages", "projects", "media", "revisions", "admins"];
const summary = { takenAt: new Date().toISOString(), tables: {}, files: {} };
try {
  for (const t of tables) {
    const rows = await sql`select * from ${sql("public." + t)}`.catch(() => sql.unsafe(`select * from public.${t}`));
    writeFileSync(join(dir, `${t}.json`), JSON.stringify(rows, null, 1));
    summary.tables[t] = rows.length;
  }
  const objects = await sql`select bucket_id, name from storage.objects where bucket_id in ('media', 'media-draft') order by bucket_id, name`;
  const storage = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } }).storage;
  let failed = 0;
  for (const o of objects) {
    const { data, error } = await storage.from(o.bucket_id).download(o.name);
    if (error || !data) {
      failed++;
      console.error(`could not download ${o.bucket_id}/${o.name}: ${error?.message ?? "no data"}`);
      continue;
    }
    const out = join(dir, "files", o.bucket_id, o.name);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, Buffer.from(await data.arrayBuffer()));
    summary.files[o.bucket_id] = (summary.files[o.bucket_id] ?? 0) + 1;
  }
  summary.failedFiles = failed;
  writeFileSync(join(dir, "summary.json"), JSON.stringify(summary, null, 1));
  console.log(`Backup saved to ${dir}`);
  console.log(`rows: ${tables.map((t) => `${t} ${summary.tables[t]}`).join(", ")} | files: ${objects.length - failed}/${objects.length}`);
  if (failed) process.exitCode = 1;
} finally {
  await sql.end();
}
