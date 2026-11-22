"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { importStatic, publishAll } from "@/admin/actions";
import type { AdminDict, AdminLang } from "@/admin/i18n";
import { ResultError, useSave } from "./fields";

export function Overview({ t, lang, empty, changes, missing }: { t: AdminDict; lang: AdminLang; empty: boolean; changes: string[]; missing: string[] }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const pub = useSave(publishAll);
  const imp = useSave(async () => importStatic());

  return (
    <>
      <h1>{t.overview.title}</h1>
      <p className="lead">{t.title}</p>

      {empty && (
        <section className="card" aria-labelledby="import-h">
          <h2 id="import-h">{t.overview.importTitle}</h2>
          <p className="hint">{t.overview.importBody}</p>
          <button type="button" className="btn" disabled={imp.pending} onClick={() => imp.save(undefined as never, () => router.refresh())}>
            {imp.pending ? t.common.loading : t.overview.importRun}
          </button>
          {imp.result?.ok && <p className="status ok">{t.overview.importDone}</p>}
          {imp.result && !imp.result.ok && <ResultError t={t} result={imp.result} />}
        </section>
      )}

      <section className="card" aria-labelledby="pub-h">
        <h2 id="pub-h">{changes.length ? t.overview.unpublished : t.overview.upToDate}</h2>
        {!!changes.length && (
          <ul>
            {changes.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
        <label className="field">
          <span>{t.overview.publishNote}</span>
          <input type="text" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
        </label>
        <div className="row">
          <button type="button" className="btn" disabled={pub.pending || !changes.length} onClick={() => pub.save(note, () => router.refresh())}>
            {pub.pending ? t.overview.publishing : t.overview.publish}
          </button>
          <a className="btn secondary" href={`/api/preview?path=/${lang}`} target="_blank" rel="noopener noreferrer">
            {t.overview.preview}
          </a>
        </div>
        <div role="status" aria-live="polite">
          {pub.result?.ok && <p className="status ok">{t.overview.published}</p>}
          {pub.result && !pub.result.ok && <ResultError t={t} result={pub.result} />}
        </div>
      </section>

      <section className="card" aria-labelledby="miss-h">
        <h2 id="miss-h">
          {t.overview.missing} <span className="badge">{missing.length}</span>
        </h2>
        {missing.length ? (
          <ul dir="ltr" style={{ maxHeight: 240, overflow: "auto" }}>
            {missing.slice(0, 100).map((m) => (
              <li key={m}>
                <code>{m}</code>
              </li>
            ))}
          </ul>
        ) : (
          <p className="hint">✓</p>
        )}
      </section>
    </>
  );
}
