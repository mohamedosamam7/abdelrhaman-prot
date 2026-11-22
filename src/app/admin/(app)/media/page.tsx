import { loadDrafts, loadMedia, usageMap } from "@/admin/data";
import { adminLang } from "@/admin/lang";
import { MediaLibrary } from "@/admin/ui/MediaLibrary";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import { requireAdmin } from "@/lib/supabase/admin-auth";

export default async function MediaPage() {
  const { supabase } = await requireAdmin();
  const { t } = await adminLang();
  const [d, media] = await Promise.all([loadDrafts(supabase), loadMedia(supabase)]);
  return <MediaLibrary t={t} media={media} usage={usageMap(d, media)} supabaseUrl={supabaseUrl} publishableKey={supabasePublishableKey} />;
}
