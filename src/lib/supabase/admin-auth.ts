import "server-only";
import { redirect } from "next/navigation";
import { supabaseConfigured } from "./env";
import { sessionClient } from "./server";

export type AdminContext = { userId: string; email: string; supabase: Awaited<ReturnType<typeof sessionClient>> };

/**
 * Server-side admin check used by every dashboard page and server action.
 * The session is verified with Supabase (getUser, not just the cookie), and
 * admin rights come from the `admins` table — which users cannot write to.
 * Returns null when the visitor is not a signed-in administrator.
 */
export async function getAdmin(): Promise<AdminContext | null> {
  if (!supabaseConfigured) return null;
  const supabase = await sessionClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");
  if (rpcError || isAdmin !== true) return null;
  return { userId: data.user.id, email: data.user.email ?? "", supabase };
}

/** For pages: redirect to sign-in (or the no-access screen) unless admin. */
export async function requireAdmin(): Promise<AdminContext> {
  const admin = await getAdmin();
  if (admin) return admin;
  if (!supabaseConfigured) redirect("/admin/setup");
  const supabase = await sessionClient();
  const { data } = await supabase.auth.getUser();
  redirect(data.user ? "/admin/no-access" : "/admin/login");
}
