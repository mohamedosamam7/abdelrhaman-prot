import { site } from "@/content/site";
import { tr, type Locale } from "@/i18n/config";

const { email, whatsapp } = site.contact;

export const emailHref = email.placeholder || !email.value ? null : `mailto:${email.value}`;

/** WhatsApp chat link with the greeting in the visitor's language, or null until a number is set. */
export const whatsappHref = whatsapp.placeholder || !whatsapp.value
  ? null
  : (lang: Locale) => `https://wa.me/${whatsapp.value.replace(/\D/g, "")}?text=${encodeURIComponent(tr(lang, whatsapp.message))}`;
