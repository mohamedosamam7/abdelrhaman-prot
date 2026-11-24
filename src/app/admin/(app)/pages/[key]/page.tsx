import { notFound } from "next/navigation";
import { loadDrafts, loadMedia, pickerItems } from "@/admin/data";
import { adminLang } from "@/admin/lang";
import { PageEditor } from "@/admin/ui/PageEditor";
import { pageKeys, type PageDoc, type PageKey } from "@/cms/schema";
import { staticPages } from "@/cms/static";
import { requireAdmin } from "@/lib/supabase/admin-auth";

/** Fills page text added after a draft was saved (meta, Work intro) with the built-in text. */
function withDefaults(draft: PageDoc | undefined, fallback: PageDoc): PageDoc {
  if (!draft) return fallback;
  const fallbackHero = fallback.sections.find((s) => s.type === "hero");
  // Hero drafts saved before the hero grew get the new slots (built-in photos), in order.
  const sections = draft.sections.map((s) => {
    if (s.type !== "hero" || fallbackHero?.type !== "hero") return s;
    const have = new Map(s.data.slots.map((x) => [x.id, x]));
    return { ...s, data: { ...s.data, slots: fallbackHero.data.slots.map((d) => have.get(d.id) ?? d) } };
  });
  return { ...draft, sections, meta: draft.meta ?? fallback.meta, ...(fallback.intro ? { intro: draft.intro ?? fallback.intro } : {}) };
}

export default async function PagePage({ params }: PageProps<"/admin/pages/[key]">) {
  const { key } = await params;
  if (!pageKeys.includes(key as PageKey)) notFound();
  const { supabase } = await requireAdmin();
  const { lang, t } = await adminLang();
  const [d, media] = await Promise.all([loadDrafts(supabase), loadMedia(supabase)]);
  const row = d.pages.find((p) => p.key === key);
  const projects = d.projects.filter((p) => p.status !== "archived").map((p) => ({ slug: p.slug, title: p.draft.title[lang] || p.draft.title.en }));
  return (
    <PageEditor
      key={key}
      t={t}
      lang={lang}
      pageKey={key as PageKey}
      initial={withDefaults(row?.draft, staticPages()[key as PageKey])}
      items={pickerItems(media)}
      projects={projects}
    />
  );
}
