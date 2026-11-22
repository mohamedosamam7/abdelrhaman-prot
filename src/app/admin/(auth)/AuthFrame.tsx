import { adminLang } from "@/admin/lang";
import { LangSwitch } from "@/admin/ui/LangSwitch";

export async function AuthFrame({ title, children }: { title: string; children: React.ReactNode }) {
  const { lang, t } = await adminLang();
  return (
    <main className="auth">
      <div className="lang-switch">
        <LangSwitch to={lang === "ar" ? "en" : "ar"} label={t.switchLang} />
      </div>
      <section className="card" aria-labelledby="auth-title">
        <p className="hint">E STUDIO</p>
        <h1 id="auth-title">{title}</h1>
        {children}
      </section>
    </main>
  );
}
