"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";

const safeNext = (v: string | null) => (v && /^\/admin(\/[a-z-]*)*$/.test(v) ? v : "/admin");

/**
 * Finishes an email sign-in link:
 *  • #access_token=…&refresh_token=… (Supabase default templates): the
 *    session is stored in cookies here, then the server takes over;
 *  • ?code=… or ?token_hash=… : handed to the server route that verifies it.
 * Tokens are removed from the address bar immediately and never logged.
 */
export function ConfirmLink({ loading, expired, back }: { loading: string; expired: string; back: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const next = safeNext(url.searchParams.get("next"));
    const hash = new URLSearchParams(url.hash.slice(1));
    // Don't leave tokens in history or the address bar.
    window.history.replaceState(null, "", url.pathname);

    if (hash.get("error") || hash.get("error_code")) return setFailed(true);

    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    if (access_token && refresh_token) {
      const supabase = createBrowserClient(supabaseUrl, supabasePublishableKey);
      supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
        if (error) setFailed(true);
        else window.location.replace(next);
      });
      return;
    }

    if (url.searchParams.get("code") || url.searchParams.get("token_hash")) {
      window.location.replace(`/admin/auth/exchange${url.search}`);
      return;
    }
    setFailed(true);
  }, []);

  return failed ? (
    <>
      <p className="status err" role="alert">{expired}</p>
      <a href="/admin/login">{back}</a>
    </>
  ) : (
    <p>{loading}</p>
  );
}
