"use client";

import { restoreRevision } from "@/admin/actions";
import type { AdminDict, AdminLang } from "@/admin/i18n";
import { ResultError, useSave } from "./fields";

interface Row {
  id: number;
  entity: string;
  entity_key: string;
  note: string | null;
  created_at: string;
}

export function History({ t, lang, rows }: { t: AdminDict; lang: AdminLang; rows: Row[] }) {
  const restore = useSave(restoreRevision);
  const H = t.history;
  const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh" });
  return (
    <>
      <h1>{H.title}</h1>
      <p className="lead">{H.body}</p>
      <div role="status" aria-live="polite">
        {restore.result?.ok && <p className="status ok">{H.restored}</p>}
        {restore.result && !restore.result.ok && <ResultError t={t} result={restore.result} />}
      </div>
      {rows.length === 0 ? (
        <p>{H.empty}</p>
      ) : (
        <ul className="list">
          {rows.map((r) => (
            <li key={r.id}>
              <span className="grow">
                <strong>{fmt.format(new Date(r.created_at))}</strong>
                <span className="hint"> · {r.note ?? r.entity_key}</span>
              </span>
              <button type="button" className="btn small secondary" disabled={restore.pending} onClick={() => window.confirm(H.restore + "?") && restore.save(r.id)}>
                {H.restore}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
