import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/** Ends the draft preview (POST from the preview banner) and returns to the same page. */
export async function POST(req: NextRequest) {
  (await draftMode()).disable();
  const ref = req.headers.get("referer");
  const back = ref && new URL(ref).origin === req.nextUrl.origin ? new URL(ref).pathname : "/en";
  return NextResponse.redirect(new URL(/^\/(en|ar)/.test(back) ? back : "/en", req.nextUrl.origin), 303);
}
