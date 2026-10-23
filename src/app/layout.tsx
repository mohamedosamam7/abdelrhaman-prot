import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RevealObserver } from "@/components/RevealObserver";
import { site, fullName } from "@/content/site";
import "./globals.css";

const grotesk = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-grotesk",
  display: "swap",
});

const editorial = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${fullName} — ${site.role}, ${site.location.city}`,
    template: `%s — ${fullName}`,
  },
  description: site.description,
  openGraph: {
    title: `${fullName} — ${site.role}`,
    description: site.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b0d14",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${grotesk.variable} ${editorial.variable}`} suppressHydrationWarning>
      <body id="top">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <RevealObserver />
      </body>
    </html>
  );
}
