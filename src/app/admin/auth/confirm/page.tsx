import { adminLang } from "@/admin/lang";
import { ConfirmLink } from "@/admin/ui/ConfirmLink";

/**
 * Landing page for links in Supabase emails (invitations, password recovery).
 * Supabase's default templates put the session in the URL fragment (#…),
 * which only the browser can read, so this step runs client-side.
 */
export default async function Confirm() {
  const { t } = await adminLang();
  return (
    <main className="auth">
      <section className="card" aria-live="polite">
        <p className="hint">E STUDIO</p>
        <ConfirmLink loading={t.common.loading} expired={t.auth.expired} back={t.auth.backToLogin} />
      </section>
    </main>
  );
}
