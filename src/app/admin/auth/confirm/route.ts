import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { sessionClient } from "@/lib/supabase/server";

/**
 * Landing point for links in Supabase emails (password recovery, invites).
 * Exchanges the one-time code for a session, then continues to `next`,
 * which may only be a dashboard path.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const nextParam = url.searchParams.get("next") ?? "/admin";
  const next = /^\/admin(\/[a-z-]*)*$/.test(nextParam) ? nextParam : "/admin";
  const supabase = await sessionClient();

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  else if (tokenHash && type) ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;

  return NextResponse.redirect(new URL(ok ? next : "/admin/login?expired=1", url.origin));
}
