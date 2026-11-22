import type { SettingsDoc } from "@/cms/schema";
import { tr, type Locale } from "@/i18n/config";

type Contact = SettingsDoc["contact"];

/** mailto: link, or null until an address is enabled. */
export const emailHref = (c: Contact) => (c.email.enabled && c.email.value ? `mailto:${c.email.value}` : null);

/** WhatsApp chat link with the greeting in the visitor's language, or null until a number is enabled. */
export const whatsappHref = (c: Contact, lang: Locale) =>
  c.whatsapp.enabled && c.whatsapp.number
    ? `https://wa.me/${c.whatsapp.number.replace(/\D/g, "")}?text=${encodeURIComponent(tr(lang, c.whatsapp.message))}`
    : null;

/** Behance link when enabled. */
export const behanceLink = (c: Contact) => (c.behance.enabled && c.behance.url ? { url: c.behance.url, handle: c.behance.handle } : null);
