import type { Metadata } from "next";
import Link from "next/link";
import { lang as rootLang } from "next/root-params";
import { ArrowRight } from "@/components/Icons";
import { defaultLocale, getDictionary, isLocale, localeHref, type Locale } from "@/i18n";

async function currentLocale(): Promise<Locale> {
  const l = await rootLang().catch(() => undefined);
  return isLocale(l) ? l : defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await currentLocale());
  return { title: t.notFound.title, description: t.notFound.description };
}

const linkStyle = { display: "inline-flex", alignItems: "center", gap: 10, minHeight: 44, fontSize: 15, fontWeight: 500 } as const;

export default async function NotFound() {
  const lang = await currentLocale();
  const t = getDictionary(lang);
  return (
    <section
      className="theme-dark container"
      style={{ minHeight: "70svh", paddingTop: "calc(var(--top) + 32px)", paddingBottom: 48, display: "grid", alignContent: "center", gap: 20 }}
    >
      <p className="t-label">{t.notFound.label}</p>
      <h1 className="t-display">
        {t.notFound.lead} <em>{t.notFound.emphasis}</em>
      </h1>
      <nav aria-label={t.contact.continue} style={{ display: "flex", flexWrap: "wrap", gap: "4px 32px" }}>
        <Link href={localeHref(lang, "/work")} style={linkStyle}>
          {t.contact.seeWork} <ArrowRight size={15} />
        </Link>
        <Link href={localeHref(lang, "/")} style={linkStyle}>
          {t.contact.backHome} <ArrowRight size={15} />
        </Link>
      </nav>
    </section>
  );
}
