"use client";

import { useState } from "react";
import { saveSettings } from "@/admin/actions";
import type { PickerItem } from "@/admin/data";
import type { AdminDict } from "@/admin/i18n";
import { gradients, type SettingsDoc } from "@/cms/schema";
import { HeadingField, LField, MediaField, SaveBar, TextField, Toggle, useSave } from "./fields";

export function SettingsEditor({ t, initial, items }: { t: AdminDict; initial: SettingsDoc; items: PickerItem[] }) {
  const [s, setS] = useState<SettingsDoc>(initial);
  const { pending, result, save } = useSave(saveSettings);
  const c = s.contact;
  const setC = (patch: Partial<SettingsDoc["contact"]>) => setS({ ...s, contact: { ...c, ...patch } });
  const T = t.settings;

  return (
    <>
      <h1>{T.title}</h1>

      <section className="card">
        <h2>{T.identity}</h2>
        <TextField label={T.brandName} value={s.brandName} onChange={(v) => setS({ ...s, brandName: v })} max={40} />
        <LField label={T.fullName} value={s.fullName} onChange={(v) => setS({ ...s, fullName: v })} t={t} max={80} />
        <LField label={T.role} value={s.role} onChange={(v) => setS({ ...s, role: v })} t={t} max={80} />
        <div className="grid2">
          <LField label={T.city} value={s.location.city} onChange={(v) => setS({ ...s, location: { ...s.location, city: v } })} t={t} max={60} />
          <LField label={T.country} value={s.location.country} onChange={(v) => setS({ ...s, location: { ...s.location, country: v } })} t={t} max={60} />
        </div>
        <LField label={T.short} value={s.location.short} onChange={(v) => setS({ ...s, location: { ...s.location, short: v } })} t={t} max={40} />
        <LField label={T.description} value={s.description} onChange={(v) => setS({ ...s, description: v })} t={t} multiline max={300} />
      </section>

      <section className="card">
        <h2>{T.navigation}</h2>
        <div className="grid2">
          {(["home", "work", "contact", "letsTalk"] as const).map((k) => (
            <LField key={k} label={k === "letsTalk" ? "Let’s Talk" : t.pages[k as "home"] ?? k} value={s.nav[k]} onChange={(v) => setS({ ...s, nav: { ...s.nav, [k]: v } })} t={t} max={30} />
          ))}
        </div>
      </section>

      <section className="card">
        <h2>{T.contact}</h2>
        <HeadingField label={T.heading} value={c.heading} onChange={(v) => setC({ heading: v })} t={t} />
        <LField label={T.subheading} value={c.subheading} onChange={(v) => setC({ subheading: v })} t={t} max={160} />
        <LField label={T.body} value={c.body} onChange={(v) => setC({ body: v })} t={t} multiline max={300} />
        <div className="grid2">
          <TextField label={T.instagramHandle} value={c.instagram.handle} onChange={(v) => setC({ instagram: { ...c.instagram, handle: v } })} />
          <TextField label={T.instagramUrl} type="url" value={c.instagram.url} onChange={(v) => setC({ instagram: { ...c.instagram, url: v } })} />
        </div>
        <Toggle label={T.behance} checked={c.behance.enabled} onChange={(v) => setC({ behance: { ...c.behance, enabled: v } })} />
        {c.behance.enabled && (
          <div className="grid2">
            <TextField label={T.behanceHandle} value={c.behance.handle} onChange={(v) => setC({ behance: { ...c.behance, handle: v } })} />
            <TextField label={T.behanceUrl} type="url" value={c.behance.url} onChange={(v) => setC({ behance: { ...c.behance, url: v } })} />
          </div>
        )}
        <Toggle label={T.email} checked={c.email.enabled} onChange={(v) => setC({ email: { ...c.email, enabled: v } })} />
        {c.email.enabled && <TextField label={T.emailValue} type="email" value={c.email.value} onChange={(v) => setC({ email: { ...c.email, value: v } })} />}
        <Toggle label={T.whatsapp} checked={c.whatsapp.enabled} onChange={(v) => setC({ whatsapp: { ...c.whatsapp, enabled: v } })} />
        {c.whatsapp.enabled && (
          <>
            <div className="grid2">
              <TextField label={T.whatsappNumber} value={c.whatsapp.number} onChange={(v) => setC({ whatsapp: { ...c.whatsapp, number: v.replace(/\D/g, "") } })} />
              <TextField label={T.whatsappDisplay} value={c.whatsapp.display} onChange={(v) => setC({ whatsapp: { ...c.whatsapp, display: v } })} />
            </div>
            <LField label={T.whatsappMessage} value={c.whatsapp.message} onChange={(v) => setC({ whatsapp: { ...c.whatsapp, message: v } })} t={t} max={200} />
          </>
        )}
      </section>

      <section className="card">
        <h2>{T.seo}</h2>
        <LField label={T.homeTitle} value={s.seo.homeTitle} onChange={(v) => setS({ ...s, seo: { ...s.seo, homeTitle: v } })} t={t} max={90} />
        <LField label={T.homeDescription} value={s.seo.homeDescription} onChange={(v) => setS({ ...s, seo: { ...s.seo, homeDescription: v } })} t={t} multiline max={200} />
        <MediaField label={T.shareImage} value={s.seo.shareImage} items={items} t={t} allowVideo={false} onChange={(ref) => setS({ ...s, seo: { ...s.seo, shareImage: ref } })} />
      </section>

      <section className="card">
        <h2>{T.theme}</h2>
        <label className="field">
          <span>{T.gradient}</span>
          <select value={s.theme.gradient} onChange={(e) => setS({ ...s, theme: { gradient: e.target.value as SettingsDoc["theme"]["gradient"] } })}>
            {gradients.map((g) => (
              <option key={g} value={g}>{T.gradients[g]}</option>
            ))}
          </select>
        </label>
      </section>

      <SaveBar t={t} pending={pending} result={result} onSave={() => save(s)} />
    </>
  );
}
