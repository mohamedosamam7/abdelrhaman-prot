import { redirect } from "next/navigation";
import { adminLang } from "@/admin/lang";
import { ResetForm } from "@/admin/ui/AuthForms";
import { sessionClient } from "@/lib/supabase/server";
import { AuthFrame } from "../AuthFrame";

/** Reached from the recovery email (via /admin/auth/confirm, which signs the user in). */
export default async function Reset() {
  const { t } = await adminLang();
  const { data } = await (await sessionClient()).auth.getUser();
  if (!data.user) redirect("/admin/login?expired=1");
  return (
    <AuthFrame title={t.auth.newPassword}>
      <ResetForm t={t} />
    </AuthFrame>
  );
}
