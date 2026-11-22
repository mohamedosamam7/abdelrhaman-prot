import "server-only";
import { cookies } from "next/headers";
import { ADMIN_LANG_COOKIE, adminDict, type AdminLang } from "./i18n";

/** The dashboard's language (Arabic unless the administrator switched to English). */
export async function adminLang(): Promise<{ lang: AdminLang; t: (typeof adminDict)["ar"] }> {
  const lang: AdminLang = (await cookies()).get(ADMIN_LANG_COOKIE)?.value === "en" ? "en" : "ar";
  return { lang, t: adminDict[lang] };
}
