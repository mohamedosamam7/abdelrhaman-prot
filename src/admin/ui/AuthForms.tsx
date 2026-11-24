"use client";

import { useActionState } from "react";
import { requestReset, signIn, updatePassword } from "@/admin/actions";
import type { AdminDict } from "@/admin/i18n";

export function LoginForm({ t, expired }: { t: AdminDict; expired: boolean }) {
  const [state, action, pending] = useActionState(signIn, {});
  return (
    <form action={action}>
      {expired && <p className="status warn" role="status">{t.auth.expired}</p>}
      {state.error && <p className="status err" role="alert">{t.auth.failed}</p>}
      <label className="field">
        <span>{t.auth.email}</span>
        <input key={state.email ?? ""} type="email" name="email" autoComplete="username" required dir="ltr" defaultValue={state.email ?? ""} />
      </label>
      <label className="field">
        <span>{t.auth.password}</span>
        <input type="password" name="password" autoComplete="current-password" required dir="ltr" />
      </label>
      <div className="row">
        <button className="btn" disabled={pending}>{t.auth.signIn}</button>
        <a href="/admin/forgot">{t.auth.forgot}</a>
      </div>
    </form>
  );
}

export function ForgotForm({ t }: { t: AdminDict }) {
  const [state, action, pending] = useActionState(requestReset, {});
  return (
    <form action={action}>
      {state.sent && <p className="status ok" role="status">{t.auth.linkSent}</p>}
      <label className="field">
        <span>{t.auth.email}</span>
        <input type="email" name="email" autoComplete="username" required dir="ltr" />
      </label>
      <div className="row">
        <button className="btn" disabled={pending}>{t.auth.sendLink}</button>
        <a href="/admin/login">{t.auth.backToLogin}</a>
      </div>
    </form>
  );
}

export function ResetForm({ t }: { t: AdminDict }) {
  const [state, action, pending] = useActionState(updatePassword, {});
  if (state.done) {
    return (
      <p className="status ok" role="status">
        {t.auth.passwordSet} <a href="/admin">→</a>
      </p>
    );
  }
  return (
    <form action={action}>
      {state.error === "expired" && <p className="status err" role="alert">{t.auth.expired}</p>}
      {state.error === "rules" && <p className="status err" role="alert">{t.auth.passwordRules}</p>}
      <label className="field">
        <span>{t.auth.newPassword}</span>
        <input type="password" name="password" autoComplete="new-password" minLength={10} required dir="ltr" />
        <small className="hint">{t.auth.passwordRules}</small>
      </label>
      <button className="btn" disabled={pending}>{t.auth.setPassword}</button>
    </form>
  );
}
