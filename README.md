# Abdelrahman Fathy — Photography

Portfolio for Abdelrahman Fathy, professional photographer, Riyadh.
Next.js 16 (App Router) · TypeScript · CSS Modules · `next/image`.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

## Pages

- `/` — Home: hero, Selected frames (horizontal image/video gallery), three services, "Every frame should say something", contact
- `/contact` — the contact section as its own page (the header's "Let’s Talk" button)
- `/work` — project grid with category filters (`/work?category=events`). Only categories with real work get a filter.
- `/work/[slug]` — project pages: an even photo grid with lightbox, at most 12 photographs.

Contact is in the main nav on every page (`/contact`). Home and Work both end with the contact section.

> **Previewing from a phone:** `next dev` blocks other devices unless their address is in `allowedDevOrigins` (`next.config.ts`). Without it the page loads but never starts its scripts. Update the IP there if your network address changes. It's the "Network:" line printed by `npm run dev`.

> **Build on Windows:** run commands from `D:\Portfolio` (capital P, the folder's real name). Running from `D:\portfolio` makes Node load React twice and the build fails while prerendering with `Cannot read properties of null (reading 'useContext')`.

## Replacing placeholder content

All content lives in `src/content/`. You never need to touch the components.

| File | What it holds |
| --- | --- |
| `photos.ts` | Every photograph: `src`, `width`, `height`, `alt`, `position` (crop focus) |
| `projects.ts` | Projects: title, category, year, cover, `images` (detail page) and `highlights` (Work page) |
| `home.ts` | Hero photo slots (`heroSlots`: photo, portrait 4:5 / landscape 3:2, focal point, desktop/tablet/mobile placement); **Selected frames** gallery items (images and videos, order, categories, project links); services rows; the "Every frame" section copy and photo |
| `disciplines.ts` | The four disciplines, their titles and gallery tab labels |
| `site.ts` | Brand, name, location, copy, and **all social/contact URLs** (Instagram, Behance, email, WhatsApp) |

**Gallery videos:** put the file in `public/video/`, then add an item with `type: "video"`, `src`, and a `poster` photo id in `selectedFrames` (`home.ts`; an example is in the comment there). Videos load only when the visitor presses play.

**Logo:** `src/components/brand/Logo.tsx` draws the E STUDIO logo in `currentColor`, so the cream and burgundy versions are the same vector, recoloured by the section theme. Static copies live in `public/brand/` (`estudio-logo-cream.svg`, `estudio-logo-burgundy.svg`, `estudio-mark-*.svg`); the favicon is `src/app/icon.svg`. These are a vector trace of the brand card. Replace all of them with the official vector file when it is available.

**Colours:** the palette is defined once at the top of `src/app/globals.css` (`--wine-*`, `--red`, `--rose`, `--cream`, `--beige`).

**Real photographs:** put the file in `public/photos/`, then update its entry in `photos.ts`. Set `src`, `width`, `height` and `alt`, set `placeholder: false`, and set `position` (e.g. `"50% 30%"`) if the face or product label sits off-centre.

**Contact details:** in `site.ts`, set `contact.email` to `{ value: "you@domain.com", placeholder: false }`. Set `contact.whatsapp` with `value` as the full international number in digits only (e.g. `9665XXXXXXXX`), `display` as the formatted number, and `placeholder: false`. The email becomes a `mailto:` link and WhatsApp opens a direct chat with a prefilled message. "Start a project" uses email if set, else WhatsApp, else an Instagram DM.

**Real photography:** `public/photos/work/` holds 108 originals extracted byte-for-byte from `references/PEAK (1).pdf`. Each file's PDF page and grid position is recorded in `src/content/photo-manifest.json`. The PDF only contained ~450–540px versions, so replace a file with its full-resolution original under the same name (and update width/height in `photos.ts`) to sharpen it. The nine projects are grouped one per PDF page and have neutral titles.

**Demo content:** the generated placeholder projects are kept in `projects.ts` with `demo: true` and never appear on the public site. Commercial, food and portrait work is still needed.

**Still placeholders:** every photograph, the project titles, the biography (hidden until provided), the email and WhatsApp. Project years are optional; add `year: "2025"` to a project to show it. Only the name, role, location and Instagram (`@a.fathyphotography`) are verified.

**Regenerate placeholders:** run `npm run placeholders`. It rewrites only the entries still marked `placeholder: true`.

## Adding a project

1. Add its photos to `photos.ts`.
2. Add a project to `projects.ts`. Image order matters; the comment at the top of that file describes the sequence each discipline layout expects.
3. To feature it on Home, add frames from it to `selectedFrames` in `home.ts` with `project: "<slug>"`.

Project pages lay themselves out from photo orientation (`src/lib/compose.ts`).
