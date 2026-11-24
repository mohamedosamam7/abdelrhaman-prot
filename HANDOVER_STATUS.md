# E STUDIO portfolio — handover status

Repo `mohamedosamam7/abdelrhaman-prot` (public). Vercel project `osama-3dd7/abdelrhaman-prot` with the
GitHub integration: a pushed branch gets a preview, and `main` goes to production at
https://abdelrhaman-prot.vercel.app.

| Phase | State |
|---|---|
| 1. Frontend, motion, mobile, Arabic copy/layout | **Done locally and verified** (details below) |
| 2. Release fixes + Vercel deploy | **Done**: live at https://abdelrhaman-prot.vercel.app/en and /ar |
| 3. Supabase dashboard | **Released to Production 2026-11-24** (`main` = `e1ec770`). Owner manual acceptance still pending |

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
- **Production (2026-11-22):** `main` fast-forwarded to `425f193` and pushed. Vercel deployment
  https://vercel.com/osama-3dd7/abdelrhaman-prot/GxLA4vuqQ3q5qpnNdc9o9die5vuU.
  - Live verification on https://abdelrhaman-prot.vercel.app: HTTP/SEO 37/37; interactions 34/35
    (same synthetic-gesture artifact; raw-touch swipe tests pass); WebKit 26/26.
  - Hero: all cases pass (0 overlap, no replays, two sizes, resize, slow images, reduced motion,
    no-JS).
  - Live URLs: https://abdelrhaman-prot.vercel.app/en and https://abdelrhaman-prot.vercel.app/ar.
    Old URLs (`/`, `/work`, `/contact?…`) redirect 308 to `/en/…` with the query kept.
- Previous production (rollback tar## Phase 3 — Supabase content dashboard (branch `feature/dashboard`, preview only)

- **Preview (site):** https://abdelrhaman-prot-git-feature-dashboard-osama-3dd7.vercel.app/en (and `/ar`)
- **Dashboard:** https://abdelrhaman-prot-git-feature-dashboard-osama-3dd7.vercel.app/admin
- **Production:** released 2026-11-24 — `main` = `e1ec770`; see "Production release — done" below.
- **Supabase project:** `e-studio-portfolio` (ref `efp…jyr`, eu-central-1). It is connected only to the
  `feature/dashboard` Preview environment and to local `.env.local`. Migrations `0100`–`0400` are applied
  (`npm run cms:migrate`).
- **Admin account:** the client's own account, added by invitation. It is the only user.
- **Database state:** restored to the exact pre-test state, verified against the backup — **empty CMS**.
  On the preview, open **Overview → Import** to load the current site as drafts, then publish.

### Bugs found and fixed (all retested)

| # | Severity | Bug | Root cause | Fix | Retest |
|---|---|---|---|---|---|
| 1 | Blocker | Dashboard very slow: full load 5.3 s, navigation 1.1–1.8 s, save 1.3 s | Functions ran in `iad1` (USA) against Supabase in Frankfurt; every page also re-verified the session over the network (twice); the sidebar prefetched all 7 pages ×2 on every view | `vercel.json` regions `fra1`; local ES256 `getClaims()` and one cached admin check per request; prefetch on hover/focus only; `loading.tsx` | See the timings table below |
| 2 | Blocker | **Publish failed every time** | Supabase `pg-safeupdate` rejects `UPDATE` without `WHERE` inside `publish_all()` | Migration `0400` adds explicit `WHERE` clauses | publish 30/30 |
| 3 | Critical | Projects published after a deploy returned 404 | Root layout `dynamicParams = false` also applied to child routes | Removed (unknown languages still 404) | Pages render on demand |
| 4 | Major | A hidden, switched-off email/WhatsApp/Behance value blocked every settings save | Validated even when switched off | Validated only while switched on | content 37/37 |
| 5 | Major | Out-of-band DB changes (a manual restore) could stay invisible indefinitely; stale content survived rebuilds | Published-content cache had no expiry | 5-minute safety net plus a new cache key | Verified locally and on preview |
| 6 | Major | Sitemap listed a newly published project only later | Static sitemap file | Rendered per request (from the cache) | publish 30/30 |
| 7 | Major | iOS Safari: dark band with rounded corners crossing the content while scrolling (client recording) | The fixed frame's bottom edge sits above Safari's floating toolbar while the page renders beneath it | On touch devices the overlay has no fixed bottom edge; the page end carries the bottom corners; desktop unchanged | Emulated only — **physical iPhone pending** |
| 8 | Minor | Email cleared after a wrong password | React resets action forms | Action returns the email | auth 40/41 |
| 9 | Minor | New project only appeared after a reload; Create button silently disabled ~1.3 s | List state not synced; no pending label | Sync on refresh; "Saving…" label | content 37/37 |
| 10 | Minor | Project galleries couldn't play videos | Not implemented | Poster + badge; native controls; error message + link | media 34/34 |
| 11 | Minor | Redirects built from the server's own host (`0.0.0.0` locally) | Absolute URLs from `req.nextUrl` | Relative same-site redirects | auth 40/41 |
| 12 | Minor | Project-card title stayed underlined after a tap | Underline rule outside the hover media query | New card interaction (below) | ui 79/79 |
| 13 | Minor | Project titles in dashboard lists were 19 px tall tap targets | Inline links | 44 px tap height | Code change; not re-measured |

### Features added this round

- **Editing coverage:**
  - Newly editable: the Work page intro and the Work/Contact search & sharing text (Pages); category display names (Settings).
  - Intentionally fixed: interface microcopy (buttons, lightbox, 404, accessibility labels), the logo and the layout.
- **Import:** only adds what is missing. Never overwrites edits or duplicates (tested).
- **Editor protection:**
  - Unsaved-changes warning on in-app links and on tab close/reload; a visible "Unsaved changes" state.
  - No double submissions; a failure never shows as saved or published.
- **Hero:** 12 / 9 / 6 photos (desktop / tablet / mobile) at the existing sizes. Four new distinct photos: L5 `p9-r2c3`, P5 `p2-r3c3`, L6 `p7-r2c2`, P6 `p8-r3c3`.
  - Uses 12 dashboard slots; older 8-slot drafts stay valid.
  - The intro waits only for on-screen photos, and the logo stays within the first screen.
  - Hidden-layout photos are never downloaded (on a phone, 6 desktop/tablet-only photos: 0 requests).
- **Project cards (Home featured + Work):**
  - Fine-pointer hover: no underline; 1.025 image zoom; a small arrow fading in with 4 px movement over 300 ms; no layout shift.
  - Keyboard focus shows the arrow; touch gets brief pressed feedback only; reduced motion is static; the arrow is mirrored in Arabic.
- **Footer credit:** "Powered by Mohamed Osama" in both languages, LTR, script signature (Allura, OFL), LinkedIn in a new tab.
- **Client guide:** `docs/client-guide-ar.md` (Arabic).

### Dashboard timings (preview, real browser, median of 3 runs, ms)

| Action | Before | After fixes | Final build |
|---|---|---|---|
| Full reload `/admin` | 5,264 | 1,086 | 1,110 |
| Sign-in → overview | 2,067 | 1,110 | 1,212 |
| Settings | 1,849 | 857 | 622 |
| Pages → Home | 1,664 | 778 | 656 |
| Pages → Work | 1,432 | 348 | 449 |
| Projects | 1,523 | 705 | 501 |
| Media | 1,675 | 723 | 632 |
| History | 1,705 | 705 | 510 |
| Overview (in-app) | 1,130 | 353 | 335 |
| Save draft | 1,334 | 328 | 412 |

Server response per request went from 480–930 ms (`iad1`) to 130–440 ms (`fra1`).

### Test results (final preview build unless noted; the Supabase DB was isolated test data)

- **auth 40/41:** the 1 item is BLOCKED by design — the forgot-password form isn't submitted (built-in mailer quota); recovery verified with generated links.
- **content 37/37**, **publish 30/30**, **media 34/34**, **security 30/30**.
- **UI 79/79:** hero rows, touch frame, project cards.
- **Public site:**
  - live HTTP/SEO 37/37; page audit 60/60 (0 overflow, broken images or clipped text);
  - hero, every case: 0 overlap, 0 replays, two sizes;
  - interactions 34/35 — the failure is the synthetic-gesture tool; the raw-touch swipe test passes on the same build;
  - WebKit 26/26, Firefox (phone-size with touch, and desktop) 26/26.
- **Security checks covered:**
  - anonymous and non-admin users can't read drafts, write, grant admin, publish, use private storage, or call server actions;
  - unsafe HTML renders as text; `javascript:` URLs are rejected;
  - no secrets in browser bundles; the dashboard is `noindex` and `no-store`.
- **Lighthouse:**
  - Accessibility, best practices and SEO are 100 on the local production build.
  - The mobile performance regression is investigated and fixed; see "Mobile Lighthouse regression" below.
  - Preview: SEO 58–61 because Vercel marks previews `noindex`.
- **Screenshots:** `references/_review/` — `p6-dash-*` (dashboard AR/EN × 1440/390), `p5-*` (public pages), `sheet-p4-hero-*` (new hero).

### Mobile Lighthouse regression — investigated and fixed (2026-11-24)

- **Method:** production's commit `425f193` (separate git worktree) and this branch, both as local production builds on the same machine. Lighthouse mobile defaults, alternating runs.
- **Confirmed causes:**
  1. The home page's new featured-projects section added a **third render-blocking stylesheet**, which delayed the first paint by ~450 ms (EN FCP 1,088 → 1,531 ms).
  2. The **signature font (26 KB) loaded before the largest paint**.
- **Ruled out:**
  - JavaScript: main-thread time was *lower* on the branch.
  - CLS: 0 on both.
  - Server response: the same on both.
- **Remaining, accepted:** on mobile, the hero's 3 extra approved photos (~74 KB) still load before the largest paint, adding up to ~200 ms on EN home. They're served byte-for-byte on purpose (see `src/lib/image.ts`), so they weren't re-encoded.
- **Fixes:**
  - `experimental.inlineCss` (the CSS is ~13 KB compressed), so no stylesheet request blocks the first paint.
  - The signature font is applied only when the footer is within 800 px (`SignatureLink`).
- **Tried and reverted, for lack of evidence:** footer `content-visibility` (didn't stop the font loading); hero `fetchPriority` (no measurable effect).
- **Results:** median of 5 alternating runs — EN home 88 vs production 85, AR home 78 vs 79. FCP is now equal to production.
- **Checks after the change:**
  - The signature font is no longer fetched at load, and appears in the script font near the footer; the credit link is intact.
  - Styled after client navigation; the dashboard login matches the previous build.
  - UI suite 79/79.

### Handover state (2026-11-24, before the 19:20 Cairo client handover)

- **Preview under manual test:** branch `feature/dashboard`.
  - App code is identical to `f756795`. Later commits only add docs and the backup script.
  - The exact HEAD is in the latest commit on the branch.
  - No code changes during manual testing unless a bug is reported.
- **Production:** released 2026-11-24 (`main` = `e1ec770`); see "Production release — done".
- **Background jobs:** none running. Test servers are stopped, the temporary worktree is removed, and no automated test touches the database.
- **Database:** pre-test state. The CMS is empty; 1 user (the owner) and 1 admin; 0 files. Migrations `0100`–`0400` are applied.
- **iOS scrolling band:** **confirmed fixed by the owner on a real iPhone** (2026-11-24).
- **Site URL:** stays `https://abdelrhaman-prot.vercel.app`; there is no custom domain.
- **Performance:**
  - Home EN/AR now equals production (median of 5 runs).
  - The EN Work comparison is **inconclusive**: production's own score varied up to 11 points between rounds (77–88), so the measurement noise exceeds the difference.
  - No further score chasing planned.
- **Manual acceptance checklist:** `docs/manual-acceptance-ar.md`. Every item is "not tested" until the owner confirms it.

### Email / client access

- **Ready:**
  - Email + password sign-in; public sign-up **disabled** (`disable_signup: true`); no other providers.
  - Invite and recovery links redirect to `<origin>/admin/auth/confirm?next=/admin/reset`.
- **Chosen SMTP (no custom domain needed):** Gmail — `smtp.gmail.com`, port `587` (STARTTLS; `465` is the documented alternative).
  - Sender `memosamo7@gmail.com`, sender name `E STUDIO`, password = a Google App Password, entered by the owner directly in Supabase.
  - Limits: ~500 emails/day (Gmail), 30/hour (Supabase default with custom SMTP).
  - **If the Google account password changes, the App Password is revoked and mail stops** until a new one is entered.
- **Ownership caveat:** the sender Gmail belongs to the **developer, not the client**. At handover, agree who keeps it. For client ownership, move to a client-owned Gmail (new App Password) or to a domain with Resend/Brevo. The sender isn't an admin account.
- **Status:** Gmail SMTP is saved in Supabase. On 2026-11-24 the owner manually verified that the password-reset email arrived, the link worked, and sign-in with the new password succeeded. **This covers the owner's account only.**
- **Client invitation delivery: not tested yet.**
- **Client admin account:** not created yet. It needs working SMTP plus the client's email, confirmed by the owner. Use an invitation only: no fixed password, and never share the owner's credentials.

### Backup / restore

- **Latest backup:** `backups/2026-11-24T17-26-03-347Z` (0 content rows, 1 admin, 0 files). Take a new one right before the merge if content changes.
- **Before release, and before big edits:** run `npm run cms:backup`. It's read-only, and saves all CMS tables as JSON plus every uploaded file to `backups/<timestamp>/` (git-ignored).
  - Tested 2026-11-24: 0 content rows, 1 admin, 0 files.
- **Content rollback:** Dashboard → History → "Restore to drafts" → Publish. Every publish stores the previously published version.
- **Full restore** from a backup folder is a developer task: re-insert the rows and re-upload the files. Never restore over a newer database without a fresh backup first.
- **Code rollback:** Vercel → Deployments → the previous production deployment → "Instant Rollback". Without Supabase variables, production serves the built-in content.

### Production release — done (2026-11-24, approved by the owner)

- **Live:** https://abdelrhaman-prot.vercel.app/ar and /en. **Dashboard:** https://abdelrhaman-prot.vercel.app/admin
- **Steps taken:**
  1. Backup `backups/2026-11-24T17-59-14-342Z` (0 content rows, 1 admin, 0 files).
  2. Owner added the Production environment to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` on Vercel, and set the Supabase Site URL and production redirect URL.
  3. `main` fast-forwarded `425f193` → `e1ec770` and pushed; the Vercel production deployment succeeded.
- **Automated smoke checks (no Vercel bypass header, so as a public visitor):**
  - `/en`, `/ar`, work, contact and a project page return 200 without a Vercel login; correct `lang`/`dir`; footer credit and LinkedIn link present; CSS inline; public pages indexable.
  - `/ar/xyz` returns 404; in a browser it renders the Arabic 404 (RTL, home links). The raw HTML shell has no `lang` until hydration.
  - `/sitemap.xml` and `/robots.txt` use the production domain.
  - `/admin`, `/admin/settings`, `/admin/projects`, `/admin/media` redirect (307) to `/admin/login`. The login page loads (Supabase env present) and has `noindex` plus `no-store`. `/api/preview` returns 401.
  - No secret key or DB URL in client bundles.
  - Database unchanged: 0 content, 0 files, 1 user, 1 admin. RLS on for all 6 tables; sign-up disabled; email the only provider; anonymous reads of `admins` are refused.
- **Not done by automation (owner's manual tests):** signing in on production, editing, publishing. The CMS is empty, so the site shows the built-in content until Import + Publish.
- **Rollback:** Vercel → Deployments → the `425f193` production deployment → Instant Rollback.
- **Housekeeping:** an empty `pass.txt` is tracked in Git (no content); it can be deleted later.

### Production release plan (as executed)

1. **Commit to release:** the latest `feature/dashboard` HEAD. The app code is identical to `f756795`; later commits are docs/scripts only. Check with `git diff --stat f756795 HEAD -- src next.config.ts package-lock.json` (empty). If bugs are fixed after manual acceptance, the new HEAD includes them. App code is identical to `f756795` unless a bug fix follows. Fast-forward `main` from `425f193`.
   - Verified: `main` is an ancestor of `feature/dashboard`, so it's a fast-forward.
2. **Vercel → Production environment variables** (public values only; the app reads nothing else):
   - `NEXT_PUBLIC_SUPABASE_URL` — the same value as Preview.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — the same value as Preview.
   - `NEXT_PUBLIC_SITE_URL` — only if a custom domain is used; otherwise it defaults to the Vercel production URL.
   - **Do not add** `SUPABASE_SECRET_KEY` or `SUPABASE_DB_URL` to Vercel; they stay only in local `.env.local` for scripts.
3. **Supabase → Authentication → URL Configuration** (no custom domain):
   - Site URL: `https://abdelrhaman-prot.vercel.app`
   - Redirect URLs (keep the preview entry):

     ```
     https://abdelrhaman-prot.vercel.app/admin/auth/confirm**
     https://abdelrhaman-prot-git-feature-dashboard-osama-3dd7.vercel.app/admin/auth/confirm**
     ```
4. **Migrations:** none pending. `0100`–`0400` are already applied to the single shared project.
   - Preview and production will share this database: whatever is published on the preview at release time is what production shows.
5. **Backup:** `npm run cms:backup` immediately before the merge.
6. **Release:** `git merge --ff-only feature/dashboard` on `main`, then push; Vercel builds production.
7. **Smoke checks after release:**
   - `/en` and `/ar` (home, work, a project, contact): status 200, styled, photos load, footer credit.
   - `/xyz` returns 404.
   - `/sitemap.xml` and `/robots.txt` use the production domain.
   - `/admin` redirects to login; sign in; Overview loads.
   - Make a small edit → preview → publish → visible publicly → restore it from History.
   - Production pages are indexable: no `noindex` on public pages, `noindex` on `/admin`.
8. **Rollback:** Vercel Instant Rollback to the `425f193` deployment. Database rollback isn't needed for that. Content mistakes are fixed via History.

### Remaining blockers / untested

1. Client invitation email: not tested yet. Password-reset delivery is verified for the owner's account only.
2. Owner manual acceptance (`docs/manual-acceptance-ar.md`) is not yet done, apart from the iPhone scrolling item.
3. The client's admin account doesn't exist yet: it needs working SMTP plus the client's email, confirmed by the owner.
6. Sender ownership: SMTP sends from the developer's Gmail; agree on the transfer at handover.
4. No physical Android testing. Firefox/WebKit were tested via Playwright only.
5. Local tooling: Node 20 needs `--experimental-websocket` (already in the npm scripts); Node 22+ is recommended.

## Original Phase 3 requirements (agreed)


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
