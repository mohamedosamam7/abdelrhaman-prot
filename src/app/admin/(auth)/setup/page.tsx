import { adminLang } from "@/admin/lang";
import { AuthFrame } from "../AuthFrame";

export default async function Setup() {
  const { t } = await adminLang();
  return (
    <AuthFrame title={t.setup.title}>
      <p>{t.setup.body}</p>
    </AuthFrame>
  );
}
