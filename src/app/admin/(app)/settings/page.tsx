import { loadDrafts, loadMedia, pickerItems } from "@/admin/data";
import { adminLang } from "@/admin/lang";
import { SettingsEditor } from "@/admin/ui/SettingsEditor";
import { staticSettings } from "@/cms/static";
import { requireAdmin } from "@/lib/supabase/admin-auth";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { t } = await adminLang();
  const [d, media] = await Promise.all([loadDrafts(supabase), loadMedia(supabase)]);
  const fallback = staticSettings();
  // Drafts saved before category names were editable get the built-in names.
  const initial = d.settings ? { ...d.settings.draft, categories: d.settings.draft.categories ?? fallback.categories } : fallback;
  return <SettingsEditor t={t} initial={initial} items={pickerItems(media)} />;
}
