/**
 * Generates clearly labelled placeholder photographs for every entry in
 * src/content/photos.ts that still has `placeholder: true`.
 *
 *   npm run placeholders
 *
 * Each placeholder is a tonal "scene" hinting at the intended subject
 * (product, plate, portrait silhouette, stage light…) so layouts, crops and
 * object-position can be judged before real photography is dropped in.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { allPhotos, type Photo, type Tone } from "../src/content/photos.ts";

const OUT = join(import.meta.dirname, "..", "public", "photos");

const palettes: Record<Tone, { bg: [string, string]; key: string; ink: string; accents: string[] }> = {
  commercial: { bg: ["#1d1d1f", "#5b5853"], key: "#e9e4da", ink: "#121212", accents: ["#b9b2a6", "#7d8790", "#c8b79a", "#3f4a52"] },
  food: { bg: ["#24150d", "#7a4b2a"], key: "#f3d9b0", ink: "#160c06", accents: ["#b4502a", "#6c7a37", "#e8ddc9", "#d39a3f"] },
  events: { bg: ["#06070c", "#1b2033"], key: "#f2c88c", ink: "#030306", accents: ["#f2c88c", "#7f95e6", "#d0624a", "#e9e2d0"] },
  people: { bg: ["#1c1714", "#6e6158"], key: "#efe2d2", ink: "#0f0b09", accents: ["#a77d62", "#3d3029", "#cfb79f", "#58483f"] },
  studio: { bg: ["#121212", "#4a4540"], key: "#f0e8dc", ink: "#0a0a0a", accents: ["#8b8378", "#2a2a2a", "#c9bda9", "#5c554c"] },
};

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function scene(p: Photo): string {
  const W = p.width;
  const H = p.height;
  const r = rng(p.id);
  const pal = palettes[p.tone ?? "studio"];
  const m = Math.min(W, H);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const kx = (0.2 + r() * 0.6) * W;
  const ky = (0.1 + r() * 0.4) * H;
  let body = "";

  switch (p.subject) {
    case "product": {
      const floor = H * (0.62 + r() * 0.12);
      body += `<rect y="${floor}" width="${W}" height="${H - floor}" fill="${pal.bg[0]}" opacity=".55" filter="url(#b3)"/>`;
      const n = 1 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const w = m * (0.13 + r() * 0.12);
        const h = w * (1.4 + r() * 1.4);
        const x = W / 2 + (i - (n - 1) / 2) * w * 1.35 - w / 2;
        const c = pick(pal.accents);
        body += `<ellipse cx="${x + w / 2}" cy="${floor}" rx="${w * 0.9}" ry="${w * 0.12}" fill="#000" opacity=".5" filter="url(#b2)"/>`;
        body += `<rect x="${x}" y="${floor - h}" width="${w}" height="${h}" rx="${w * (r() > 0.5 ? 0.12 : 0.5)}" fill="${c}"/>`;
        body += `<rect x="${x + w * 0.14}" y="${floor - h * 0.94}" width="${w * 0.1}" height="${h * 0.86}" rx="${w * 0.05}" fill="#fff" opacity=".28" filter="url(#b1)"/>`;
      }
      break;
    }
    case "food": {
      const cx = W * (0.42 + r() * 0.16);
      const cy = H * (0.42 + r() * 0.16);
      const R = m * (0.3 + r() * 0.06);
      body += `<circle cx="${cx + R * 0.06}" cy="${cy + R * 0.08}" r="${R * 1.02}" fill="#000" opacity=".45" filter="url(#b2)"/>`;
      body += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${pal.accents[2]}"/>`;
      body += `<circle cx="${cx}" cy="${cy}" r="${R * 0.74}" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="${R * 0.02}"/>`;
      for (let i = 0; i < 9; i++) {
        const a = r() * Math.PI * 2;
        const d = r() * R * 0.38;
        body += `<circle cx="${cx + Math.cos(a) * d}" cy="${cy + Math.sin(a) * d}" r="${R * (0.08 + r() * 0.16)}" fill="${pick([pal.accents[0], pal.accents[1], pal.accents[3]])}" opacity=".9" filter="url(#b1)"/>`;
      }
      const bx = cx + R * 1.25 * (r() > 0.5 ? 1 : -1);
      body += `<circle cx="${bx}" cy="${cy - R * 0.9}" r="${R * 0.32}" fill="${pal.accents[2]}" opacity=".85"/>`;
      body += `<circle cx="${bx}" cy="${cy - R * 0.9}" r="${R * 0.2}" fill="${pal.accents[3]}" filter="url(#b1)"/>`;
      body += `<rect x="${cx - R * 1.32}" y="${cy - R * 0.7}" width="${R * 0.05}" height="${R * 1.5}" rx="${R * 0.03}" fill="#d9d2c6" opacity=".7"/>`;
      break;
    }
    case "table":
    case "interior": {
      const t = H * (0.58 + r() * 0.1);
      for (let i = 0; i < 4; i++) {
        body += `<circle cx="${W * (0.12 + i * 0.26 + r() * 0.05)}" cy="${H * (0.12 + r() * 0.2)}" r="${m * (0.05 + r() * 0.06)}" fill="${pal.key}" opacity=".55" filter="url(#b3)"/>`;
      }
      if (p.subject === "interior") {
        for (let i = 0; i < 5; i++) {
          const x = W * (0.08 + i * 0.2);
          body += `<rect x="${x}" y="${t - H * 0.24}" width="${W * 0.07}" height="${H * 0.36}" rx="${W * 0.01}" fill="${pal.ink}" opacity=".75"/>`;
        }
      }
      body += `<rect y="${t}" width="${W}" height="${H - t}" fill="${pal.accents[3]}" opacity=".35"/>`;
      body += `<rect y="${t}" width="${W}" height="${m * 0.012}" fill="${pal.key}" opacity=".35"/>`;
      for (let i = 0; i < 5; i++) {
        const x = W * (0.1 + i * 0.2 + r() * 0.04);
        const rr = m * (0.05 + r() * 0.03);
        body += `<ellipse cx="${x}" cy="${t + (H - t) * 0.4}" rx="${rr * 1.6}" ry="${rr * 0.5}" fill="${pal.accents[2]}" opacity=".85"/>`;
        body += `<ellipse cx="${x}" cy="${t + (H - t) * 0.38}" rx="${rr}" ry="${rr * 0.28}" fill="${pick(pal.accents)}" filter="url(#b1)"/>`;
      }
      break;
    }
    case "event":
    case "crowd": {
      const beams = 3 + Math.floor(r() * 3);
      for (let i = 0; i < beams; i++) {
        const sx = W * (0.15 + r() * 0.7);
        const spread = W * (0.08 + r() * 0.12);
        const ex = sx + (r() - 0.5) * W * 0.4;
        body += `<polygon points="${sx},0 ${ex - spread},${H} ${ex + spread},${H}" fill="${pick([pal.accents[0], pal.accents[1]])}" opacity="${0.1 + r() * 0.14}" filter="url(#b3)"/>`;
      }
      for (let i = 0; i < 26; i++) {
        body += `<circle cx="${r() * W}" cy="${r() * H * 0.6}" r="${m * (0.01 + r() * 0.035)}" fill="${pick(pal.accents)}" opacity="${0.2 + r() * 0.5}" filter="url(#b2)"/>`;
      }
      const rows = p.subject === "crowd" ? 3 : 1;
      for (let row = 0; row < rows; row++) {
        const y = H * (0.8 + row * 0.08);
        const s = m * (0.05 + row * 0.02);
        for (let x = -s; x < W + s; x += s * (1.4 + r() * 0.6)) {
          body += `<circle cx="${x}" cy="${y - s * 1.2}" r="${s * 0.55}" fill="${pal.ink}"/>`;
          body += `<rect x="${x - s}" y="${y - s * 0.6}" width="${s * 2}" height="${H}" rx="${s * 0.8}" fill="${pal.ink}"/>`;
        }
      }
      break;
    }
    case "portrait":
    case "bts": {
      // Head sits around the upper third — matches the default object-position.
      const cx = W * 0.5;
      const hy = H * 0.34;
      const hr = m * 0.15;
      body += `<circle cx="${cx}" cy="${hy}" r="${hr * 2.4}" fill="${pal.key}" opacity=".18" filter="url(#b3)"/>`;
      body += `<path d="M ${cx - hr * 2.6} ${H} C ${cx - hr * 2.5} ${hy + hr * 2.2}, ${cx - hr * 1.2} ${hy + hr * 1.5}, ${cx} ${hy + hr * 1.45} C ${cx + hr * 1.2} ${hy + hr * 1.5}, ${cx + hr * 2.5} ${hy + hr * 2.2}, ${cx + hr * 2.6} ${H} Z" fill="${pal.ink}"/>`;
      body += `<rect x="${cx - hr * 0.42}" y="${hy + hr * 0.6}" width="${hr * 0.84}" height="${hr * 1.1}" fill="${pal.ink}"/>`;
      body += `<ellipse cx="${cx}" cy="${hy}" rx="${hr * 0.86}" ry="${hr * 1.06}" fill="${pal.ink}"/>`;
      body += `<ellipse cx="${cx + hr * 0.5}" cy="${hy - hr * 0.1}" rx="${hr * 0.4}" ry="${hr * 0.9}" fill="${pal.accents[0]}" opacity=".35" filter="url(#b2)"/>`;
      if (p.subject === "bts") {
        body += `<rect x="${cx - hr * 1.1}" y="${hy - hr * 0.45}" width="${hr * 1.3}" height="${hr * 0.9}" rx="${hr * 0.1}" fill="#050505"/>`;
        body += `<circle cx="${cx - hr * 0.6}" cy="${hy}" r="${hr * 0.34}" fill="#1c1c1c" stroke="${pal.key}" stroke-opacity=".3" stroke-width="${hr * 0.04}"/>`;
      }
      break;
    }
    default: {
      // detail / macro — big soft forms and a line of texture
      for (let i = 0; i < 7; i++) {
        body += `<circle cx="${r() * W}" cy="${r() * H}" r="${m * (0.1 + r() * 0.3)}" fill="${pick(pal.accents)}" opacity="${0.35 + r() * 0.5}" filter="url(#b3)"/>`;
      }
      const lines = 18;
      for (let i = 0; i < lines; i++) {
        const y = H * (0.3 + (i / lines) * 0.5);
        body += `<line x1="${W * 0.1}" y1="${y}" x2="${W * 0.9}" y2="${y + H * 0.04}" stroke="${pal.key}" stroke-opacity="${0.04 + r() * 0.08}" stroke-width="${m * 0.004}"/>`;
      }
    }
  }

  const label = `PLACEHOLDER  ·  ${p.id.toUpperCase()}  ·  ${p.subject?.toUpperCase()}`;
  const fs = Math.max(14, Math.round(m * 0.022));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${r() > 0.5 ? 1 : 0}" y2="1">
      <stop offset="0" stop-color="${pal.bg[0]}"/><stop offset="1" stop-color="${pal.bg[1]}"/>
    </linearGradient>
    <radialGradient id="key" cx="${kx / W}" cy="${ky / H}" r=".7">
      <stop offset="0" stop-color="${pal.key}" stop-opacity=".5"/><stop offset="1" stop-color="${pal.key}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx=".5" cy=".5" r=".75">
      <stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/>
    </radialGradient>
    <filter id="b1" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${m * 0.006}"/></filter>
    <filter id="b2" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${m * 0.02}"/></filter>
    <filter id="b3" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${m * 0.06}"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${Math.floor(r() * 99)}"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#key)"/>
  ${body}
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity=".07"/>
  <text x="${fs * 1.6}" y="${H - fs * 1.6}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="${fs}" letter-spacing="${fs * 0.14}" fill="#fff" fill-opacity=".72">${label}</text>
</svg>`;
}

await mkdir(OUT, { recursive: true });
const targets = allPhotos.filter((p) => p.placeholder);
for (const p of targets) {
  await sharp(Buffer.from(scene(p)))
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(OUT, `${p.id}.jpg`));
  process.stdout.write(".");
}
console.log(`\nGenerated ${targets.length} placeholders → public/photos`);
