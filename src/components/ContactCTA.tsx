import type { ReactNode } from "react";
import { ArrowUpRight, BehanceIcon, InstagramIcon } from "@/components/Icons";
import { site } from "@/content/site";
import { emailHref, whatsappHref } from "@/lib/contact";
import styles from "./ContactCTA.module.css";

interface Props {
  /** h1 on the Contact page, h2 where it closes another page. */
  as?: "h1" | "h2";
  /** Contact page only: confirmed email / WhatsApp and location beneath the buttons. */
  details?: boolean;
  /** Optional line under the sub-heading (e.g. the service being enquired about). */
  context?: ReactNode;
  /** Optional content after the buttons (e.g. links back into the site). */
  footer?: ReactNode;
}

/**
 * "Have a project in mind?" — Instagram is the primary call to action,
 * Behance secondary. Every URL comes from site.contact. Content is never
 * hidden behind a reveal animation: this is the page's main action.
 */
export function ContactCTA({ as: Heading = "h2", details = false, context, footer }: Props) {
  const c = site.contact;
  const behance = !c.behance.placeholder && c.behance.url ? c.behance : null;
  const channels = [
    emailHref && { label: "Email", value: c.email.value, href: emailHref },
    whatsappHref && { label: "WhatsApp", value: c.whatsapp.display || c.whatsapp.value, href: whatsappHref },
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  return (
    <section className={`theme-dark ${styles.contact}`} id="contact" aria-labelledby="contact-heading">
      <div className="container">
        <div className={styles.top}>
          <p className="t-label">Contact</p>
          <p className={`t-label ${styles.topRight}`}>Instagram · Behance</p>
        </div>

        <Heading id="contact-heading" className={`t-serif ${styles.heading}`}>
          {c.heading.lead} <em className={styles.em}>{c.heading.emphasis}</em>
        </Heading>

        <div className={styles.grid}>
          <div className={styles.intro}>
            <p className={`t-serif ${styles.sub}`}>{c.subheading}</p>
            {context}
            <p className="muted">{c.body}</p>
          </div>

          <div className={styles.buttons}>
            <a className={`${styles.button} ${styles.primary}`} href={c.instagram.url} target="_blank" rel="noopener noreferrer">
              <InstagramIcon className={styles.icon} />
              <span className={styles.text}>
                <span className={styles.title}>Message on Instagram</span>
                <span className={styles.meta}>Instagram · {c.instagram.handle}</span>
              </span>
              <ArrowUpRight className={styles.arrow} size={18} />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>

            {behance && (
              <a className={styles.button} href={behance.url} target="_blank" rel="noopener noreferrer">
                <BehanceIcon className={styles.icon} />
                <span className={styles.text}>
                  <span className={styles.title}>View on Behance</span>
                  <span className={styles.meta}>Behance · {behance.handle}</span>
                </span>
                <ArrowUpRight className={styles.arrow} size={18} />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>

        {details && (
          <dl className={styles.details}>
            {channels.map((ch) => (
              <div key={ch.label}>
                <dt className="t-label">{ch.label}</dt>
                <dd>
                  <a className="link-line" href={ch.href}>
                    {ch.value}
                  </a>
                </dd>
              </div>
            ))}
            <div>
              <dt className="t-label">Based in</dt>
              <dd>
                {site.location.city}, {site.location.country}
              </dd>
            </div>
          </dl>
        )}

        {footer}
      </div>
    </section>
  );
}
