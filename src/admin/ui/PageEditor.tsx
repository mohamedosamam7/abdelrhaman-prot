"use client";

import { useState } from "react";
import { savePage } from "@/admin/actions";
import type { PickerItem } from "@/admin/data";
import type { AdminDict, AdminLang } from "@/admin/i18n";
import { allowedSections, categories, heroSlotIds, type PageDoc, type PageKey, type SectionDoc, type SectionType } from "@/cms/schema";
import { HeadingField, LField, MediaField, MoveButtons, SaveBar, TextField, move, useSave, useUnsaved } from "./fields";

type Ctx = { t: AdminDict; items: PickerItem[]; projects: { slug: string; title: string }[] };
const E = { en: "", ar: "" };
const EH = { en: { lead: "", emphasis: "" }, ar: { lead: "", emphasis: "" } };
const uid = (type: string) => `${type.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12)}-${Math.random().toString(36).slice(2, 8)}`;
const FIRST_STATIC = "static:p1-r1c4";
const introOf = (d: PageDoc) => d.intro ?? { kicker: E, title: E, lead: E };
const metaOf = (d: PageDoc) => d.meta ?? { title: E, description: E };

/** A new, valid section of each template. */
function blank(type: SectionType): SectionDoc {
  const base = { id: uid(type), hidden: false };
  switch (type) {
    case "hero":
      return { ...base, type, data: { title: E, meta: E, slots: heroSlotIds.map((id) => ({ id, media: FIRST_STATIC, focus: "50% 50%" })) } };
    case "gallery":
      return { ...base, type, data: { label: E, heading: EH, body: E, interval: 5, items: [{ id: "i1", media: FIRST_STATIC, category: "events", project: null }] } };
    case "services":
      return { ...base, type, data: { label: E, heading: EH, items: [{ key: "service", title: E, description: E, cta: E, href: "/contact" }] } };
    case "textMedia":
      return { ...base, type, data: { label: E, heading: EH, body: E, media: FIRST_STATIC, caption: E, points: [] } };
    case "featuredProjects":
      return { ...base, type, data: { label: E, heading: EH, body: E, limit: 6 } };
    case "contact":
      return { ...base, type, data: {} };
  }
}

export function PageEditor({ t, lang, pageKey, initial, items, projects }: Ctx & { lang: AdminLang; pageKey: PageKey; initial: PageDoc }) {
  const [doc, setDoc] = useState<PageDoc>(initial);
  const [adding, setAdding] = useState<SectionType | "">("");
  const { pending, result, save } = useSave((d: PageDoc) => savePage(pageKey, d));
  const { dirty, markSaved } = useUnsaved(doc, t.common.leave);
  const S = t.sections;
  const sections = doc.sections;
  const set = (i: number, s: SectionDoc) => setDoc({ ...doc, sections: sections.map((x, j) => (j === i ? s : x)) });

  const canAdd = (type: SectionType) =>
    allowedSections[pageKey].includes(type) && !((type === "hero" || type === "contact") && sections.some((s) => s.type === type));

  const add = () => {
    if (!adding) return;
    const s = blank(adding);
    // A hero always opens the page.
    setDoc({ ...doc, sections: adding === "hero" ? [s, ...sections] : [...sections, s] });
    setAdding("");
  };

  const previewPath = `/${lang}${pageKey === "home" ? "" : `/${pageKey}`}`;

  return (
    <>
      <h1>{t.pages[pageKey]}</h1>
      {pageKey !== "home" && <p className="lead">{S.system}</p>}

      {pageKey !== "home" && (
        <section className="card" aria-labelledby="pt-h">
          <h2 id="pt-h">{S.pageText}</h2>
          {pageKey === "work" && (
            <>
              <LField label={S.kicker} value={doc.intro?.kicker ?? E} onChange={(v) => setDoc({ ...doc, intro: { ...introOf(doc), kicker: v } })} t={t} max={80} />
              <LField label={S.bigTitle} value={doc.intro?.title ?? E} onChange={(v) => setDoc({ ...doc, intro: { ...introOf(doc), title: v } })} t={t} multiline max={80} />
              <LField label={S.lead} value={doc.intro?.lead ?? E} onChange={(v) => setDoc({ ...doc, intro: { ...introOf(doc), lead: v } })} t={t} multiline max={400} />
            </>
          )}
          <LField label={S.metaTitle} value={doc.meta?.title ?? E} onChange={(v) => setDoc({ ...doc, meta: { ...metaOf(doc), title: v } })} t={t} max={90} />
          <LField label={S.metaDescription} value={doc.meta?.description ?? E} onChange={(v) => setDoc({ ...doc, meta: { ...metaOf(doc), description: v } })} t={t} multiline max={200} />
        </section>
      )}

      {sections.map((s, i) => (
        <section className="card" key={s.id} aria-labelledby={`h-${s.id}`}>
          <div className="section-head">
            <h2 id={`h-${s.id}`} style={{ margin: 0 }}>
              {S.types[s.type]} {s.hidden && <span className="badge">{S.hidden}</span>}
            </h2>
            <div className="tools">
              <MoveButtons t={t} index={i} count={sections.length} onMove={(a, b) => setDoc({ ...doc, sections: move(sections, a, b) })} />
              {s.type !== "hero" && s.type !== "contact" && (
                <button
                  type="button"
                  className="btn small secondary"
                  onClick={() => setDoc({ ...doc, sections: [...sections.slice(0, i + 1), { ...structuredClone(s), id: uid(s.type) }, ...sections.slice(i + 1)] })}
                >
                  {S.duplicate}
                </button>
              )}
              <button type="button" className="btn small secondary" onClick={() => set(i, { ...s, hidden: !s.hidden })}>
                {s.hidden ? S.show : S.hide}
              </button>
              <button
                type="button"
                className="btn small danger"
                onClick={() => window.confirm(S.confirmRemove) && setDoc({ ...doc, sections: sections.filter((_, j) => j !== i) })}
              >
                {S.remove}
              </button>
            </div>
          </div>
          <SectionFields s={s} onChange={(n) => set(i, n)} ctx={{ t, items, projects }} />
        </section>
      ))}

      <section className="card">
        <h2>{S.add}</h2>
        <div className="row">
          <select value={adding} onChange={(e) => setAdding(e.target.value as SectionType)} aria-label={S.add} style={{ maxWidth: 320 }}>
            <option value="">—</option>
            {allowedSections[pageKey].map((type) => (
              <option key={type} value={type} disabled={!canAdd(type)}>
                {S.types[type]}
              </option>
            ))}
          </select>
          <button type="button" className="btn secondary" disabled={!adding} onClick={add}>
            {S.add}
          </button>
          <a className="btn ghost" href={`/api/preview?path=${previewPath}`} target="_blank" rel="noopener noreferrer">
            {t.common.preview} ↗
          </a>
        </div>
      </section>

      <SaveBar t={t} pending={pending} result={result} dirty={dirty} onSave={() => save(doc, () => markSaved(doc))} />
    </>
  );
}

function SectionFields({ s, onChange, ctx }: { s: SectionDoc; onChange: (s: SectionDoc) => void; ctx: Ctx }) {
  const { t, items, projects } = ctx;
  const S = t.sections;
  switch (s.type) {
    case "hero": {
      const d = s.data;
      const setSlot = (i: number, patch: Partial<(typeof d.slots)[number]>) =>
        onChange({ ...s, data: { ...d, slots: d.slots.map((x, j) => (j === i ? { ...x, ...patch } : x)) } });
      return (
        <>
          <LField label={S.heroTitle} value={d.title} onChange={(v) => onChange({ ...s, data: { ...d, title: v } })} t={t} max={120} />
          <LField label={S.heroMeta} value={d.meta} onChange={(v) => onChange({ ...s, data: { ...d, meta: v } })} t={t} max={160} />
          <h3>{S.slots}</h3>
          <p className="hint">{S.slotHelp}</p>
          <div className="grid2">
            {d.slots.map((slot, i) => (
              <div key={slot.id} className="card" style={{ marginBottom: 0 }}>
                <MediaField
                  label={`${slot.id} · ${slot.id.startsWith("P") ? "4:5" : "3:2"}`}
                  value={slot.media}
                  items={items}
                  t={t}
                  onChange={(ref) => setSlot(i, { media: ref })}
                />
                <TextField label={S.focus} value={slot.focus} onChange={(v) => setSlot(i, { focus: v })} hint="50% 40%" />
              </div>
            ))}
          </div>
        </>
      );
    }
    case "gallery": {
      const d = s.data;
      const setItems = (list: typeof d.items) => onChange({ ...s, data: { ...d, items: list } });
      const setItem = (i: number, patch: Partial<(typeof d.items)[number]>) => setItems(d.items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
      return (
        <>
          <LField label={S.label} value={d.label} onChange={(v) => onChange({ ...s, data: { ...d, label: v } })} t={t} max={60} />
          <HeadingField label={t.settings.heading} value={d.heading} onChange={(v) => onChange({ ...s, data: { ...d, heading: v } })} t={t} />
          <LField label={S.body} value={d.body} onChange={(v) => onChange({ ...s, data: { ...d, body: v } })} t={t} multiline max={300} />
          <TextField
            label={S.interval}
            type="number"
            value={String(d.interval)}
            onChange={(v) => onChange({ ...s, data: { ...d, interval: Math.max(3, Math.min(15, Number(v) || 5)) } })}
          />
          <h3>{S.items}</h3>
          <ul className="list">
            {d.items.map((it, i) => (
              <li key={it.id}>
                <div className="grow">
                  <MediaField label={S.media} value={it.media} items={items} t={t} onChange={(ref) => setItem(i, { media: ref })} />
                  <div className="grid2">
                    <label className="field">
                      <span>{S.category}</span>
                      <select value={it.category} onChange={(e) => setItem(i, { category: e.target.value as typeof it.category })}>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>{S.project}</span>
                      <select value={it.project ?? ""} onChange={(e) => setItem(i, { project: e.target.value || null })}>
                        <option value="">{t.common.none}</option>
                        {projects.map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <MoveButtons t={t} index={i} count={d.items.length} onMove={(a, b) => setItems(move(d.items, a, b))} />
                <button type="button" className="btn small danger" disabled={d.items.length === 1} onClick={() => setItems(d.items.filter((_, j) => j !== i))}>
                  {t.common.delete}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn small secondary"
            style={{ marginTop: 10 }}
            disabled={d.items.length >= 40}
            onClick={() => setItems([...d.items, { id: `i${Date.now().toString(36)}`, media: FIRST_STATIC, category: "events", project: null }])}
          >
            {S.addItem}
          </button>
        </>
      );
    }
    case "services": {
      const d = s.data;
      const setItems = (list: typeof d.items) => onChange({ ...s, data: { ...d, items: list } });
      const setItem = (i: number, patch: Partial<(typeof d.items)[number]>) => setItems(d.items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
      const hrefs = ["/work", "/contact", ...categories.map((c) => `/work?category=${c}`), ...d.items.map((x) => `/contact?service=${x.key}`)].filter(
        (v, n, a) => a.indexOf(v) === n,
      );
      return (
        <>
          <LField label={S.label} value={d.label} onChange={(v) => onChange({ ...s, data: { ...d, label: v } })} t={t} max={60} />
          <HeadingField label={t.settings.heading} value={d.heading} onChange={(v) => onChange({ ...s, data: { ...d, heading: v } })} t={t} />
          <h3>{S.items}</h3>
          {d.items.map((it, i) => (
            <div className="card" key={i}>
              <div className="section-head">
                <strong>{String(i + 1).padStart(2, "0")}</strong>
                <div className="tools">
                  <MoveButtons t={t} index={i} count={d.items.length} onMove={(a, b) => setItems(move(d.items, a, b))} />
                  <button type="button" className="btn small danger" disabled={d.items.length === 1} onClick={() => setItems(d.items.filter((_, j) => j !== i))}>
                    {t.common.delete}
                  </button>
                </div>
              </div>
              <LField label={S.titleField} value={it.title} onChange={(v) => setItem(i, { title: v })} t={t} max={60} />
              <LField label={S.body} value={it.description} onChange={(v) => setItem(i, { description: v })} t={t} multiline max={240} />
              <LField label={S.cta} value={it.cta} onChange={(v) => setItem(i, { cta: v })} t={t} max={30} />
              <div className="grid2">
                <label className="field">
                  <span>{S.href}</span>
                  <select value={it.href} onChange={(e) => setItem(i, { href: e.target.value })} dir="ltr">
                    {hrefs.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>
                <TextField label="key" value={it.key} onChange={(v) => setItem(i, { key: v.toLowerCase().replace(/[^a-z]/g, "") })} hint="/contact?service=…" />
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn small secondary"
            disabled={d.items.length >= 6}
            onClick={() => setItems([...d.items, { key: `service${"abcdef"[d.items.length]}`, title: E, description: E, cta: E, href: "/contact" }])}
          >
            {S.addItem}
          </button>
        </>
      );
    }
    case "textMedia": {
      const d = s.data;
      const setPoints = (list: typeof d.points) => onChange({ ...s, data: { ...d, points: list } });
      const setPoint = (i: number, patch: Partial<(typeof d.points)[number]>) => setPoints(d.points.map((x, j) => (j === i ? { ...x, ...patch } : x)));
      return (
        <>
          <LField label={S.label} value={d.label} onChange={(v) => onChange({ ...s, data: { ...d, label: v } })} t={t} max={60} />
          <HeadingField label={t.settings.heading} value={d.heading} onChange={(v) => onChange({ ...s, data: { ...d, heading: v } })} t={t} />
          <LField label={S.body} value={d.body} onChange={(v) => onChange({ ...s, data: { ...d, body: v } })} t={t} multiline max={500} />
          <MediaField label={S.media} value={d.media} items={items} t={t} onChange={(ref) => onChange({ ...s, data: { ...d, media: ref } })} />
          <LField label={S.caption} value={d.caption} onChange={(v) => onChange({ ...s, data: { ...d, caption: v } })} t={t} max={80} />
          <h3>{S.points}</h3>
          {d.points.map((p, i) => (
            <div className="card" key={i}>
              <div className="section-head">
                <strong>{String(i + 1).padStart(2, "0")}</strong>
                <div className="tools">
                  <MoveButtons t={t} index={i} count={d.points.length} onMove={(a, b) => setPoints(move(d.points, a, b))} />
                  <button type="button" className="btn small danger" onClick={() => setPoints(d.points.filter((_, j) => j !== i))}>
                    {t.common.delete}
                  </button>
                </div>
              </div>
              <LField label={S.titleField} value={p.title} onChange={(v) => setPoint(i, { title: v })} t={t} max={40} />
              <LField label={S.body} value={p.text} onChange={(v) => setPoint(i, { text: v })} t={t} max={160} />
            </div>
          ))}
          <button type="button" className="btn small secondary" disabled={d.points.length >= 4} onClick={() => setPoints([...d.points, { title: E, text: E }])}>
            {S.addPoint}
          </button>
        </>
      );
    }
    case "featuredProjects": {
      const d = s.data;
      return (
        <>
          <LField label={S.label} value={d.label} onChange={(v) => onChange({ ...s, data: { ...d, label: v } })} t={t} max={60} />
          <HeadingField label={t.settings.heading} value={d.heading} onChange={(v) => onChange({ ...s, data: { ...d, heading: v } })} t={t} />
          <LField label={S.body} value={d.body} onChange={(v) => onChange({ ...s, data: { ...d, body: v } })} t={t} multiline max={300} />
          <TextField
            label={S.limit}
            type="number"
            value={String(d.limit)}
            onChange={(v) => onChange({ ...s, data: { ...d, limit: Math.max(2, Math.min(9, Number(v) || 6)) } })}
          />
        </>
      );
    }
    case "contact":
      return (
        <p className="hint">
          {t.settings.contact} → {t.nav.settings}
        </p>
      );
  }
}
