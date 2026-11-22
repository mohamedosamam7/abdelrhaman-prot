import type { Metadata, Viewport } from "next";
import { Amiri, IBM_Plex_Sans_Arabic, Inter_Tight, Instrument_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RevealObserver } from "@/components/RevealObserver";
import { SmoothScroll } from "@/components/SmoothScroll";
import { PreviewBanner } from "@/components/PreviewBanner";
import { getContent } from "@/cms/load";
import { dirOf, getDictionary, isLocale, locales, siteUrl, tr, type Locale } from "@/i18n";
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
  const { settings, shareImage } = await getContent();
  const title = tr(lang, settings.seo.homeTitle) || t.meta.homeTitle;
  const description = tr(lang, settings.seo.homeDescription) || tr(lang, settings.description);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s — ${tr(lang, settings.fullName)}` },
    description,
    alternates: alternates(lang, "/"),
    openGraph: {
      title,
      description,
      ...(shareImage && !shareImage.videoSrc ? { images: [{ url: shareImage.src, width: shareImage.width, height: shareImage.height }] } : {}),
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
  const content = await getContent();

  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      data-scroll-behavior="smooth"
      data-gradient={content.settings.theme.gradient}
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
        {content.source === "draft" && <PreviewBanner lang={locale} />}
        <Header lang={locale} settings={content.settings} />
        <main id="main">{children}</main>
        <Footer lang={locale} settings={content.settings} />
        <div className="site-frame" aria-hidden="true" />
        <RevealObserver />
        <SmoothScroll />
      </body>
    </html>
  );
}
