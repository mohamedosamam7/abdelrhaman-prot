# E STUDIO portfolio — handover status

Repo `mohamedosamam7/abdelrhaman-prot` (public). Vercel project `osama-3dd7/abdelrhaman-prot` with the
GitHub integration: a pushed branch gets a preview, and `main` goes to production at
https://abdelrhaman-prot.vercel.app.

| Phase | State |
|---|---|
| 1. Frontend, motion, mobile, Arabic copy/layout | **Done locally and verified** (details below) |
| 2. Release fixes + Vercel deploy | **In progress**: see the Phase 2 section |
| 3. Supabase dashboard | Not started; requirements at the bottom |

## Phase 1 — completed (2026-11-22)

**Earlier work, still in place**
- Simplified lens with a shutter intro, the stronger burgundy gradient, and exactly two photo sizes
  per viewport.
- `/en` and `/ar` routes with a proxy that redirects old URLs (query string kept).
- Language switcher; full Arabic RTL; hreflang and sitemap.

**This round**
- **Next.js 16.4.1 → 16.4.5 (security).** Source of the warning: Next's own CLI upgrade nudge
  (`next/dist/lib/upgrade/nudge.js`), which queries npm advisories. `npm audit` confirmed 7 moderate
  advisories (GHSA-mfr8-8qww-v76h, -vc7v-qv4w-wrv8, -7qx7-33qx-rqx2, -f3mh-rxg3-f5g2, -pc58-hwjq-p385,
  -rhh4-g77r-r9qj, -vvgp-ww4w-46vf) affecting ≤16.4.4. I installed the smallest fixed version, 16.4.5.
  `npm audit` now reports 0 vulnerabilities, and the full unfiltered build log has no warning.
- **Lenis 1.3.27** (`src/components/SmoothScroll.tsx`, `src/lib/scroll.ts`):
  - Wheel and trackpad only. Touch stays native (`syncTouch: false`); no anchor hijacking.
  - Runs on GSAP's ticker, so there is one animation loop.
  - Not started under reduced motion, including a live change of the preference.
  - Destroyed on unmount, so Strict Mode never leaves two instances.
  - Momentum is reset on route change.
  - Overlays use `data-lenis-prevent` and a counted scroll lock shared by the menu and lightbox: they
    can't release each other's lock, the lock always releases on close, navigation or unmount, and it
    pauses Lenis.
- **Gallery touch bug fixed (it predated Lenis).** The carousel track and tab row had
  `overflow-y: auto` (implied by `overflow-x: auto`) plus 1 px of rounding overflow, so a vertical
  swipe starting on the gallery latched onto the track and the page didn't scroll. Both are now
  `overflow-y: hidden`.
- **React Bits.** Its license (MIT + Commons Clause) allows use in a commercial site but not reselling
  the components.
  - Adopted: the `BlurText` word-reveal technique as `src/components/Words.tsx`, on the four section
    headings. It is CSS-driven by the existing RevealObserver (no new runtime), splits on spaces only
    (Arabic letters stay joined) and is disabled under reduced motion.
  - Rejected: cursor, magnet and WebGL effects. They add no value here, and some don't fit touch
    screens or the brand.
- **Hero.** The sequence is unchanged; it already met the brief.
  - Images are now lazy: only one of the three layouts is displayed, and phones were downloading all
    17 hero photos to show 3. The visible layout is on screen, so its photos still load immediately.
  - `sizes` now matches each layout's real tile widths.
- **Fonts.** Unused weights removed (Inter Tight 600, Plex Arabic 600, Amiri 700). Only 400 and 500
  are used anywhere.
- **Arabic copy rewritten:**
  - Saudi-friendly professional tone, one consistent studio voice ("we": أعمالنا، راسلنا).
  - CTA «خلّنا نتكلم», contact heading «عندك مشروع؟».
  - Shorter service titles (تجاري ومنتجات / أطعمة ومشروبات / فعاليات ورياضة); natural phrasing
    instead of literal translation («كل لقطة لها ما تقوله.», «ثلاثة مجالات، ومعيار واحد للضوء.»).
  - Shorter project titles (منطقة المشجعين، المهرجان ليلًا).
  - Meaning preserved; no new claims.
- **Arabic layout:**
  - The contact heading is one line in Arabic, sized for Amiri.
  - Arabic headings use `text-wrap: balance`.
  - Footer social items show the platform with the LTR-isolated handle beneath it, instead of the dash
    breaking across lines (both languages).
- **Canonical URL.** `siteUrl` falls back to Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, so preview
  builds still point canonical/hreflang/sitemap at production. `NEXT_PUBLIC_SITE_URL` overrides it
  (see `.env.example`).

### Verification (local production build, `next start`; headless Chromium unless noted)

- **Build and checks:**
  - `tsc --noEmit` passes; `next build` passes (29 static pages).
  - ESLint was not run: the project has no eslint config (pre-existing).
- **Page audit:** EN + AR × 360/390/430/768/1440 × Home, Work, Work filtered, Project, Contact, 404.
  All 60 combinations have 0 overflow, 0 broken images, 0 off-screen elements and 0 clipped text. On
  Arabic pages the only Latin text is the "English" switch label and the social handles.
- **Hero:**
  - Production and dev Strict Mode × EN/AR × 1440/768/390.
  - 0 frames with the logo and photos visible together; logo fully visible for about 1.3–1.6 s; no
    replays, including Back to Home.
  - Two photo sizes per viewport (1440: 168×210 / 315×210; 768: 139×174 / 261×174; 390: 164×205 /
    338×225).
  - Resize during the intro, slow images (+1.5 s), reduced motion and JavaScript disabled all end on
    the finished composition.
- **Interactions: 35/35 pass.**
  - Language switch keeps the query string, with correct `lang`/`dir`.
  - Filters with Back/Forward; breadcrumbs.
  - Lightbox: RTL keys and control sides, Esc closes.
  - Contact service context; mobile menu and its switch; Let's Talk during the intro; Arabic 404;
    skip link.
  - Lenis: active; smooth wheel; a new page starts at the top; Back restores scroll (900 → 900).
  - Lightbox blocks scrolling behind it and releases on close. The menu locks scrolling and
    navigating releases it.
  - Reduced motion turns Lenis off; no page errors.
- **Touch (Chromium touch emulation):**
  - A vertical swipe that starts on the gallery scrolls the page (was broken, now fixed).
  - A horizontal swipe advances the gallery in EN (+292 px) and AR (−292 px) without moving the page.
- **WebKit (Playwright WebKit on Windows; iPhone 13 profile and 1440 desktop): 26/26 pass.** Hero, no
  overflow, RTL carousel, filters, lightbox lock and release, language switch, no errors.
- **Lighthouse 12** (same machine and settings before and after; simulated throttling):

  | Page | Mobile perf | Mobile LCP | Mobile TBT | Desktop perf |
  |---|---|---|---|---|
  | en home | 77 → **87** | 4.3 → 4.0 s | 340 → 90 ms | 97 → 100 |
  | en work | 80 → **89** | 4.1 → 3.8 s | 320 → 60 ms | 100 → 100 |
  | en contact | 80 → **94** | 3.1 → 3.0 s | 530 → 50 ms | 100 → 100 |
  | ar home | 69 → **79** | 5.7 → 4.7 s | 230 → 90 ms | 86 → 97 |
  | ar work | 73 → **77** | 5.7 → 5.2 s | 180 → 60 ms | 97 → 97 |
  | ar contact | 77 → **84** | 4.4 → 4.1 s | 210 → 60 ms | 99 → 99 |

  Accessibility, best practices and SEO are 100 on every page; CLS is 0–0.001.
- **Not tested:** physical phones, real iOS Safari, Firefox, screen readers.

### Remaining / notes

- **Arabic mobile LCP is still the weakest.** Arabic pages load about 220 KB more font (Amiri ≈ 106 KB)
  over Lighthouse's simulated slow 4G. Options: a lighter Arabic display serif, or a per-locale font
  preload. Both are design and engineering choices for later.
- **Full-page screenshots show blank bands.** These are scroll-reveal states that full-page capture
  doesn't trigger; the viewport sheets (`sheet-*`, `p2a-*`, `p2e-*`) show the real rendering.
- **Arabic photo alt text** (`content/photo-alt-ar.ts`) is descriptive MSA; a native review is still
  worthwhile.

### Review files (`references/_review/`, local only — gitignored)

- `compare-ar-{home,contact}-390-before-after.jpg` — Arabic before/after.
- `p2-{en,ar}-*` — full pages; `sheet-p2a-*`, `sheet-p2e-*` — mobile viewport sheets.
- `p2-hero-prod-{en,ar}-{1440,390}.mp4` — hero recordings.
- `p2-webkit-*` — WebKit screenshots.

## Phase 2 — release and deploy

- Previous working production deployment: commit `87bab58`
  (https://vercel.com/osama-3dd7/abdelrhaman-prot/74vbumExJpijJbU8s7TBnVviZQwF).
- **Rollback:** in Vercel → Deployments, open that deployment and choose "Promote to Production" (or
  "Instant Rollback"), or revert the merge on `main` and push.
- Release branch: `release/frontend-i18n` → preview → verify → fast-forward `main` → production.
- Excluded from the release: `.claude/` and `skills-lock.json` (local agent tooling),
  `references/` (gitignored), and env files.
- 2026-11-22: commit `5b6a740` pushed to `release/frontend-i18n`. The Vercel preview built
  successfully (https://vercel.com/osama-3dd7/abdelrhaman-prot/CRzn8EnFYtbSnNUEGcmDHf6tS7hv), branch URL
  https://abdelrhaman-prot-git-release-frontend-i18n-osama-3dd7.vercel.app.
- **Preview verified (2026-11-22)**, using the bypass secret from `.env.local` (never printed or
  committed):
  - HTTP/SEO 37/37: redirects keep the query string, Accept-Language ar redirects to `/ar`,
    lang/dir, canonical and hreflang on the production domain, sitemap (24 URLs), robots, images,
    CSS, localized 404.
  - Interactions 34/35. The failing item is the synthetic-gesture check, a known headless artifact
    that also fails on a control area; the raw-touch tests pass: vertical swipe on the gallery scrolls
    the page, horizontal swipe advances it in EN and AR.
  - WebKit 26/26.
  - Hero, all cases: 0 logo/photo overlap, no replays, two photo sizes, resize, slow images, reduced
    motion and no-JS all end correctly.
- **Production:** `main` fast-forwarded to the release and pushed (results below).
- Previous production (rollback target): `87bab58`.

## Phase 3 — Supabase content dashboard (not started)

Supabase is not configured (no project, keys or CLI on this machine). Requirements:

- **Database:** Postgres with versioned migrations and RLS; idempotent import of current content and
  media mappings, with a backup first.
- **Admin auth:** Supabase Auth, admin-only, with server-side authorization and an admin role table;
  no self-assignment; secure first-admin provisioning; login, logout, expiry and recovery.
- **Media library:** images and video; replace image↔video in slots; AR/EN alt text; posters; focal
  points; reorder; validation, progress, retry, cancel; reference checks before delete; no fake
  transcoding.
- **Video:** muted inline autoplay only where suitable; poster fallback; never autoplays audio; pauses
  offscreen; can never stall the hero.
- **Sections:** templates (hero, gallery, text+media, services, featured projects, CTA); add, edit,
  duplicate, reorder (accessible), hide, delete with confirmation; draft preview; publish.
- **Projects and settings:** projects CRUD; stable IDs and unique slugs; independent AR/EN with
  missing-translation flags; logo, navigation, social links, footer, SEO, and controlled colours and
  gradients.
- **Publishing and resilience:** drafts stay private; explicit publish with cache revalidation;
  revisions or tested backup/restore; public pages never go blank when the database fails.
- **Verification:** an end-to-end matrix (permissions, uploads, sections, drafts vs published, AR/EN
  rendering), plus the Arabic client guide.
