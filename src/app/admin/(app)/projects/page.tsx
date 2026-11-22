import { loadDrafts, loadMedia, pickerItems } from "@/admin/data";
import { adminLang } from "@/admin/lang";
import { ProjectList } from "@/admin/ui/ProjectList";
import { requireAdmin } from "@/lib/supabase/admin-auth";

export default async function ProjectsPage() {
  const { supabase } = await requireAdmin();
  const { lang, t } = await adminLang();
  const [d, media] = await Promise.all([loadDrafts(supabase), loadMedia(supabase)]);
  const items = pickerItems(media);
  const rows = d.projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    status: p.status,
    featured: p.featured,
    title: p.draft.title[lang] || p.draft.title.en || p.slug,
    count: p.draft.media.length,
    cover: items.find((i) => i.ref === p.draft.cover),
    neverPublished: p.published === null,
  }));
  return <ProjectList t={t} rows={rows} />;
}
