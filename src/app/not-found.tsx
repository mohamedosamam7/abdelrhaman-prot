import Link from "next/link";
import { ArrowRight } from "@/components/Icons";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Page not found", "This page doesn’t exist. Browse the work or get in touch.");

const linkStyle = { display: "inline-flex", alignItems: "center", gap: 10, minHeight: 44, fontSize: 15, fontWeight: 500 } as const;

export default function NotFound() {
  return (
    <section
      className="theme-dark container"
      style={{ minHeight: "70svh", paddingTop: "calc(var(--header-h) + 32px)", paddingBottom: 48, display: "grid", alignContent: "center", gap: 20 }}
    >
      <p className="t-label">404 — Frame not found</p>
      <h1 className="t-display">
        Out of <em>frame.</em>
      </h1>
      <nav aria-label="Continue browsing" style={{ display: "flex", flexWrap: "wrap", gap: "4px 32px" }}>
        <Link href="/work" style={linkStyle}>
          See the work <ArrowRight size={15} />
        </Link>
        <Link href="/" style={linkStyle}>
          Back to home <ArrowRight size={15} />
        </Link>
      </nav>
    </section>
  );
}
