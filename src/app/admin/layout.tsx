import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Inter_Tight } from "next/font/google";
import { adminLang } from "@/admin/lang";
import "./admin.css";

const ui = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ui", display: "swap" });
const uiAr = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600"], variable: "--font-ui-ar", display: "swap" });

export const metadata: Metadata = {
  title: "E STUDIO — Dashboard",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#3b0d14" };

/** The dashboard is its own app: separate root layout, never cached, never indexed. */
export const dynamic = "force-dynamic";

export default async function AdminRoot({ children }: { children: React.ReactNode }) {
  const { lang, t } = await adminLang();
  return (
    <html lang={lang} dir={t.dir} className={`${ui.variable} ${uiAr.variable}`}>
      <body>{children}</body>
    </html>
  );
}
