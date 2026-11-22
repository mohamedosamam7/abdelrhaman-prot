/**
 * PHOTO REGISTRY — the single source of truth for every photograph on the site.
 *
 * Two kinds of entries:
 *   • work(...)  the client's real photography, extracted from the supplied
 *                portfolio PDF (references/PEAK (1).pdf). Source page and grid
 *                position for each file are in src/content/photo-manifest.json.
 *                These are the only files used on the public site.
 *   • ph(...)    generated demo placeholders. Kept for the demo projects in
 *                projects.ts, which are hidden from the public listing.
 *
 * The PDF only contained small versions (≈450–540px wide). To upgrade a
 * frame, drop the full-resolution original into /public/photos/work under
 * the same name and update its width/height here.
 *
 * To publish another real photograph:
 *
 *   1. Drop the file into /public/photos (any name, ideally ≥ 2000px long edge).
 *   2. Update `src`, `width`, `height` and `alt` for that entry.
 *   3. Set `placeholder: false` (stops `npm run placeholders` overwriting it).
 *   4. Adjust `position` if the subject (a face, a label) sits off-centre —
 *      it is passed to CSS `object-position` wherever the image is cropped.
 *
 * Nothing else in the codebase needs to change.
 *
 * NOTE: keep this file free of imports — the placeholder generator script
 * (scripts/generate-placeholders.ts) loads it directly with Node.
 */

export type Subject =
  | "product"
  | "food"
  | "table"
  | "interior"
  | "event"
  | "crowd"
  | "portrait"
  | "bts"
  | "detail";

export type Tone = "commercial" | "food" | "events" | "people" | "studio";

export interface Photo {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position used when the frame crops the photograph. */
  position?: string;
  /** True while this entry still points at a generated placeholder. */
  placeholder: boolean;
  /** Where a real photograph came from (see photo-manifest.json). */
  source?: string;
  /** Placeholder generator hints — ignored once a real photo is supplied. */
  subject?: Subject;
  tone?: Tone;
  /** Dashboard media only: Arabic alt text (static photos use photo-alt-ar.ts). */
  altAr?: string;
  /** Dashboard media only: "video" items carry the file in `videoSrc`; `src` is the poster. */
  kind?: "image" | "video";
  videoSrc?: string;
}

const LONG_EDGE = 1800;

function dims(ratio: string) {
  const [w, h] = ratio.split(":").map(Number);
  return w >= h
    ? { width: LONG_EDGE, height: Math.round((LONG_EDGE * h) / w) }
    : { width: Math.round((LONG_EDGE * w) / h), height: LONG_EDGE };
}

function ph(
  id: string,
  ratio: string,
  subject: Subject,
  tone: Tone,
  alt: string,
  position?: string,
): Photo {
  return {
    id,
    src: `/photos/${id}.jpg`,
    alt: `Placeholder — ${alt}`,
    ...dims(ratio),
    position,
    placeholder: true,
    subject,
    tone,
  };
}

/** A real photograph extracted from the client's portfolio PDF. */
function work(id: string, width: number, height: number, alt: string, position?: string): Photo {
  const [, page] = id.match(/^p(\d+)-/) ?? [];
  return { id, src: `/photos/work/${id}.jpg`, alt, width, height, position, placeholder: false, source: `PEAK (1).pdf, page ${page}` };
}

const list: Photo[] = [
  // ── Client photography (PEAK portfolio PDF, pages 1–9) ────────────────
  work("p1-r1c3", 512, 427, "Host in a red shemagh gesturing guests through a lit heritage district at night"),
  work("p1-r1c1", 477, 427, "Smiling host in a white shemagh under blue evening light"),
  work("p1-r1c4", 477, 427, "Host in a red shemagh smiling beside warm lanterns at night"),
  work("p1-r1c5", 478, 427, "Three hosts in white shemaghs standing in a lit lane at night"),
  work("p1-r2c3", 476, 427, "Mud-brick heritage building lit warmly at night"),
  work("p1-r2c4", 449, 427, "Host with outstretched arm in front of a lit heritage gateway"),
  work("p1-r3c1", 496, 427, "Host in a white shemagh laughing in blue light"),
  work("p1-r3c2", 509, 427, "Host in a red shemagh guiding guests past a reed screen"),
  work("p1-r3c3", 528, 427, "Illuminated horse emblem on a wall in a night courtyard"),
  work("p1-r3c5", 498, 427, "Host in a red shemagh at a lit information table among palm trees"),
  work("p1-r1c2", 487, 427, "Host in a white shemagh greeting a guest in low light"),
  work("p1-r2c1", 449, 427, "Host in a white shemagh helping a guest with a phone by a mud-brick wall"),
  work("p2-r2c4", 482, 427, "Three hosts in red shemaghs standing together before a floodlit mud-brick wall"),
  work("p2-r1c1", 461, 374, "Host in a red shemagh welcoming guests on a terrace overlooking the old town"),
  work("p2-r1c2", 462, 374, "Host in an orange lanyard greeting a guest against a warm-lit wall"),
  work("p2-r1c3", 491, 374, "Host standing before a building wrapped in golden projection mapping"),
  work("p2-r1c4", 493, 402, "Host in a red shemagh gesturing in warm lantern light"),
  work("p2-r2c1", 449, 427, "Host directing guests down a lit old-town alley"),
  work("p2-r2c2", 448, 427, "Silhouette of a guest before a glowing cylinder of lanterns"),
  work("p2-r2c5", 450, 427, "Host guiding a guest along a lit mud-brick path"),
  work("p2-r3c2", 448, 369, "Host holding a programme in front of an orange festival wall"),
  work("p2-r3c3", 490, 374, "Smiling host in a red shemagh in a busy lit lane"),
  work("p2-r3c4", 449, 370, "Host in a red shemagh gesturing toward a mud-brick passage"),
  work("p2-r3c5", 456, 374, "Host pointing the way along a softly lit corridor"),
  work("p3-r1c2", 507, 427, "Staff at a fan zone desk with young supporters in football shirts"),
  work("p3-r1c3", 540, 427, "Security team standing at a town-centre fan zone entrance"),
  work("p3-r1c4", 505, 427, "Visitors checking in at a curved fan zone reception desk"),
  work("p3-r1c5", 506, 427, "Fan zone staff member in a black vest before a large screen"),
  work("p3-r2c1", 449, 427, "Young visitors playing table football under coloured lights"),
  work("p3-r2c2", 480, 458, "Staff member checking a phone beside a fan zone sign"),
  work("p3-r2c3", 505, 450, "Staff member at a fan zone counter beneath a lit arch"),
  work("p3-r2c4", 472, 450, "Visitor in a black abaya smiling beneath the fan zone arch at night"),
  work("p3-r2c5", 475, 450, "Two fan zone staff members talking with children"),
  work("p3-r3c2", 479, 405, "Smiling fan zone staff member under neon ceiling lights"),
  work("p3-r3c4", 514, 405, "Young volunteer holding a football at the fan zone"),
  work("p3-r3c5", 476, 405, "Fan zone staff member explaining something in blue light"),
  work("p4-r2c3", 482, 427, "Matchday staff team in blue posing together on the pitch"),
  work("p4-r1c1", 502, 427, "Staff member in a blue hoodie helping supporters with tickets"),
  work("p4-r1c2", 505, 427, "Matchday staff in blue giving thumbs up in the stands"),
  work("p4-r1c3", 536, 427, "Supporters filling the stands of an indoor arena"),
  work("p4-r1c4", 502, 427, "Staff member in a blue hoodie guiding a guest at the stairs"),
  work("p4-r1c5", 503, 427, "Staff member in a blue hoodie checking a supporter's ticket"),
  work("p4-r2c2", 448, 427, "Floodlit arena roof above a stadium gangway"),
  work("p4-r2c4", 448, 427, "Supporters walking through a lit stadium tunnel"),
  work("p4-r3c2", 456, 374, "Staff member in a blue shirt walking past arena signage"),
  work("p4-r3c3", 490, 374, "Two staff members checking a phone with the pitch behind them"),
  work("p4-r3c4", 456, 374, "Staff member helping supporters in white thobes with their phones"),
  work("p4-r3c5", 456, 374, "Staff in blue walking across the pitch below the stands"),
  work("p5-r2c3", 482, 427, "Three event staff in vests standing before a red-lit stage"),
  work("p5-r1c1", 496, 427, "Smiling staff member in a red shemagh helping a guest at a concert"),
  work("p5-r1c2", 500, 427, "Staff member in a red shemagh beneath strings of stage lights"),
  work("p5-r1c4", 496, 427, "Staff member scanning a guest's phone inside the venue"),
  work("p5-r1c5", 497, 427, "Staff member in a vest guiding guests past red stage lights"),
  work("p5-r2c1", 449, 427, "Portrait of a staff member in a hijab against bokeh lights"),
  work("p5-r2c2", 448, 427, "Staff member in a vest standing before a lit concert stage"),
  work("p5-r2c4", 448, 427, "Staff members checking tickets on phones in a venue corridor"),
  work("p5-r3c1", 454, 374, "Staff member in a red shemagh checking a phone in coloured light"),
  work("p5-r3c2", 454, 374, "Two guests talking under warm stage lights"),
  work("p5-r3c3", 488, 374, "Staff member in a vest standing among guests at night"),
  work("p5-r3c4", 454, 374, "Staff member helping a guest with seating in a busy hall"),
  work("p6-r1c3", 537, 427, "Wide view of a packed arena facing a lit wrestling stage"),
  work("p6-r1c1", 503, 427, "Ushers in white vests at the edge of a crowded stand"),
  work("p6-r1c4", 503, 427, "Usher pointing the way for a guest in a white thobe"),
  work("p6-r1c5", 505, 427, "Wrestler walking through a backstage corridor with a title belt"),
  work("p6-r2c1", 449, 427, "Usher directing guests below a bright arena stage"),
  work("p6-r2c3", 482, 427, "Arena stage dressed for a wrestling event under laser lights"),
  work("p6-r2c4", 448, 427, "Wrestler posing on the ropes under blue laser beams"),
  work("p6-r2c5", 448, 427, "Guest with curly hair watching from a crowded arena stand"),
  work("p6-r3c2", 505, 427, "Staff member in a white vest beside an illuminated merchandise stand"),
  work("p6-r3c3", 542, 427, "Staff member in an orange vest on the phone under laser lights"),
  work("p6-r3c4", 505, 427, "Usher standing at the top of arena stairs"),
  work("p6-r3c5", 506, 427, "Usher in a white vest standing in front of a packed arena"),
  work("p7-r2c2", 448, 427, "Giant illuminated cat sculpture at a festival entrance at night"),
  work("p7-r1c1", 502, 427, "Staff member silhouetted against neon festival towers"),
  work("p7-r1c2", 505, 427, "Staff member pointing the way for a visitor in purple light"),
  work("p7-r1c3", 536, 427, "Staff members talking under colourful festival lights"),
  work("p7-r1c5", 503, 427, "Staff member scanning a visitor's wristband"),
  work("p7-r2c1", 449, 427, "Portrait of a staff member with a lanyard before neon lights"),
  work("p7-r2c4", 448, 427, "Staff member explaining directions in neon light"),
  work("p7-r2c5", 448, 427, "Three staff members talking in a festival walkway"),
  work("p7-r3c1", 502, 427, "Staff member checking a visitor's ticket by a railing"),
  work("p7-r3c2", 502, 427, "Two staff members gesturing toward the festival grounds"),
  work("p7-r3c3", 538, 427, "Staff member directing crowds across the festival plaza"),
  work("p7-r3c4", 502, 427, "Staff member standing between two lit festival towers"),
  work("p8-r1c3", 476, 374, "Parking marshal raising a green light baton at dusk"),
  work("p8-r1c1", 445, 374, "Visitors passing through a lit security gate at night"),
  work("p8-r1c2", 447, 374, "Two staff members comparing notes on a phone"),
  work("p8-r1c4", 445, 374, "Staff member in a red shemagh briefing a group of visitors"),
  work("p8-r1c5", 446, 374, "Marshal in a high-visibility vest giving directions"),
  work("p8-r2c2", 448, 427, "Staff member in a red shemagh pointing the way at night"),
  work("p8-r2c3", 524, 476, "Close detail of a staff member's padded vest and lanyard"),
  work("p8-r2c5", 448, 427, "Staff member helping visitors with their phones"),
  work("p8-r3c1", 491, 415, "Marshal waving a green light baton toward traffic"),
  work("p8-r3c2", 445, 374, "Supervisor talking into a radio at night"),
  work("p8-r3c3", 479, 374, "Staff member in a red shemagh speaking into a radio"),
  work("p8-r3c4", 445, 374, "Marshal in a high-visibility vest directing a car"),
  work("p9-r2c3", 482, 427, "Padel match in progress on a blue court below a glass hospitality box"),
  work("p9-r1c1", 445, 374, "Smiling staff member against a colourful painted wall"),
  work("p9-r1c2", 447, 374, "Staff member standing at the edge of an outdoor padel venue"),
  work("p9-r1c3", 510, 374, "Players competing on a blue padel court"),
  work("p9-r1c4", 445, 374, "Staff member handing a lanyard to a guest courtside"),
  work("p9-r2c1", 449, 427, "Portrait of a staff member with crossed arms against an orange wall"),
  work("p9-r2c2", 448, 427, "Staff member standing in front of a crowded padel stand"),
  work("p9-r2c4", 482, 427, "Staff member helping spectators on the stadium steps at night"),
  work("p9-r2c5", 448, 427, "Staff member guiding guests courtside at night"),
  work("p9-r3c1", 445, 374, "Staff member in sunglasses beside a padel court"),
  work("p9-r3c3", 460, 374, "Padel player walking out to the court in blue light"),
  work("p9-r3c5", 445, 374, "Staff member in front of a wall of padel balls"),

  // ── Demo placeholders (hidden from the public site) ───────────────────
  // ── Studio / photographer ─────────────────────────────────────────────
  ph("studio-bts", "4:5", "bts", "studio", "Abdelrahman Fathy photographing on set", "50% 35%"),
  ph("studio-portrait", "3:4", "portrait", "studio", "Portrait of Abdelrahman Fathy", "50% 28%"),

  // ── Commercial & Product ──────────────────────────────────────────────
  ph("commercial-01-01", "3:2", "product", "commercial", "Product hero on a seamless backdrop"),
  ph("commercial-01-02", "4:5", "product", "commercial", "Product standing in soft side light"),
  ph("commercial-01-03", "4:5", "detail", "commercial", "Close detail of product texture"),
  ph("commercial-01-04", "16:9", "product", "commercial", "Wide product composition"),
  ph("commercial-01-05", "1:1", "detail", "commercial", "Detail of product finish"),
  ph("commercial-01-06", "2:3", "product", "commercial", "Vertical product study"),

  ph("commercial-02-01", "4:5", "product", "commercial", "Product series hero"),
  ph("commercial-02-02", "3:2", "product", "commercial", "Product group arrangement"),
  ph("commercial-02-03", "1:1", "detail", "commercial", "Macro detail of product surface"),
  ph("commercial-02-04", "2:3", "product", "commercial", "Single product in hard light"),
  ph("commercial-02-05", "16:9", "detail", "commercial", "Wide detail with shadow play"),

  // ── Food & Hospitality ────────────────────────────────────────────────
  ph("food-01-01", "4:5", "food", "food", "Plated dish photographed from above"),
  ph("food-01-02", "3:2", "table", "food", "Set table in warm evening light"),
  ph("food-01-03", "1:1", "detail", "food", "Close detail of garnish"),
  ph("food-01-04", "2:3", "interior", "food", "Dining room atmosphere"),
  ph("food-01-05", "16:9", "table", "food", "Wide table scene with shared dishes"),
  ph("food-01-06", "4:5", "food", "food", "Dessert plated from above"),

  ph("food-02-01", "3:2", "interior", "food", "Hospitality interior at dusk"),
  ph("food-02-02", "4:5", "food", "food", "Signature dish from above"),
  ph("food-02-03", "2:3", "detail", "food", "Drink detail on the bar"),
  ph("food-02-04", "1:1", "food", "food", "Small plate detail"),
  ph("food-02-05", "16:9", "table", "food", "Long table prepared for guests"),

  // ── Events & Experiences (ordered as a story) ─────────────────────────
  ph("events-01-01", "21:9", "event", "events", "Establishing view of the venue"),
  ph("events-01-02", "4:5", "portrait", "events", "Guest in conversation", "50% 30%"),
  ph("events-01-03", "3:2", "crowd", "events", "Guests arriving"),
  ph("events-01-04", "1:1", "detail", "events", "Detail of event styling"),
  ph("events-01-05", "4:5", "detail", "events", "Hands and details between moments"),
  ph("events-01-06", "3:2", "crowd", "events", "Crowd atmosphere under stage light"),
  ph("events-01-07", "2:3", "portrait", "events", "Speaker on stage", "50% 30%"),
  ph("events-01-08", "16:9", "event", "events", "Hero moment of the evening"),

  ph("events-02-01", "16:9", "event", "events", "Venue before doors open"),
  ph("events-02-02", "4:5", "portrait", "events", "Host portrait during the event", "50% 30%"),
  ph("events-02-03", "1:1", "detail", "events", "Detail of a welcome table"),
  ph("events-02-04", "3:2", "crowd", "events", "Audience reacting"),
  ph("events-02-05", "2:3", "crowd", "events", "Movement on the floor"),
  ph("events-02-06", "21:9", "event", "events", "Closing moment"),

  // ── People & Portraits ────────────────────────────────────────────────
  ph("people-01-01", "4:5", "portrait", "people", "Portrait in window light", "50% 30%"),
  ph("people-01-02", "2:3", "portrait", "people", "Standing portrait", "50% 25%"),
  ph("people-01-03", "2:3", "portrait", "people", "Profile portrait", "50% 28%"),
  ph("people-01-04", "3:2", "portrait", "people", "Environmental portrait", "40% 35%"),
  ph("people-01-05", "4:5", "detail", "people", "Detail of hands"),

  ph("people-02-01", "3:4", "portrait", "people", "Close portrait against a dark backdrop", "50% 30%"),
  ph("people-02-02", "4:5", "portrait", "people", "Seated portrait", "50% 30%"),
  ph("people-02-03", "3:2", "portrait", "people", "Wide portrait in context", "45% 35%"),
  ph("people-02-04", "2:3", "portrait", "people", "Full-length portrait", "50% 22%"),
];

export const photos: Record<string, Photo> = Object.fromEntries(
  list.map((p) => [p.id, p]),
);

export const allPhotos = list;

export function photo(id: string): Photo {
  const p = photos[id];
  if (!p) throw new Error(`Unknown photo id "${id}" — add it to src/content/photos.ts`);
  return p;
}
