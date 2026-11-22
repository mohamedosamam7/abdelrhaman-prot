import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

/**
 * Every page lives under /en or /ar. Unprefixed URLs (old links such as
 * /work?category=events or /contact?service=food) redirect to the visitor's
 * language with the query string intact: a chosen language (NEXT_LOCALE
 * cookie, set by the switcher) wins, then the browser's Arabic preference,
 * then English.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${pickLocale(req)}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.redirect(url, 308);
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
  // Pages only: skip Next internals, API routes and any file with an extension.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
