import { signOut } from "@/admin/actions";
import { adminLang } from "@/admin/lang";
import { AuthFrame } from "../AuthFrame";

export default async function NoAccess() {
  const { t } = await adminLang();
  return (
    <AuthFrame title={t.auth.noAccess}>
      <form action={signOut}>
        <button className="btn secondary">{t.nav.signOut}</button>
      </form>
    </AuthFrame>
  );
}
