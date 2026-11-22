import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { supabaseConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";

/** Dashboard routes reachable without a session. */
const PUBLIC_ADMIN = ["/admin/login", "/admin/forgot", "/admin/auth", "/admin/setup", "/admin/no-access"];

/**
 * Public pages live under /en or /ar. Unprefixed URLs (old links such as
 * /work?category=events or /contact?service=food) redirect to the visitor's
 * language with the query string intact: a chosen language (NEXT_LOCALE
 * cookie, set by the switcher) wins, then the browser's Arabic preference,
 * then English.
 *
 * /admin and /api are not localized. For /admin the Supabase session cookie
 * is refreshed here; whether the user is an administrator is decided on the
 * server by every dashboard page and action (never by this proxy alone).
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const first = pathname.split("/")[1];
  if (first === "api") return NextResponse.next();
  if (first === "admin") return admin(req);
  if (isLocale(first)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${pickLocale(req)}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.redirect(url, 308);
}

async function admin(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  if (!supabaseConfigured) return res;

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) req.cookies.set(name, value);
        res = NextResponse.next({ request: req });
        for (const { name, value, options } of list) res.cookies.set(name, value, options);
      },
    },
  });
  // Validates the session with Supabase and refreshes an expiring token.
  const { data } = await supabase.auth.getUser();

  const open = PUBLIC_ADMIN.some((p) => req.nextUrl.pathname === p || req.nextUrl.pathname.startsWith(`${p}/`));
  if (!data.user && !open) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    for (const c of res.cookies.getAll()) redirect.cookies.set(c);
    return redirect;
  }
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

function pickLocale(req: NextRequest): Locale {
  const saved = req.cookies.get("NEXT_LOCALE")?.value;
  if (isLocale(saved)) return saved;
  const accept = req.headers.get("accept-language") ?? "";
  // First listed language decides; q-values are rarely reordered in practice.
  const preferred = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  return preferred.startsWith("ar") ? "ar" : defaultLocale;
}

export const config = {
  // Pages only: skip Next internals and any file with an extension.
  matcher: ["/((?!_next|.*\\..*).*)"],
};
