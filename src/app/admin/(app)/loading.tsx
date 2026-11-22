import { adminLang } from "@/admin/lang";

/** Shown at once on every dashboard navigation while the page is prepared. */
export default async function Loading() {
  const { t } = await adminLang();
  return (
    <div aria-busy="true" aria-live="polite" className="loading-page">
      <span className="spinner" aria-hidden="true" />
      {t.common.loading}
    </div>
  );
}
