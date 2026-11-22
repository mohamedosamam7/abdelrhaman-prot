import { getDictionary, type Locale } from "@/i18n";

/** Shown only to an administrator in Draft Mode: these are unpublished drafts. */
export function PreviewBanner({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).preview;
  return (
    <div className="preview-banner" role="status">
      <span>{t.label}</span>
      <form action="/api/preview/exit" method="post">
        <button type="submit">{t.exit}</button>
      </form>
    </div>
  );
}
