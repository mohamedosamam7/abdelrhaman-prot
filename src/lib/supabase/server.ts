import "server-only";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * The signed-in user's client (dashboard, server actions, draft preview).
 * Row-level security applies with the user's own rights, so an account that
 * is not in `admins` can read and change nothing beyond published content.
 */
export async function sessionClient() {
  const store = await cookies();
  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a Server Component: the proxy refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Anonymous, cookie-free client for reading published content on public
 * pages (safe inside cached functions; RLS limits it to published rows).
 */
export function publicClient() {
  return createPlainClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}
