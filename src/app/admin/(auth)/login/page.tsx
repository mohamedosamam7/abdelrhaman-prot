import { redirect } from "next/navigation";
import { adminLang } from "@/admin/lang";
import { LoginForm } from "@/admin/ui/AuthForms";
import { supabaseConfigured } from "@/lib/supabase/env";
import { AuthFrame } from "../AuthFrame";

export default async function Login({ searchParams }: PageProps<"/admin/login">) {
  if (!supabaseConfigured) redirect("/admin/setup");
  const { t } = await adminLang();
  const expired = (await searchParams).expired === "1";
  return (
    <AuthFrame title={t.auth.signIn}>
      <LoginForm t={t} expired={expired} />
    </AuthFrame>
  );
}
