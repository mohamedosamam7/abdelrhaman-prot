import { adminLang } from "@/admin/lang";
import { History } from "@/admin/ui/History";
import { requireAdmin } from "@/lib/supabase/admin-auth";

export default async function HistoryPage() {
  const { supabase } = await requireAdmin();
  const { lang, t } = await adminLang();
  const { data } = await supabase.from("revisions").select("id, entity, entity_key, note, created_at").order("created_at", { ascending: false }).limit(50);
  return <History t={t} lang={lang} rows={data ?? []} />;
}
