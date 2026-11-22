import { signOut } from "@/admin/actions";
import { adminLang } from "@/admin/lang";
import { LangSwitch } from "@/admin/ui/LangSwitch";
import { NavLink } from "@/admin/ui/NavLink";
import { requireAdmin } from "@/lib/supabase/admin-auth";

/** Every page in here is for administrators only (checked on the server, per request). */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const { lang, t } = await adminLang();
  return (
    <div className="shell">
      <nav className="side" aria-label={t.title}>
        <div className="brand">E STUDIO</div>
        <NavLink href="/admin">{t.nav.home}</NavLink>
        <NavLink href="/admin/settings">{t.nav.settings}</NavLink>
        <span className="hint" style={{ color: "#d9c9bc", padding: "8px 12px 0" }}>{t.nav.pages}</span>
        <NavLink href="/admin/pages/home" className="sub">{t.pages.home}</NavLink>
        <NavLink href="/admin/pages/work" className="sub">{t.pages.work}</NavLink>
        <NavLink href="/admin/pages/contact" className="sub">{t.pages.contact}</NavLink>
        <NavLink href="/admin/projects">{t.nav.projects}</NavLink>
        <NavLink href="/admin/media">{t.nav.media}</NavLink>
        <NavLink href="/admin/history">{t.nav.history}</NavLink>
        <span className="spacer" />
        <a href={`/${lang}`} target="_blank" rel="noopener noreferrer">{t.nav.viewSite} ↗</a>
        <LangSwitch to={lang === "ar" ? "en" : "ar"} label={t.switchLang} className="" />
        <form action={signOut}>
          <button type="submit">{t.nav.signOut}</button>
        </form>
      </nav>
      <main className="main" id="main">
        {children}
      </main>
    </div>
  );
}
