import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getContent } from "@/cms/load";
import { ContactCTA } from "@/components/ContactCTA";
import { Sections } from "@/components/Sections";
import { ArrowRight } from "@/components/Icons";
import { getDictionary, isLocale, localeHref, tr } from "@/i18n";
import { pageMetadata } from "@/lib/metadata";
import { ServiceContext } from "./ServiceContext";
import styles from "./contact.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const meta = (await getContent()).pageText.contact.meta;
  return pageMetadata(lang, "/contact", (meta && tr(lang, meta.title)) || t.meta.contactTitle, (meta && tr(lang, meta.description)) || t.meta.contactDescription);
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const { pages, settings, projects } = await getContent();
  const services = Object.fromEntries(
    pages.home.flatMap((s) => (s.type === "services" ? s.data.items.map((i) => [i.key, tr(lang, i.title)]) : [])),
  );
  return (
    <>
    <div className={`theme-dark ${styles.page}`}>
      <ContactCTA
        lang={lang}
        settings={settings}
        as="h1"
        details
        context={
          <Suspense fallback={null}>
            <ServiceContext lang={lang} className={styles.service} services={services} />
          </Suspense>
        }
        footer={
          <nav className={styles.back} aria-label={t.contact.continue}>
            <Link href={localeHref(lang, "/work")} className={styles.backLink}>
              {t.contact.seeWork} <ArrowRight size={15} className="dir-icon" />
            </Link>
            <Link href={localeHref(lang, "/")} className={styles.backLink}>
              {t.contact.backHome} <ArrowRight size={15} className="dir-icon" />
            </Link>
          </nav>
        }
      />
    </div>
    <Sections lang={lang} sections={pages.contact} settings={settings} projects={projects} />
    </>
  );
}
