import { loadDrafts, loadMedia, pickerItems } from "@/admin/data";
import { adminLang } from "@/admin/lang";
import { SettingsEditor } from "@/admin/ui/SettingsEditor";
import { staticSettings } from "@/cms/static";
import { requireAdmin } from "@/lib/supabase/admin-auth";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { t } = await adminLang();
  const [d, media] = await Promise.all([loadDrafts(supabase), loadMedia(supabase)]);
  return <SettingsEditor t={t} initial={d.settings?.draft ?? staticSettings()} items={pickerItems(media)} />;
}
