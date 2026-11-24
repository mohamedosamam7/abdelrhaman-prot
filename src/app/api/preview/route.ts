import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { localRedirect } from "@/lib/redirect";
import { getAdmin } from "@/lib/supabase/admin-auth";

/**
 * Starts a draft preview for a signed-in administrator, then opens the page.
 * Anyone else gets 401 and Draft Mode stays off — and even with the cookie,
 * draft content is only loaded after the admin check in cms/load.ts.
 */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") ?? "/en";
  // Only the site's own localized pages — never an external redirect.
  if (!/^\/(en|ar)(\/[a-z0-9/-]*)?(\?[a-z=&-]*)?$/.test(path)) return new NextResponse("Invalid path", { status: 400 });
  if (!(await getAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  (await draftMode()).enable();
  return localRedirect(path);
}
