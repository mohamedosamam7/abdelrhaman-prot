import type { Metadata, Viewport } from "next";
import { Amiri, IBM_Plex_Sans_Arabic, Inter_Tight, Instrument_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RevealObserver } from "@/components/RevealObserver";
import { SmoothScroll } from "@/components/SmoothScroll";
import { site } from "@/content/site";
import { dirOf, getDictionary, isLocale, locales, tr, type Locale } from "@/i18n";
import { alternates } from "@/lib/metadata";
import "../globals.css";

const grotesk = Inter_Tight({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-grotesk", display: "swap" });
const editorial = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-editorial", display: "swap" });
// Arabic: a clean sans for text and UI, a classical naskh for the editorial headings.
const arabicSans = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500"], variable: "--font-arabic-sans", display: "swap", preload: false });
const arabicSerif = Amiri({ subsets: ["arabic"], weight: "400", variable: "--font-arabic-serif", display: "swap", preload: false });

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const description = tr(lang, site.description);
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: t.meta.homeTitle, template: t.meta.template },
    description,
    alternates: alternates(lang, "/"),
    openGraph: {
      title: t.meta.homeTitle,
      description,
      siteName: t.meta.siteName,
      locale: lang === "ar" ? "ar_SA" : "en_US",
      alternateLocale: lang === "ar" ? "en_US" : "ar_SA",
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#3b0d14",
  colorScheme: "dark light",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const t = getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      data-scroll-behavior="smooth"
      className={`${grotesk.variable} ${editorial.variable} ${arabicSans.variable} ${arabicSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Before first paint: allow the hero intro only for visitors who haven't
            asked for reduced motion. Without this class (no JS, reduced motion)
            the hero renders its finished composition. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion-ok')}catch(e){}",
          }}
        />
      </head>
      <body id="top">
        <a href="#main" className="skip-link">
          {t.skip}
        </a>
        <Header lang={locale} />
        <main id="main">{children}</main>
        <Footer lang={locale} />
        <div className="site-frame" aria-hidden="true" />
        <RevealObserver />
        <SmoothScroll />
      </body>
    </html>
  );
}
