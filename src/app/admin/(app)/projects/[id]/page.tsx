import { notFound } from "next/navigation";
import { loadMedia, pickerItems, type ProjectRow } from "@/admin/data";
import { adminLang } from "@/admin/lang";
import { ProjectEditor } from "@/admin/ui/ProjectEditor";
import { requireAdmin } from "@/lib/supabase/admin-auth";

export default async function ProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { lang, t } = await adminLang();
  const [{ data }, media] = await Promise.all([
    supabase.from("projects").select("id, slug, status, featured, sort, draft, published, updated_at, published_at").eq("id", id).maybeSingle(),
    loadMedia(supabase),
  ]);
  if (!data) notFound();
  return <ProjectEditor t={t} lang={lang} row={data as ProjectRow} items={pickerItems(media)} />;
}
