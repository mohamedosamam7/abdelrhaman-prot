import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { site, fullName } from "@/content/site";
import styles from "./Footer.module.css";

export function Footer() {
  const { instagram, behance } = site.contact;
  const elsewhere = [
    { label: "Instagram", value: instagram.handle, href: instagram.url },
    ...(!behance.placeholder && behance.url ? [{ label: "Behance", value: behance.handle || "Portfolio", href: behance.url }] : []),
  ];

  return (
    <footer className={`theme-dark theme-deep ${styles.footer}`}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label={`${site.brand.name} — home`}>
          <Logo className={styles.logo} />
        </Link>

        <nav className={styles.col} aria-label="Footer">
          <p className="t-label">Pages</p>
          <ul>
            <li><Link className="link-line" href="/">Home</Link></li>
            <li><Link className="link-line" href="/work">Work</Link></li>
            <li><Link className="link-line" href={site.contact.page}>Contact</Link></li>
          </ul>
        </nav>

        <div className={styles.col}>
          <p className="t-label">Elsewhere</p>
          <ul>
            {elsewhere.map((s) => (
              <li key={s.label}>
                <a className="link-line" href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label} <span className="muted">— {s.value}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>
          © {new Date().getFullYear()} {fullName} · {site.location.city}, {site.location.country}
        </p>
        <a className="link-line" href="#top">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
