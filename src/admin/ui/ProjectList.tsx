"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createProject, deleteDraftProject, reorderProjects } from "@/admin/actions";
import type { PickerItem } from "@/admin/data";
import type { AdminDict } from "@/admin/i18n";
import { MediaThumb, MoveButtons, ResultError, move, useSave } from "./fields";

interface Row {
  id: string;
  slug: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  title: string;
  count: number;
  cover?: PickerItem;
  neverPublished: boolean;
}

export function ProjectList({ t, rows: initial }: { t: AdminDict; rows: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const create = useSave(createProject);
  const order = useSave(reorderProjects);
  const del = useSave(deleteDraftProject);
  const P = t.projects;

  const reorder = (from: number, to: number) => {
    const next = move(rows, from, to);
    setRows(next);
    order.save(next.map((r) => r.id));
  };

  return (
    <>
      <h1>{P.title}</h1>
      <p className="lead">{P.detailHint}</p>

      <section className="card" aria-labelledby="new-h">
        <h2 id="new-h">{P.new}</h2>
        <div className="grid2">
          <label className="field">
            <span>{P.titleField} ({t.common.english})</span>
            <input type="text" dir="ltr" value={title} maxLength={90} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="field">
            <span>{P.slug}</span>
            <input type="text" dir="ltr" value={slug} maxLength={80} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
            <small className="hint">{P.slugHelp}</small>
          </label>
        </div>
        <button
          type="button"
          className="btn"
          disabled={create.pending || !slug || !title}
          onClick={() =>
            create.save({ slug, title }, () => {
              setSlug("");
              setTitle("");
              router.refresh();
            })
          }
        >
          {P.create}
        </button>
        {create.result && !create.result.ok && <ResultError t={t} result={create.result} />}
        {create.result?.ok && "id" in create.result && (
          <p className="status ok">
            <Link href={`/admin/projects/${create.result.id}`} prefetch={false}>{P.title} →</Link>
          </p>
        )}
      </section>

      {rows.length === 0 ? (
        <p>{P.noProjects}</p>
      ) : (
        <ul className="list">
          {rows.map((r, i) => (
            <li key={r.id}>
              <MediaThumb item={r.cover} />
              <div className="grow">
                <Link href={`/admin/projects/${r.id}`} prefetch={false}>
                  <strong>{r.title}</strong>
                </Link>
                <div className="hint" dir="ltr" style={{ textAlign: "start" }}>
                  /{r.slug} · {r.count}
                </div>
              </div>
              <span className="badge">{P.statuses[r.status]}</span>
              {r.featured && <span className="badge">★ {P.featured}</span>}
              <MoveButtons t={t} index={i} count={rows.length} onMove={reorder} />
              {r.neverPublished && r.status === "draft" && (
                <button
                  type="button"
                  className="btn small danger"
                  onClick={() => window.confirm(t.common.confirmDelete) && del.save(r.id, () => setRows(rows.filter((x) => x.id !== r.id)))}
                >
                  {t.common.delete}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <div role="status" aria-live="polite">
        {order.result && !order.result.ok && <ResultError t={t} result={order.result} />}
        {del.result && !del.result.ok && <ResultError t={t} result={del.result} />}
      </div>
    </>
  );
}
