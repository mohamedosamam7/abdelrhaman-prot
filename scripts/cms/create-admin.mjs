// Makes one person an administrator: sends them a Supabase invitation (they
// choose their own password from the email) or, if the account already exists,
// grants it admin rights. Uses the secret key on this machine only.
// Usage: node scripts/cms/create-admin.mjs someone@example.com https://site-or-preview-origin
import { createClient } from "@supabase/supabase-js";
import { need } from "./env.mjs";

const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!secret) need("SUPABASE_SECRET_KEY");
need("NEXT_PUBLIC_SUPABASE_URL");
const [email, origin = "http://localhost:3000"] = process.argv.slice(2);
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email ?? "")) {
  console.error("Usage: node scripts/cms/create-admin.mjs <email> [site origin for the invite link]");
  process.exit(1);
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, secret, { auth: { persistSession: false } });

let userId;
const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
const existing = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (existing) {
  userId = existing.id;
  console.log("Account exists — granting admin rights.");
} else {
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: `${origin}/admin/auth/confirm?next=/admin/reset` });
  if (error) {
    console.error(`Invite failed: ${error.message}`);
    process.exit(1);
  }
  userId = data.user.id;
  console.log("Invitation sent — the link lets them set their own password.");
}
const { error } = await admin.from("admins").upsert({ user_id: userId });
if (error) {
  console.error(`Could not grant admin rights: ${error.message}`);
  process.exit(1);
}
console.log("Done. This account is an administrator.");
