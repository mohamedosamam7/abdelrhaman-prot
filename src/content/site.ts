/**
 * SITE CONTENT — identity, copy and contact details.
 *
 * Only verified information is filled in. Anything still unknown is marked
 * `placeholder: true` — replace the value and set `placeholder: false` once
 * confirmed. Placeholder biography text is not rendered on the site.
 */
import type { Localized } from "@/i18n/config";
import { photo } from "./photos";

export interface Editable {
  value: string;
  placeholder: boolean;
}

export const site = {
  /**
   * Visual identity shown in the header, footer and favicon (see
   * src/components/brand/Logo.tsx). The personal name below still drives the
   * hero, page titles and copyright — changing those is a separate decision.
   */
  brand: { name: "E STUDIO", tagline: "Quality. Creativity. Impact." },
  name: { first: "Abdelrahman", last: "Fathy" },
  fullName: { en: "Abdelrahman Fathy", ar: "عبدالرحمن فتحي" } satisfies Localized,
  monogram: "AF",
  role: { en: "Professional Photographer", ar: "مصوّر محترف" } satisfies Localized,
  location: {
    city: { en: "Riyadh", ar: "الرياض" } satisfies Localized,
    country: { en: "Saudi Arabia", ar: "المملكة العربية السعودية" } satisfies Localized,
    short: { en: "Riyadh, SA", ar: "الرياض، السعودية" } satisfies Localized,
    timeZone: "Asia/Riyadh",
  },
  tagline: ["Framing", "what matters."],
  disciplinesShort: ["Events", "Sports", "Commercial", "Food"],

  description: {
    en: "Abdelrahman Fathy — professional photographer based in Riyadh, Saudi Arabia. Event and sports photography; available for commercial and food & beverage projects.",
    ar: "عبدالرحمن فتحي — مصوّر محترف في الرياض. تصوير فعاليات ورياضة، ومتاح لمشاريع التصوير التجاري والأطعمة والمشروبات.",
  } satisfies Localized,


  /** Not rendered on the homepage any more; kept for a future About page. */
  about: {
    heading: ["Based in Riyadh.", "Working where", "the story"],
    headingItalic: "takes me.",
    photo: photo("studio-portrait"),
    bio: {
      value:
        "Biography placeholder — replace with Abdelrahman's approved biography. Two or three sentences on approach, the kind of work he takes on and how he likes to collaborate.",
      placeholder: true,
    } satisfies Editable,
  },

  contact: {
    heading: {
      en: { lead: "Have a project", emphasis: "in mind?" },
      ar: { lead: "عندك", emphasis: "مشروع؟" },
    } satisfies Localized<{ lead: string; emphasis: string }>,
    subheading: { en: "Let’s create something worth seeing.", ar: "نصنع معك صورًا تستحق أن تُرى." } satisfies Localized,
    body: {
      en: "Send a message on Instagram or explore more of the work on Behance.",
      ar: "راسلنا على إنستغرام، أو تصفّح المزيد من أعمالنا على بيهانس.",
    } satisfies Localized,
    /** Used by the "Let’s Talk" header button. */
    page: "/contact",
    /**
     * SOCIAL LINKS — the only place these URLs live. Header, contact section,
     * Contact page and footer all read from here.
     */
    instagram: {
      handle: "@a.fathyphotography",
      url: "https://www.instagram.com/a.fathyphotography/",
    },
    /** Behance — confirmed. */
    behance: { url: "https://www.behance.net/abdulrafathy4", handle: "abdulrafathy4", placeholder: false },
    /** e.g. { value: "hello@domain.com", placeholder: false } */
    email: { value: "", placeholder: true } satisfies Editable,
    /**
     * WhatsApp / phone. `value` = full international number, digits only
     * (e.g. "9665XXXXXXXX"); `display` = how it is shown (e.g. "+966 5X XXX XXXX").
     * Once set, the link opens a direct WhatsApp chat with `message` prefilled.
     */
    whatsapp: {
      value: "",
      display: "",
      placeholder: true,
      message: {
        en: "Hello Abdelrahman, I’d like to discuss a photography project.",
        ar: "السلام عليكم، حاب أستفسر عن مشروع تصوير.",
      } satisfies Localized,
    },
    /** Shown wherever a contact detail is still missing. */
    missing: "[Placeholder until provided]",
  },
};

export const fullName = `${site.name.first} ${site.name.last}`;
