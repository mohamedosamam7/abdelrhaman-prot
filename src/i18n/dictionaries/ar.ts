import type { Dictionary } from "./en";

/** Arabic plural forms: 1, 2, 3–10, 11+ (and 0). */
function plural(n: number, one: string, two: string, few: string, many: string) {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}

/** واجهة الموقع (العربية). */
export const ar: Dictionary = {
  langName: "العربية",
  switchTo: "التبديل إلى العربية",
  skip: "تخطَّ إلى المحتوى",
  nav: { home: "الرئيسية", work: "أعمالنا", contact: "تواصل", primary: "القائمة الرئيسية", mobile: "قائمة الجوال", letsTalk: "خلّنا نتكلم" },
  menu: { open: "فتح القائمة", close: "إغلاق القائمة" },
  brandHome: "E STUDIO — الصفحة الرئيسية",
  localTime: "الوقت الآن في الرياض",
  newTab: "(يفتح في نافذة جديدة)",
  instagramLabel: (handle: string) => `حسابنا على إنستغرام ${handle} (يفتح في نافذة جديدة)`,
  footer: { pages: "الصفحات", elsewhere: "تابعنا", nav: "روابط أسفل الصفحة", top: "للأعلى", portfolio: "معرض الأعمال" },
  frames: {
    carousel: "لقطات مختارة",
    jump: "اختر الفئة",
    frame: "لقطة",
    of: "من",
    prev: "اللقطة السابقة",
    next: "اللقطة التالية",
    first: "الرجوع لأول لقطة",
    slide: (i: number, n: number, title: string) => `${i} من ${n}: ${title}`,
    viewProject: "عرض المشروع",
    play: (title: string) => `تشغيل الفيديو: ${title}`,
    viewProjectButton: "عرض المشروع",
    viewAll: "كل أعمالنا",
  },
  work: {
    kicker: "عبدالرحمن فتحي — تصوير",
    title: ["أعمالنا"],
    lead: "نصوّر الفعاليات والرياضة في الرياض: الفرق التي تصنع الحدث، والجمهور، والأجواء من حولهم. اختر أي مشروع لتشاهد قصته كاملة.",
    all: "الكل",
    filterLabel: "تصفية المشاريع حسب الفئة",
    showing: (n: number) => `يُعرض ${plural(n, "مشروع واحد", "مشروعان", "مشاريع", "مشروعًا")}`,
    frames: (n: number) => plural(n, "لقطة واحدة", "لقطتان", "لقطات", "لقطة"),
  },
  project: {
    breadcrumb: "مسار الصفحة",
    work: "أعمالنا",
    allWork: "كل الأعمال",
    next: "المشروع التالي",
    open: (i: number, n: number, alt: string) => `عرض الصورة ${i} من ${n}: ${alt}`,
  },
  lightbox: {
    viewer: (title: string) => `${title} — عرض الصور`,
    close: "إغلاق",
    prev: "السابقة",
    next: "التالية",
    prevLabel: "الصورة السابقة",
    nextLabel: "الصورة التالية",
    videoFailed: "تعذّر تشغيل هذا الفيديو هنا.",
    openFile: "افتح الملف",
  },
  contact: {
    label: "تواصل معنا",
    channels: "إنستغرام · بيهانس",
    instagram: "راسلنا على إنستغرام",
    behance: "شاهد أعمالنا على بيهانس",
    email: "البريد الإلكتروني",
    whatsapp: "واتساب",
    basedIn: "موقعنا",
    seeWork: "تصفّح أعمالنا",
    backHome: "الرجوع للرئيسية",
    continue: "تابع التصفح",
    enquiring: (service: string): [string, string, string] => ["تستفسر عن تصوير ", service, "؟ اذكر ذلك في رسالتك."],
  },
  preview: { label: "معاينة — مسودّات غير منشورة", exit: "إنهاء المعاينة" },
  approach: { placeholder: "صورة مؤقتة" },
  notFound: {
    label: "404 — الصفحة غير موجودة",
    lead: "خارج",
    emphasis: "الكادر.",
    title: "الصفحة غير موجودة",
    description: "هذه الصفحة غير موجودة. تصفّح أعمالنا أو تواصل معنا.",
  },
  meta: {
    homeTitle: "عبدالرحمن فتحي — مصوّر محترف في الرياض",
    template: "%s — عبدالرحمن فتحي",
    siteName: "عبدالرحمن فتحي — تصوير",
    workTitle: "أعمالنا",
    workDescription: "تصوير فعاليات ورياضة في الرياض بعدسة عبدالرحمن فتحي — تسعة مشاريع مصنّفة حسب الفئة.",
    contactTitle: "تواصل معنا",
    contactDescription: "ابدأ مشروع تصوير مع عبدالرحمن فتحي في الرياض. راسلنا على إنستغرام أو شاهد المزيد من أعمالنا على بيهانس.",
    projectDescription: (title: string, category: string, n: number) =>
      `${title} — تصوير ${category} بعدسة عبدالرحمن فتحي، الرياض. ${plural(n, "لقطة واحدة", "لقطتان", "لقطات", "لقطة")}.`,
  },
};
