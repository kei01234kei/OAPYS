"use client";

import { useState } from "react";
import { securityRequest } from "@/lib/security-types";
import type { LocalModelsState } from "@/lib/local-model-types";
import { localModelMessages } from "@/i18n/local-models";
import { useMessages } from "@/components/locale-provider";

const START_COMMAND = "lms server start";

function parseOrigin(raw: string) {
  try {
    const u = new URL(raw);
    return { host: u.hostname.replace(/^\[|\]$/g, ""), port: u.port || "1234" };
  } catch {
    return null;
  }
}
const LOOPBACK = /^(localhost|127(\.\d+){3}|::1)$/;

// Guides the operator from "LM Studio is not installed" to "connected" on the
// host machine. The parent polls the runtime while it is not connected, so
// starting LM Studio is picked up without pressing anything here.
export default function LMStudioConnection({
  state,
  onState,
}: {
  state: LocalModelsState | null;
  onState: (next: LocalModelsState) => Promise<void> | void;
}) {
  const t = useMessages(localModelMessages);
  const [url, setUrl] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState<"" | "detect" | "save">("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const runtime = state?.state ?? (state ? "error" : null);
  const connected = runtime === "connected";
  const answered = runtime === "auth_required" || runtime === "outdated";
  const shownUrl = url ?? state?.url ?? "";
  const current = parseOrigin(state?.url ?? "");
  const viaDocker =
    !!state?.inDocker && current?.host === "host.docker.internal";
  const typed = parseOrigin(shownUrl.trim());
  const typedLoopback =
    !!state?.inDocker && !!typed && LOOPBACK.test(typed.host);
  // Explains why the URL is not localhost: the backend runs in Docker.
  const dockerNote = viaDocker && current && (
    <p className="local-model-hint">{t.dockerNote(current.port)}</p>
  );

  async function send(kind: "detect" | "save", body?: object) {
    setBusy(kind);
    setError("");
    try {
      const next = await securityRequest<LocalModelsState>(
        kind === "detect" ? "ai/local/detect" : "ai/local/runtime",
        "POST",
        body ?? {},
      );
      setToken("");
      setUrl(null);
      await onState(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("");
    }
  }
  function copy() {
    void navigator.clipboard?.writeText(START_COMMAND).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const tokenForm = (
    <form
      className="lmstudio-inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        void send("save", { token: token.trim() });
      }}
    >
      <label>
        {t.tokenLabel}
        <span className="local-model-search">
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={state?.hasToken ? t.tokenSaved : ""}
            maxLength={500}
            disabled={!state?.canSaveToken}
          />
          <button
            className="primary-button"
            disabled={!!busy || !token.trim() || !state?.canSaveToken}
          >
            {t.tokenSave}
          </button>
        </span>
      </label>
      {state?.hasToken && (
        <button
          type="button"
          className="link-button"
          disabled={!!busy}
          onClick={() => void send("save", { clearToken: true })}
        >
          {t.tokenClear}
        </button>
      )}
    </form>
  );

  const advanced = (
    <details className="lmstudio-advanced">
      <summary>{t.advanced}</summary>
      <form
        className="lmstudio-inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          void send("save", { url: shownUrl.trim() });
        }}
      >
        <label>
          {t.runtimeUrl}
          <span className="local-model-search">
            <input
              value={shownUrl}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                state?.inDocker
                  ? "http://host.docker.internal:1234"
                  : "http://127.0.0.1:1234"
              }
              maxLength={300}
            />
            <button
              className="secondary-button"
              disabled={
                !!busy ||
                !shownUrl.trim() ||
                shownUrl.trim() === state?.url ||
                typedLoopback
              }
            >
              {t.saveUrl}
            </button>
          </span>
        </label>
        {typedLoopback && typed ? (
          <p className="local-model-warn">{t.dockerLoopback(typed.port)}</p>
        ) : (
          state?.inDocker && (
            <p className="local-model-hint">{t.dockerUrlHint}</p>
          )
        )}
      </form>
      {runtime !== "auth_required" && tokenForm}
      <p className="local-model-hint">{t.tokenHint}</p>
    </details>
  );

  if (!state) return null;

  if (connected) {
    return (
      <section className="lmstudio-connection connected">
        <div className="lmstudio-connection-head">
          <span className="connection-state connected">{t.runtimeOnline}</span>
          <strong>LM Studio</strong>
          <code>{state.url}</code>
        </div>
        {dockerNote}
        {advanced}
      </section>
    );
  }

  const steps = [
    {
      done: answered,
      title: t.stepInstall,
      body: (
        <p>
          {t.stepInstallBody}{" "}
          <a
            href="https://lmstudio.ai/download"
            target="_blank"
            rel="noreferrer noopener"
          >
            {t.stepInstallLink} ↗
          </a>
        </p>
      ),
    },
    {
      done: answered,
      title: t.stepStart,
      body: (
        <>
          <p>{t.stepStartGui}</p>
          <p>{t.stepStartCli}</p>
          <span className="lmstudio-command">
            <code>{START_COMMAND}</code>
            <button type="button" className="secondary-button" onClick={copy}>
              {copied ? t.copied : t.copy}
            </button>
          </span>
          <p className="local-model-hint">{t.stepStartLogin}</p>
        </>
      ),
    },
    {
      done: false,
      title: t.stepConnect,
      body: (
        <>
          {runtime === "auth_required" ? (
            <>
              <p className="local-model-warn">{t.needToken}</p>
              {tokenForm}
              {!state.canSaveToken && (
                <p className="local-model-hint">{t.secretsUnavailable}</p>
              )}
            </>
          ) : runtime === "outdated" ? (
            <p className="local-model-warn">{t.needUpdate}</p>
          ) : (
            <p className="lmstudio-waiting">
              <span className="lmstudio-spinner" aria-hidden />
              {t.waiting}
            </p>
          )}
          {dockerNote}
          <button
            type="button"
            className="secondary-button"
            disabled={!!busy}
            onClick={() => void send("detect")}
          >
            {busy === "detect" ? t.detecting : t.detect}
          </button>
        </>
      ),
    },
  ];

  return (
    <section className="lmstudio-connection" aria-live="polite">
      <div className="lmstudio-connection-head">
        <span
          className={`connection-state ${runtime === "auth_required" || runtime === "outdated" ? "pending" : "error"}`}
        >
          {runtime === "auth_required"
            ? t.stateAuth
            : runtime === "outdated"
              ? t.stateOutdated
              : t.runtimeOffline}
        </span>
        <strong>{t.connectTitle}</strong>
      </div>
      <p>{t.connectIntro}</p>
      <ol className="lmstudio-steps">
        {steps.map((s, i) => (
          <li key={i} className={s.done ? "done" : ""}>
            <span className="lmstudio-step-mark" aria-hidden>
              {s.done ? "✓" : i + 1}
            </span>
            <div>
              <strong>{s.title}</strong>
              {s.body}
            </div>
          </li>
        ))}
      </ol>
      {error && (
        <div className="console-error" role="alert">
          {error}
        </div>
      )}
      {advanced}
    </section>
  );
}
