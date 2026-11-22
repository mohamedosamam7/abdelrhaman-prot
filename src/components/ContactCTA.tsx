import type { ReactNode } from "react";
import { ArrowUpRight, BehanceIcon, InstagramIcon } from "@/components/Icons";
import type { SettingsDoc } from "@/cms/schema";
import { getDictionary, tr, type Locale } from "@/i18n";
import { behanceLink, emailHref, whatsappHref } from "@/lib/contact";
import { Words, wordCount } from "@/components/Words";
import styles from "./ContactCTA.module.css";

interface Props {
  lang: Locale;
  settings: SettingsDoc;
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
export function ContactCTA({ lang, settings, as: Heading = "h2", details = false, context, footer }: Props) {
  const c = settings.contact;
  const t = getDictionary(lang);
  const heading = tr(lang, c.heading);
  const behance = behanceLink(c);
  const mail = emailHref(c);
  const wa = whatsappHref(c, lang);
  const channels = [
    mail && { label: t.contact.email, value: c.email.value, href: mail },
    wa && { label: t.contact.whatsapp, value: c.whatsapp.display || c.whatsapp.number, href: wa },
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  return (
    <section className={`theme-dark ${styles.contact}`} id="contact" aria-labelledby="contact-heading">
      <div className="container">
        <div className={styles.top}>
          <p className="t-label">{t.contact.label}</p>
          <p className={`t-label ${styles.topRight}`}>{t.contact.channels}</p>
        </div>

        <Heading id="contact-heading" className={`t-serif ${styles.heading}`} data-reveal="words">
          <Words text={heading.lead} /> <em className={styles.em}><Words text={heading.emphasis} start={wordCount(heading.lead)} /></em>
        </Heading>

        <div className={styles.grid}>
          <div className={styles.intro}>
            <p className={`t-serif ${styles.sub}`}>{tr(lang, c.subheading)}</p>
            {context}
            <p className="muted">{tr(lang, c.body)}</p>
          </div>

          <div className={styles.buttons}>
            <a className={`${styles.button} ${styles.primary}`} href={c.instagram.url} target="_blank" rel="noopener noreferrer">
              <InstagramIcon className={styles.icon} />
              <span className={styles.text}>
                <span className={styles.title}>{t.contact.instagram}</span>
                <span className={styles.meta}>
                  Instagram · <bdi>{c.instagram.handle}</bdi>
                </span>
              </span>
              <ArrowUpRight className={`dir-icon ${styles.arrow}`} size={18} />
              <span className="sr-only"> {t.newTab}</span>
            </a>

            {behance && (
              <a className={styles.button} href={behance.url} target="_blank" rel="noopener noreferrer">
                <BehanceIcon className={styles.icon} />
                <span className={styles.text}>
                  <span className={styles.title}>{t.contact.behance}</span>
                  <span className={styles.meta}>
                    Behance · <bdi>{behance.handle}</bdi>
                  </span>
                </span>
                <ArrowUpRight className={`dir-icon ${styles.arrow}`} size={18} />
                <span className="sr-only"> {t.newTab}</span>
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
                  <a className="link-line" href={ch.href} dir="ltr">
                    {ch.value}
                  </a>
                </dd>
              </div>
            ))}
            <div>
              <dt className="t-label">{t.contact.basedIn}</dt>
              <dd>
                {tr(lang, settings.location.city)}
                {lang === "ar" ? "، " : ", "}
                {tr(lang, settings.location.country)}
              </dd>
            </div>
          </dl>
        )}

        {footer}
      </div>
    </section>
  );
}
