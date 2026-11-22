// Verifies the Supabase configuration in .env.local without printing secrets.
import { createClient } from "@supabase/supabase-js";
import "./env.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const pub = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const row = (ok, label, info = "") => console.log(`${ok ? "OK  " : "MISSING/FAIL"}  ${label}${info ? ` — ${info}` : ""}`);

row(/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url), "NEXT_PUBLIC_SUPABASE_URL format");
row(pub.length > 20, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY present", pub.startsWith("sb_publishable_") ? "publishable key" : pub ? "legacy anon key?" : "");
row(secret.length > 20, "SUPABASE_SECRET_KEY present", secret.startsWith("sb_secret_") ? "secret key" : secret ? "legacy service_role key?" : "");
row(!!process.env.SUPABASE_DB_URL, "SUPABASE_DB_URL present");
if (pub && url) {
  const anon = createClient(url, pub, { auth: { persistSession: false } });
  const { error } = await anon.rpc("published_content");
  row(!error, "Public read (published_content)", error ? error.message : "schema installed");
  const { data, error: denied } = await anon.from("site_settings").select("id").limit(1);
  row(!!denied || (data?.length ?? 0) === 0, "Anonymous visitors cannot read drafts", denied ? `blocked (${denied.code})` : `rows visible: ${data?.length ?? 0}`);
}
