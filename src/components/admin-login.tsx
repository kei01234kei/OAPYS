"use client";

import { useState } from "react";
import Link from "next/link";
import { connectionMessages } from "@/i18n/connection-console";
import { useMessages } from "@/components/locale-provider";
import LoginBackdrop from "@/components/login-backdrop";

type Props = {
  configured: boolean;
  busy: boolean;
  error: string;
  onLogin: (token: string) => Promise<void>;
  // The standalone /login page has no workspace to go back to.
  standalone?: boolean;
};

// Full-screen split sign-in shown before the single-admin session exists.
export default function AdminLogin({
  configured,
  busy,
  error,
  onLogin,
  standalone = false,
}: Props) {
  const t = useMessages(connectionMessages);
  const [token, setToken] = useState("");
  const [agreed, setAgreed] = useState(false);
  const ready = configured && agreed && token.length >= 32 && !busy;
  return (
    <div className="admin-login">
      <aside className="admin-login-brand" aria-hidden="true">
        <LoginBackdrop />
        <div className="admin-login-mark">
          <svg viewBox="0 0 64 64" width="64" height="64">
            <path
              d="M32 9 55 32 32 55 9 32Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path d="m32 21 11 11-11 11-11-11Z" fill="currentColor" />
          </svg>
          <strong>OAPYS</strong>
        </div>
        <p className="admin-login-tagline">
          Offensive Attack to Protect Your Systems
        </p>
      </aside>
      <main className="admin-login-main">
        {!standalone && (
          <Link className="admin-login-back" href="/">
            ← {t.backToWorkspace}
          </Link>
        )}
        <form
          className="admin-login-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!ready) return;
            void onLogin(token);
          }}
        >
          <h1>{t.loginTitle}</h1>
          <p className="admin-login-lead">{t.loginLead}</p>
          {!configured && (
            <div className="admin-login-notice">{t.tokenNotConfigured}</div>
          )}
          {error && (
            <div className="admin-login-error" role="alert">
              {error}
            </div>
          )}
          <label>
            {t.accountLabel}
            <input value={t.accountValue} readOnly tabIndex={-1} />
          </label>
          <label>
            {t.tokenLabel}
            <input
              type="password"
              autoComplete="current-password"
              placeholder={t.tokenPlaceholder}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              minLength={32}
              autoFocus
            />
          </label>
          <label className="admin-login-agree">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>{t.agreeNotice}</span>
          </label>
          <button className="admin-login-submit" disabled={!ready}>
            {busy ? t.verifying : t.login}
          </button>
        </form>
      </main>
    </div>
  );
}
