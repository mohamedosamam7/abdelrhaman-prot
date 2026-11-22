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
  return { ...draft, meta: draft.meta ?? fallback.meta, ...(fallback.intro ? { intro: draft.intro ?? fallback.intro } : {}) };
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
