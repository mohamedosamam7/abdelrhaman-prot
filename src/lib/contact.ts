import { site } from "@/content/site";

const { email, whatsapp } = site.contact;

export const emailHref = email.placeholder || !email.value ? null : `mailto:${email.value}`;

export const whatsappHref =
  whatsapp.placeholder || !whatsapp.value
    ? null
    : `https://wa.me/${whatsapp.value.replace(/\D/g, "")}?text=${encodeURIComponent(whatsapp.message)}`;
