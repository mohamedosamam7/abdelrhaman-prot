"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { deleteMedia, registerMedia, updateMedia } from "@/admin/actions";
import type { MediaItem } from "@/admin/data";
import type { AdminDict } from "@/admin/i18n";
import { uploadLimits } from "@/cms/schema";
import { LField, ResultError, SaveBar, TextField, useSave } from "./fields";

interface Upload {
  key: string;
  file: File;
  progress: number;
  state: "uploading" | "registering" | "done" | "failed" | "cancelled";
  error?: string;
  xhr?: XMLHttpRequest;
}

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "video/mp4": "mp4", "video/webm": "webm" };

/** Natural size (and duration for video), read locally before upload. */
function measure(file: File): Promise<{ width: number | null; height: number | null; duration: number | null }> {
  const url = URL.createObjectURL(file);
  const done = (v: { width: number | null; height: number | null; duration: number | null }) => {
    URL.revokeObjectURL(url);
    return v;
  };
  return new Promise((resolve) => {
    if (file.type.startsWith("video/")) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => resolve(done({ width: v.videoWidth || null, height: v.videoHeight || null, duration: Number.isFinite(v.duration) ? Math.round(v.duration * 10) / 10 : null }));
      v.onerror = () => resolve(done({ width: null, height: null, duration: null }));
      v.src = url;
    } else {
      const img = new Image();
      img.onload = () => resolve(done({ width: img.naturalWidth, height: img.naturalHeight, duration: null }));
      img.onerror = () => resolve(done({ width: null, height: null, duration: null }));
      img.src = url;
    }
  });
}

export function MediaLibrary({ t, media, usage, supabaseUrl, publishableKey }: { t: AdminDict; media: MediaItem[]; usage: Record<string, string[]>; supabaseUrl: string; publishableKey: string }) {
  const router = useRouter();
  const M = t.media;
  const supabase = useMemo(() => createBrowserClient(supabaseUrl, publishableKey), [supabaseUrl, publishableKey]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const patch = (key: string, p: Partial<Upload>) => setUploads((list) => list.map((u) => (u.key === key ? { ...u, ...p } : u)));

  async function start(file: File, key = crypto.randomUUID()) {
    const kind = file.type.startsWith("video/") ? "video" : "image";
    const limits = uploadLimits[kind];
    if (!(limits.types as readonly string[]).includes(file.type)) return setUploads((l) => [...l, { key, file, progress: 0, state: "failed", error: M.typeError }]);
    if (file.size > limits.maxBytes) return setUploads((l) => [...l, { key, file, progress: 0, state: "failed", error: M.sizeError }]);

    setUploads((l) => [...l.filter((u) => u.key !== key), { key, file, progress: 0, state: "uploading" }]);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return patch(key, { state: "failed", error: t.common.unauthorized });

    const dims = await measure(file);
    // Safe, unguessable name: never the uploader's file name.
    const path = `uploads/${new Date().getFullYear()}/${crypto.randomUUID()}.${EXT[file.type]}`;
    const xhr = new XMLHttpRequest();
    patch(key, { xhr });
    xhr.open("POST", `${supabaseUrl}/storage/v1/object/media-draft/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", publishableKey);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && patch(key, { progress: e.loaded / e.total });
    xhr.onabort = () => patch(key, { state: "cancelled" });
    xhr.onerror = () => patch(key, { state: "failed", error: M.failed });
    xhr.onload = async () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        let msg = M.failed;
        try {
          msg = `${M.failed}: ${JSON.parse(xhr.responseText).message ?? xhr.status}`;
        } catch {}
        return patch(key, { state: "failed", error: msg });
      }
      patch(key, { state: "registering", progress: 1 });
      const r = await registerMedia({ path, mime: file.type, bytes: file.size, ...dims, name: file.name.slice(0, 200) });
      if (!r.ok) return patch(key, { state: "failed", error: r.error === "unauthorized" ? t.common.unauthorized : M.failed });
      patch(key, { state: "done" });
      router.refresh();
    };
    xhr.send(file);
  }

  const shown = media.filter((m) => {
    const s = q.trim().toLowerCase();
    return !s || [m.original_name, m.alt.en, m.alt.ar, m.description.en, m.description.ar].some((x) => x?.toLowerCase().includes(s));
  });
  const current = media.find((m) => m.id === selected);

  return (
    <>
      <h1>{M.title}</h1>
      <p className="lead">{M.limits}</p>

      <section className="card">
        <div className="row">
          <button type="button" className="btn" onClick={() => input.current?.click()}>
            {M.upload}
          </button>
          <input
            ref={input}
            type="file"
            multiple
            accept={[...uploadLimits.image.types, ...uploadLimits.video.types].join(",")}
            className="sr-only"
            onChange={(e) => {
              Array.from(e.target.files ?? []).forEach((f) => start(f));
              e.target.value = "";
            }}
          />
          <input type="search" placeholder={M.search} value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 320 }} />
        </div>
        {!!uploads.length && (
          <ul className="list" style={{ marginTop: 12 }} aria-live="polite">
            {uploads.map((u) => (
              <li key={u.key}>
                <span className="grow">
                  {u.file.name}
                  <span className="hint"> · {(u.file.size / 1024 / 1024).toFixed(1)} MB</span>
                  {(u.state === "uploading" || u.state === "registering") && (
                    <span className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(u.progress * 100)} aria-label={M.uploading}>
                      <span style={{ width: `${Math.round(u.progress * 100)}%` }} />
                    </span>
                  )}
                  {u.error && <span className="status err" style={{ display: "block", margin: "6px 0 0" }}>{u.error}</span>}
                </span>
                {u.state === "uploading" && (
                  <button type="button" className="btn small secondary" onClick={() => u.xhr?.abort()}>
                    {M.cancel}
                  </button>
                )}
                {(u.state === "failed" || u.state === "cancelled") && !u.error?.startsWith(M.typeError) && u.error !== M.sizeError && (
                  <button type="button" className="btn small secondary" onClick={() => start(u.file, u.key)}>
                    {t.common.retry}
                  </button>
                )}
                {u.state === "done" && <span className="badge">✓</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="media-grid" role="list">
        {shown.map((m) => (
          <button type="button" role="listitem" key={m.id} aria-pressed={selected === m.id} onClick={() => setSelected(m.id)}>
            {m.kind === "video" ? (
              // Poster if set, else the first frame (metadata only).
              m.poster_id ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={media.find((x) => x.id === m.poster_id)?.url} alt="" loading="lazy" />
              ) : (
                <video src={m.url} preload="metadata" muted />
              )
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt="" loading="lazy" />
            )}
            <span className="cap">
              {m.kind === "video" ? `▶ ${M.video} · ` : ""}
              {m.alt.en || m.alt.ar || m.original_name}
            </span>
            {usage[m.id]?.length ? <span className="badge">{usage[m.id].length}</span> : null}
          </button>
        ))}
      </div>

      {current && <MediaDetails key={current.id} t={t} m={current} images={media.filter((x) => x.kind === "image")} usedIn={usage[current.id] ?? []} onDeleted={() => { setSelected(null); router.refresh(); }} />}
    </>
  );
}

function MediaDetails({ t, m, images, usedIn, onDeleted }: { t: AdminDict; m: MediaItem; images: MediaItem[]; usedIn: string[]; onDeleted: () => void }) {
  const M = t.media;
  const router = useRouter();
  const [alt, setAlt] = useState(m.alt);
  const [description, setDescription] = useState(m.description);
  const [focus, setFocus] = useState(m.focus);
  const [posterId, setPosterId] = useState<string | null>(m.poster_id);
  const save = useSave((v: unknown) => updateMedia(m.id, v));
  const del = useSave((id: string) => deleteMedia(id));

  return (
    <section className="card" style={{ marginTop: 18 }} aria-labelledby="md-h">
      <h2 id="md-h">{m.original_name ?? m.id}</h2>
      <p className="hint" dir="ltr" style={{ textAlign: "start" }}>
        {m.kind} · {m.mime} · {(m.bytes / 1024 / 1024).toFixed(1)} MB{m.width ? ` · ${m.width}×${m.height}` : ""}
      </p>
      <LField label={M.alt} value={alt} onChange={setAlt} t={t} max={240} />
      <LField label={M.description} value={description} onChange={setDescription} t={t} multiline max={400} />
      <TextField label={M.focus} value={focus} onChange={setFocus} hint="50% 40%" />
      {m.kind === "video" && (
        <label className="field">
          <span>{M.poster}</span>
          <select value={posterId ?? ""} onChange={(e) => setPosterId(e.target.value || null)}>
            <option value="">{t.common.none}</option>
            {images.map((i) => (
              <option key={i.id} value={i.id}>
                {i.alt.en || i.alt.ar || i.original_name}
              </option>
            ))}
          </select>
        </label>
      )}
      <p>
        <strong>{M.usedIn}:</strong> {usedIn.length ? <span dir="ltr">{usedIn.join(", ")}</span> : M.notUsed}
      </p>
      <SaveBar t={t} pending={save.pending} result={save.result} onSave={() => save.save({ alt, description, focus, posterId }, () => router.refresh())}>
        <button
          type="button"
          className="btn danger"
          disabled={del.pending || usedIn.length > 0}
          title={usedIn.length ? M.inUse : undefined}
          onClick={() => window.confirm(t.common.confirmDelete) && del.save(m.id, onDeleted)}
        >
          {t.common.delete}
        </button>
      </SaveBar>
      {del.result && !del.result.ok && <ResultError t={t} result={del.result} />}
    </section>
  );
}
