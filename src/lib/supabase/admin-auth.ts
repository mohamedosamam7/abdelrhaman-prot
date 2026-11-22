import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { supabaseConfigured } from "./env";
import { sessionClient } from "./server";

export type AdminContext = { userId: string; email: string; supabase: Awaited<ReturnType<typeof sessionClient>> };

type Session = { supabase: Awaited<ReturnType<typeof sessionClient>>; userId: string | null; email: string };

/**
 * The request's verified session, computed once per request (React cache:
 * the dashboard layout and page share it).
 *
 * getClaims() verifies the access token's signature (this project signs with
 * asymmetric ES256 keys, so no network round trip is needed once the public
 * keys are cached) and its expiry, refreshing an expired token if needed.
 */
const session = cache(async (): Promise<Session> => {
  const supabase = await sessionClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = error ? null : data?.claims;
  return { supabase, userId: typeof claims?.sub === "string" ? claims.sub : null, email: typeof claims?.email === "string" ? claims.email : "" };
});

/**
 * Server-side admin check used by every dashboard page and server action.
 * Admin rights come from the `admins` table (which users cannot write to),
 * checked in the database with the user's own token — PostgREST verifies
 * that token again. Returns null unless the visitor is a signed-in admin.
 */
export const getAdmin = cache(async (): Promise<AdminContext | null> => {
  if (!supabaseConfigured) return null;
  const s = await session();
  if (!s.userId) return null;
  const { data: isAdmin, error } = await s.supabase.rpc("is_admin");
  if (error || isAdmin !== true) return null;
  return { userId: s.userId, email: s.email, supabase: s.supabase };
});

/** For pages: redirect to sign-in (or the no-access screen) unless admin. */
export async function requireAdmin(): Promise<AdminContext> {
  const admin = await getAdmin();
  if (admin) return admin;
  if (!supabaseConfigured) redirect("/admin/setup");
  redirect((await session()).userId ? "/admin/no-access" : "/admin/login");
}
