import { adminLang } from "@/admin/lang";
import { ForgotForm } from "@/admin/ui/AuthForms";
import { AuthFrame } from "../AuthFrame";

export default async function Forgot() {
  const { t } = await adminLang();
  return (
    <AuthFrame title={t.auth.forgot}>
      <ForgotForm t={t} />
    </AuthFrame>
  );
}
