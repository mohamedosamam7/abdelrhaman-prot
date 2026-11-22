"use client";

import { useState } from "react";
import { saveProject } from "@/admin/actions";
import type { PickerItem, ProjectRow } from "@/admin/data";
import type { AdminDict, AdminLang } from "@/admin/i18n";
import { categories, projectStatuses, type ProjectDoc } from "@/cms/schema";
import { LField, MediaField, MediaPicker, MediaThumb, MoveButtons, SaveBar, TextField, Toggle, move, useSave, useUnsaved } from "./fields";

export function ProjectEditor({ t, lang, row, items }: { t: AdminDict; lang: AdminLang; row: ProjectRow; items: PickerItem[] }) {
  const [doc, setDoc] = useState<ProjectDoc>(row.draft);
  const [status, setStatus] = useState(row.status);
  const [featured, setFeatured] = useState(row.featured);
  const [picking, setPicking] = useState(false);
  const { pending, result, save } = useSave((v: { doc: ProjectDoc; status: string; featured: boolean }) => saveProject(row.id, v));
  const current = { doc, status, featured };
  const { dirty, markSaved } = useUnsaved(current, t.common.leave);
  const P = t.projects;

  return (
    <>
      <h1>{doc.title[lang] || doc.title.en || doc.slug}</h1>
      <p className="lead">{P.detailHint}</p>

      <section className="card">
        <div className="grid2">
          <TextField label={P.slug} value={doc.slug} onChange={(v) => setDoc({ ...doc, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} hint={P.slugHelp} max={80} />
          <label className="field">
            <span>{P.status}</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              {projectStatuses.map((s) => (
                <option key={s} value={s}>
                  {P.statuses[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{P.category}</span>
            <select value={doc.category} onChange={(e) => setDoc({ ...doc, category: e.target.value as ProjectDoc["category"] })}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <TextField label={P.year} value={doc.year} onChange={(v) => setDoc({ ...doc, year: v.replace(/\D/g, "").slice(0, 4) })} />
        </div>
        <Toggle label={P.featured} checked={featured} onChange={setFeatured} />
        <LField label={P.titleField} value={doc.title} onChange={(v) => setDoc({ ...doc, title: v })} t={t} max={90} />
        <LField label={P.summary} value={doc.summary} onChange={(v) => setDoc({ ...doc, summary: v })} t={t} multiline max={400} />
        <MediaField label={P.cover} value={doc.cover} items={items} t={t} allowVideo={false} onChange={(ref) => setDoc({ ...doc, cover: ref })} />
      </section>

      <section className="card" aria-labelledby="pm-h">
        <h2 id="pm-h">
          {P.media} <span className="badge">{doc.media.length}</span>
        </h2>
        <ul className="list">
          {doc.media.map((ref, i) => (
            <li key={`${ref}-${i}`}>
              <MediaThumb item={items.find((x) => x.ref === ref)} />
              <span className="grow hint">{items.find((x) => x.ref === ref)?.label ?? ref}</span>
              <MoveButtons t={t} index={i} count={doc.media.length} onMove={(a, b) => setDoc({ ...doc, media: move(doc.media, a, b) })} />
              <button type="button" className="btn small danger" onClick={() => setDoc({ ...doc, media: doc.media.filter((_, j) => j !== i) })}>
                {t.common.delete}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn small secondary" style={{ marginTop: 10 }} disabled={doc.media.length >= 60} onClick={() => setPicking(true)}>
          {P.addMedia}
        </button>
        {picking && (
          <MediaPicker
            t={t}
            items={items}
            onPick={(ref) => {
              setDoc({ ...doc, media: [...doc.media, ref] });
              setPicking(false);
            }}
            onClose={() => setPicking(false)}
          />
        )}
      </section>

      <SaveBar t={t} pending={pending} result={result} dirty={dirty} onSave={() => save(current, () => markSaved(current))}>
        <a className="btn ghost" href={`/api/preview?path=/${lang}/work/${row.slug}`} target="_blank" rel="noopener noreferrer">
          {t.common.preview} ↗
        </a>
      </SaveBar>
    </>
  );
}
