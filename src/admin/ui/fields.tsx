"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Result } from "@/admin/actions";
import type { PickerItem } from "@/admin/data";
import type { AdminDict } from "@/admin/i18n";

type LT = { en: string; ar: string };

/** English + Arabic inputs for one field, flagging a missing translation. */
export function LField({ label, value, onChange, t, multiline, max, hint }: { label: string; value: LT; onChange: (v: LT) => void; t: AdminDict; multiline?: boolean; max?: number; hint?: string }) {
  const missing = !!value.en.trim() !== !!value.ar.trim();
  const Input = multiline ? "textarea" : "input";
  return (
    <fieldset className="field" style={{ border: 0, padding: 0, margin: "0 0 14px" }}>
      <legend className="label">
        {label}{" "}
        {missing && <span className="missing">{value.ar.trim() ? t.common.missingEn : t.common.missingAr}</span>}
      </legend>
      <div className="bi">
        <label>
          <span className="lang-tag">{t.common.english}</span>
          <Input type="text" dir="ltr" lang="en" value={value.en} maxLength={max} onChange={(e) => onChange({ ...value, en: e.target.value })} />
        </label>
        <label>
          <span className="lang-tag">{t.common.arabic}</span>
          <Input type="text" dir="rtl" lang="ar" value={value.ar} maxLength={max} onChange={(e) => onChange({ ...value, ar: e.target.value })} />
        </label>
      </div>
      {(hint || (missing && !value.ar.trim())) && <small className="hint">{hint ?? t.common.fallback}</small>}
    </fieldset>
  );
}

type H = { en: { lead: string; emphasis: string }; ar: { lead: string; emphasis: string } };

/** A two-part heading ("lead" + emphasised end) in both languages. */
export function HeadingField({ label, value, onChange, t }: { label: string; value: H; onChange: (v: H) => void; t: AdminDict }) {
  const part = (k: "lead" | "emphasis") => ({ en: value.en[k], ar: value.ar[k] });
  const set = (k: "lead" | "emphasis", v: LT) => onChange({ en: { ...value.en, [k]: v.en }, ar: { ...value.ar, [k]: v.ar } });
  return (
    <div>
      <p className="label" style={{ margin: "0 0 6px" }}>{label}</p>
      <LField label={t.settings.lead} value={part("lead")} onChange={(v) => set("lead", v)} t={t} max={120} />
      <LField label={t.settings.emphasis} value={part("emphasis")} onChange={(v) => set("emphasis", v)} t={t} max={120} />
    </div>
  );
}

export function TextField({ label, value, onChange, dir = "ltr", hint, type = "text", max }: { label: string; value: string; onChange: (v: string) => void; dir?: "ltr" | "rtl"; hint?: string; type?: string; max?: number }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} dir={dir} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} />
      {hint && <small className="hint">{hint}</small>}
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="row" style={{ minHeight: 44 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 20, height: 20 }} />
      <span>{label}</span>
    </label>
  );
}

/* ── Media ─────────────────────────────────────────────────────────────── */

export function MediaThumb({ item }: { item?: PickerItem }) {
  if (!item) return <span className="thumb" aria-hidden="true" />;
  const src = item.kind === "video" ? item.posterUrl : item.url;
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img className="thumb" src={src} alt="" /> : <span className="thumb" aria-hidden="true" />;
}

/** Shows the chosen media with a button that opens the picker. */
export function MediaField({ label, value, onChange, items, t, allowVideo = true }: { label: string; value: string | null; onChange: (ref: string) => void; items: PickerItem[]; t: AdminDict; allowVideo?: boolean }) {
  const [open, setOpen] = useState(false);
  const item = items.find((i) => i.ref === value);
  return (
    <div className="field">
      <span className="label">{label}</span>
      <div className="row">
        <MediaThumb item={item} />
        <span className="hint" style={{ flex: 1, minWidth: 120 }}>
          {item ? `${item.kind === "video" ? `${t.media.video} · ` : ""}${item.label}` : t.common.none}
        </span>
        <button type="button" className="btn small secondary" onClick={() => setOpen(true)}>
          {value ? t.media.replace : t.common.choose}
        </button>
      </div>
      {open && (
        <MediaPicker
          t={t}
          items={allowVideo ? items : items.filter((i) => i.kind === "image")}
          onPick={(ref) => {
            onChange(ref);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

export function MediaPicker({ items, onPick, onClose, t }: { items: PickerItem[]; onPick: (ref: string) => void; onClose: () => void; t: AdminDict }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"uploaded" | "builtIn">(items.some((i) => !i.builtIn) ? "uploaded" : "builtIn");
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const shown = useMemo(
    () => items.filter((i) => (tab === "builtIn" ? i.builtIn : !i.builtIn) && i.label.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 200),
    [items, q, tab],
  );
  return (
    <dialog ref={ref} className="picker" onClose={onClose} aria-label={t.media.pick}>
      <div className="pick-head">
        <strong style={{ flex: 1 }}>{t.media.pick}</strong>
        <div className="row" role="group">
          <button type="button" className={`btn small ${tab === "uploaded" ? "" : "secondary"}`} aria-pressed={tab === "uploaded"} onClick={() => setTab("uploaded")}>{t.media.uploaded}</button>
          <button type="button" className={`btn small ${tab === "builtIn" ? "" : "secondary"}`} aria-pressed={tab === "builtIn"} onClick={() => setTab("builtIn")}>{t.media.builtIn}</button>
        </div>
        <input type="search" placeholder={t.media.search} value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 280 }} />
        <button type="button" className="btn small ghost" onClick={() => ref.current?.close()}>{t.common.close}</button>
      </div>
      <div className="pick-body">
        <div className="media-grid">
          {shown.map((i) => (
            <button type="button" key={i.ref} onClick={() => onPick(i.ref)}>
              <MediaThumbFull item={i} />
              <span className="cap">{i.kind === "video" ? `▶ ${i.label}` : i.label}</span>
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}

function MediaThumbFull({ item }: { item: PickerItem }) {
  const src = item.kind === "video" ? item.posterUrl : item.url;
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt="" loading="lazy" /> : <span style={{ aspectRatio: 1, background: "#e9ded1", borderRadius: 4 }} />;
}

/* ── Save ──────────────────────────────────────────────────────────────── */

export function useSave<T>(action: (v: T) => Promise<Result>) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<Result | null>(null);
  const save = (v: T, after?: () => void) =>
    start(async () => {
      try {
        const r = await action(v);
        setResult(r);
        if (r.ok) after?.();
      } catch {
        setResult({ ok: false, error: "error" });
      }
    });
  return { pending, result, save, setResult };
}

export function SaveBar({ t, pending, result, onSave, children }: { t: AdminDict; pending: boolean; result: Result | null; onSave: () => void; children?: React.ReactNode }) {
  return (
    <div className="savebar">
      <button type="button" className="btn" onClick={onSave} disabled={pending}>
        {pending ? t.common.saving : t.common.save}
      </button>
      {children}
      <div role="status" aria-live="polite" style={{ flex: 1, minWidth: 200 }}>
        {result?.ok && <span className="status ok" style={{ display: "inline-block", margin: 0 }}>{t.common.saved}</span>}
        {result && !result.ok && <ResultError t={t} result={result} />}
      </div>
    </div>
  );
}

export function ResultError({ t, result }: { t: AdminDict; result: Extract<Result, { ok: false }> }) {
  const msg =
    result.error === "unauthorized" ? t.common.unauthorized : result.error === "in-use" ? t.media.inUse : result.error === "invalid" || result.error === "conflict" ? t.common.invalid : t.common.error;
  return (
    <div className="status err" style={{ margin: 0 }}>
      {msg}
      {!!result.issues?.length && (
        <ul style={{ margin: "6px 0 0", paddingInlineStart: 18 }}>
          {result.issues.slice(0, 8).map((i, n) => (
            <li key={n}>
              <code dir="ltr">{i.path || "—"}</code>: {i.message}
            </li>
          ))}
        </ul>
      )}
      {result.detail && <p style={{ margin: "6px 0 0" }} dir="ltr">{result.detail}</p>}
    </div>
  );
}

/** Up / down buttons for accessible reordering. */
export function MoveButtons({ t, index, count, onMove }: { t: AdminDict; index: number; count: number; onMove: (from: number, to: number) => void }) {
  return (
    <>
      <button type="button" className="btn small secondary" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={t.common.up}>↑</button>
      <button type="button" className="btn small secondary" disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label={t.common.down}>↓</button>
    </>
  );
}

export function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}
