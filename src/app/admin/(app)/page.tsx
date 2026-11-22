import { loadDrafts, missingTranslations } from "@/admin/data";
import { adminLang } from "@/admin/lang";
import { Overview } from "@/admin/ui/Overview";
import { requireAdmin } from "@/lib/supabase/admin-auth";

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const { lang, t } = await adminLang();
  const d = await loadDrafts(supabase);
  const empty = !d.settings && d.pages.length === 0 && d.projects.length === 0;
  const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  const changes = [
    ...(d.settings && !same(d.settings.draft, d.settings.published) ? [t.nav.settings] : []),
    ...d.pages.filter((p) => !same(p.draft, p.published)).map((p) => `${t.nav.pages}: ${t.pages[p.key]}`),
    ...d.projects
      .filter((p) => (p.status === "published" ? !same({ ...p.draft, featured: p.featured, sort: p.sort }, p.published) : p.published !== null))
      .map((p) => `${t.nav.projects}: ${p.draft.title[lang] || p.draft.title.en || p.slug}`),
  ];
  const missing = [
    ...(d.settings ? missingTranslations(d.settings.draft).map((x) => `${t.nav.settings} · ${x}`) : []),
    ...d.pages.flatMap((p) => missingTranslations(p.draft).map((x) => `${t.pages[p.key]} · ${x}`)),
    ...d.projects.filter((p) => p.status !== "archived").flatMap((p) => missingTranslations(p.draft).map((x) => `${p.slug} · ${x}`)),
  ];
  return <Overview t={t} lang={lang} empty={empty} changes={changes} missing={missing} />;
}
