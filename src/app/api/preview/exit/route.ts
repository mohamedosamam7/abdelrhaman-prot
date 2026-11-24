import { draftMode } from "next/headers";
import type { NextRequest } from "next/server";
import { localRedirect } from "@/lib/redirect";

/** Ends the draft preview (POST from the preview banner) and returns to the same page. */
export async function POST(req: NextRequest) {
  (await draftMode()).disable();
  const ref = req.headers.get("referer");
  // Back to the page the banner was on — only when that page is on this same host.
  const back = ref && new URL(ref).host === req.headers.get("host") ? new URL(ref).pathname : "/en";
  return localRedirect(/^\/(en|ar)(\/[a-z0-9/-]*)?$/.test(back) ? back : "/en", 303);
}
