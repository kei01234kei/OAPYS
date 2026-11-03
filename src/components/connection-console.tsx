"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/lib/use-modal";
import {
  securityRequest,
  type SecuritySnapshot,
  type Target,
} from "@/lib/security-types";
import { connectionMessages } from "@/i18n/connection-console";
import { useLocale, useMessages } from "@/components/locale-provider";
import { intlLocale } from "@/lib/i18n";
import AdminLogin from "@/components/admin-login";

type Props = {
  snapshot: SecuritySnapshot | null;
  onSnapshot: (data: SecuritySnapshot) => void;
  onClose: () => void;
  initialTab: "cloud" | "targets";
  onLogout: () => void;
  embedded?: boolean;
};
export default function ConnectionConsole({
  snapshot,
  onSnapshot,
  onClose,
  initialTab,
  onLogout,
  embedded = false,
}: Props) {
  const t = useMessages(connectionMessages);
  const dateLocale = intlLocale(useLocale());
  const [tab, setTab] = useState(initialTab);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const [authenticated, setAuthenticated] = useState(!!snapshot);
  const [configured, setConfigured] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(!!snapshot);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState("AWS");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("ap-northeast-1");
  const [roleArn, setRoleArn] = useState("");
  const [projectId, setProjectId] = useState("");
  const [hostname, setHostname] = useState("");
  const [challenge, setChallenge] = useState<{
    target: Target;
    recordName: string;
    recordValue: string;
  } | null>(null);
  const [authorized, setAuthorized] = useState<Record<string, boolean>>({});
  const router = useRouter();
  // Diagnosis results live on the exploit graph; settings only starts runs.
  const openExploit = (targetId: string, jobId: string) => {
    if (!embedded) onClose();
    router.push(
      `/assets?view=exploration&asset=${encodeURIComponent(targetId)}&job=${encodeURIComponent(jobId)}`,
    );
  };
  const dialog = useRef<HTMLDivElement>(null);
  useModal(dialog, !embedded);
  useEffect(() => {
    let active = true;
    securityRequest<{ configured: boolean; authenticated: boolean }>("session")
      .then(async (session) => {
        if (!active) return;
        setConfigured(session.configured);
        setAuthenticated(session.authenticated);
        setSessionChecked(true);
        if (session.authenticated) {
          const data = await securityRequest<SecuritySnapshot>("snapshot");
          if (active) onSnapshot(data);
        }
      })
      .catch((e) => {
        if (!active) return;
        setError(e.message);
        setSessionChecked(true);
      });
    return () => {
      active = false;
    };
  }, [onSnapshot]);
  // AI judgment runs after the 25-second network phase, so poll until done.
  const jobRunning = !!snapshot?.jobs.some((j) => j.status === "running");
  useEffect(() => {
    if (!jobRunning) return;
    const timer = setInterval(() => {
      securityRequest<SecuritySnapshot>("snapshot")
        .then(onSnapshot)
        .catch(() => {});
    }, 1500);
    return () => clearInterval(timer);
  }, [jobRunning, onSnapshot]);
  async function refresh() {
    const data = await securityRequest<SecuritySnapshot>("snapshot");
    onSnapshot(data);
  }
  async function act(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.requestFailed);
    } finally {
      setBusy(false);
    }
  }
  // Avoid flashing the sign-in screen while an existing session is checked.
  if (!authenticated && !sessionChecked) return null;
  if (!authenticated)
    return (
      <AdminLogin
        configured={configured}
        busy={busy}
        error={error}
        onLogin={(token) =>
          act(async () => {
            await securityRequest("session", "POST", { token });
            await refresh();
            setAuthenticated(true);
          })
        }
      />
    );
  return (
    <div
      className={
        embedded ? "settings-console" : "notice-backdrop console-backdrop"
      }
      onClick={embedded ? undefined : onClose}
    >
      <div
        ref={dialog}
        className="connection-console"
        role={embedded ? "region" : "dialog"}
        aria-modal={embedded ? undefined : true}
        aria-labelledby="console-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (embedded) return;
          if (e.key === "Escape") onClose();
          if (e.key === "Tab") {
            const focusable = Array.from(
              e.currentTarget.querySelectorAll<HTMLElement>(
                "button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]",
              ),
            );
            const first = focusable[0],
              last = focusable[focusable.length - 1];
            if (
              e.shiftKey &&
              (document.activeElement === first ||
                document.activeElement === dialog.current)
            ) {
              e.preventDefault();
              last?.focus();
            } else if (
              !e.shiftKey &&
              (document.activeElement === last ||
                document.activeElement === dialog.current)
            ) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="console-heading">
          <div>
            <span className="eyebrow">CONNECTED SECURITY</span>
            <h2 id="console-title">{t.title}</h2>
            <p>{t.lead}</p>
          </div>
          {!embedded && (
            <button
              className="icon-button"
              aria-label={t.close}
              onClick={onClose}
            >
              ✕
            </button>
          )}
        </div>
        {error && (
          <div className="console-error" role="alert">
            {error}
          </div>
        )}
        <>
          <div className="console-nav">
            <button
              className={tab === "cloud" ? "active" : ""}
              onClick={() => setTab("cloud")}
            >
              {t.cloudTab} <span>{snapshot?.connections.length ?? 0}</span>
            </button>
            <button
              className={tab === "targets" ? "active" : ""}
              onClick={() => setTab("targets")}
            >
              {t.targetsTab} <span>{snapshot?.targets.length ?? 0}</span>
            </button>
            <button
              className="console-logout"
              disabled={busy}
              onClick={() =>
                void act(async () => {
                  await securityRequest("session", "DELETE");
                  setAuthenticated(false);
                  onLogout();
                })
              }
            >
              {t.logout}
            </button>
          </div>
          {tab === "cloud" ? (
            <div className="console-body">
              <form
                className="connection-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void act(async () => {
                    await securityRequest("connections", "POST", {
                      name,
                      provider,
                      region: provider === "AWS" ? region : "",
                      roleArn: provider === "AWS" ? roleArn : "",
                      projectId: provider === "GCP" ? projectId : "",
                    });
                    setName("");
                    await refresh();
                  });
                }}
              >
                <h3>{t.registerConnection}</h3>
                <div className="form-columns">
                  <label>
                    {t.provider}
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                    >
                      <option>AWS</option>
                      <option>GCP</option>
                    </select>
                  </label>
                  <label>
                    {t.connectionName}
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Production"
                      required
                      maxLength={100}
                    />
                  </label>
                </div>
                {provider === "AWS" ? (
                  <>
                    <label>
                      IAM Role ARN
                      <input
                        value={roleArn}
                        onChange={(e) => setRoleArn(e.target.value)}
                        placeholder="arn:aws:iam::123456789012:role/OAPYSReadOnly"
                        required
                      />
                    </label>
                    <label>
                      {t.region}
                      <input
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        required
                      />
                    </label>
                    <p className="console-hint">{t.awsHint}</p>
                  </>
                ) : (
                  <>
                    <label>
                      GCP Project ID
                      <input
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        placeholder="my-production-project"
                        required
                      />
                    </label>
                    <p className="console-hint">{t.gcpHint}</p>
                  </>
                )}
                <button className="primary-button" disabled={busy}>
                  {busy ? t.processing : t.saveConnection}
                </button>
              </form>
              <div className="console-list">
                <h3>{t.registeredConnections}</h3>
                {!snapshot?.connections.length && (
                  <p className="console-empty">{t.noConnections}</p>
                )}
                {snapshot?.connections.map((c) => (
                  <article className="connection-card" key={c.id}>
                    <div className="connection-card-heading">
                      <strong>{c.name}</strong>
                      <span className={`connection-state ${c.status}`}>
                        {c.status}
                      </span>
                    </div>
                    <p>
                      {c.provider} ·{" "}
                      {c.provider === "GCP" ? c.projectId : c.region}
                    </p>
                    {c.provider === "AWS" && (
                      <>
                        <label>
                          External ID<code>{c.externalId}</code>
                        </label>
                        <details>
                          <summary>{t.trustPolicyExample}</summary>
                          <pre>
                            {JSON.stringify(
                              {
                                Version: "2012-10-17",
                                Statement: [
                                  {
                                    Effect: "Allow",
                                    Principal: { AWS: "BACKEND_ROLE_ARN" },
                                    Action: "sts:AssumeRole",
                                    Condition: {
                                      StringEquals: {
                                        "sts:ExternalId": c.externalId,
                                      },
                                    },
                                  },
                                ],
                              },
                              null,
                              2,
                            )}
                          </pre>
                          <p>{t.trustPolicyHint}</p>
                        </details>
                      </>
                    )}
                    {c.error && <p className="connection-error">{c.error}</p>}
                    <small>
                      {t.lastSync}
                      {c.lastSync
                        ? new Date(c.lastSync).toLocaleString(dateLocale)
                        : t.notRun}
                    </small>
                    <div className="connection-actions">
                      <button
                        disabled={busy || c.status === "syncing"}
                        onClick={() =>
                          void act(async () => {
                            await securityRequest(
                              `connections/${c.id}/sync`,
                              "POST",
                              {},
                            );
                            await refresh();
                          })
                        }
                      >
                        {c.status === "syncing" ? t.syncing : t.connectAndSync}
                      </button>
                      <button
                        disabled={busy}
                        onClick={() =>
                          void act(async () => {
                            await securityRequest(
                              `connections/${c.id}`,
                              "DELETE",
                            );
                            await refresh();
                          })
                        }
                      >
                        {t.disconnect}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="console-body">
              <div>
                <form
                  className="connection-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void act(async () => {
                      const data = await securityRequest<{
                        target: Target;
                        recordName: string;
                        recordValue: string;
                      }>("targets", "POST", { hostname });
                      setChallenge(data);
                      setHostname("");
                      await refresh();
                    });
                  }}
                >
                  <h3>{t.verifyOwnership}</h3>
                  <label>
                    {t.exactHostname}
                    <input
                      value={hostname}
                      onChange={(e) => setHostname(e.target.value)}
                      placeholder="app.example.com"
                      required
                    />
                  </label>
                  <p className="console-hint">{t.targetHint}</p>
                  <button className="primary-button" disabled={busy}>
                    {t.issueChallenge}
                  </button>
                </form>
                {challenge && (
                  <div className="challenge-card">
                    <h3>{t.addTxtRecord}</h3>
                    <label>
                      {t.recordName}
                      <code>{challenge.recordName}</code>
                    </label>
                    <label>
                      {t.recordValue}
                      <code>{challenge.recordValue}</code>
                    </label>
                    <p>{t.challengeHint}</p>
                  </div>
                )}
                <div className="console-hint">{t.detectionScope}</div>
              </div>
              <div className="console-list">
                <h3>{t.targetsAndHistory}</h3>
                {!snapshot?.targets.length && (
                  <p className="console-empty">{t.noTargets}</p>
                )}
                {snapshot?.targets.map((target) => {
                  const verified = Date.parse(target.verifiedUntil) > now;
                  return (
                    <article className="connection-card" key={target.id}>
                      <div className="connection-card-heading">
                        <strong>{target.hostname}</strong>
                        <span
                          className={`connection-state ${verified ? "connected" : "pending"}`}
                        >
                          {verified ? t.verified : t.unverified}
                        </span>
                      </div>
                      <small>
                        {t.verifiedUntil}
                        {verified
                          ? new Date(target.verifiedUntil).toLocaleString(
                              dateLocale,
                            )
                          : "—"}
                      </small>
                      <div className="connection-actions">
                        <button
                          disabled={busy}
                          onClick={() =>
                            void act(async () => {
                              await securityRequest(
                                `targets/${target.id}/verify`,
                                "POST",
                                {},
                              );
                              await refresh();
                            })
                          }
                        >
                          {t.checkDns}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() =>
                            void act(async () => {
                              setChallenge(
                                await securityRequest<{
                                  target: Target;
                                  recordName: string;
                                  recordValue: string;
                                }>(`targets/${target.id}/challenge`),
                              );
                            })
                          }
                        >
                          {t.showDnsValue}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() =>
                            void act(async () => {
                              await securityRequest(
                                `targets/${target.id}`,
                                "DELETE",
                              );
                              if (challenge?.target.id === target.id)
                                setChallenge(null);
                              await refresh();
                            })
                          }
                        >
                          {t.revoke}
                        </button>
                      </div>
                      <label className="authorization-check">
                        <input
                          type="checkbox"
                          checked={!!authorized[target.id]}
                          onChange={(e) =>
                            setAuthorized((a) => ({
                              ...a,
                              [target.id]: e.target.checked,
                            }))
                          }
                        />
                        {t.authorizationCheck}
                      </label>
                      <button
                        className="scan-button"
                        disabled={
                          busy ||
                          !verified ||
                          !authorized[target.id] ||
                          snapshot.jobs.some(
                            (j) =>
                              j.targetId === target.id &&
                              j.status === "running" &&
                              (j.engine === "ai" ||
                                Date.parse(j.deadline) > now),
                          )
                        }
                        onClick={() =>
                          void act(async () => {
                            const job = await securityRequest<{
                              id: string;
                            }>("jobs", "POST", {
                              targetId: target.id,
                              authorized: true,
                            });
                            setAuthorized((a) => ({
                              ...a,
                              [target.id]: false,
                            }));
                            await refresh();
                            openExploit(target.id, job.id);
                          })
                        }
                      >
                        {t.runScan}
                      </button>
                    </article>
                  );
                })}
                {snapshot?.jobs
                  .slice()
                  .reverse()
                  .slice(0, 20)
                  .map((j) => (
                    <button
                      type="button"
                      className="job-row"
                      key={j.id}
                      title={t.viewInGraph}
                      onClick={() => openExploit(j.targetId, j.id)}
                    >
                      <div>
                        <strong>{j.hostname}</strong>
                        <small>
                          {new Date(j.createdAt).toLocaleString(dateLocale)}
                        </small>
                      </div>
                      <span className={`connection-state ${j.status}`}>
                        {j.status === "running" && Date.parse(j.deadline) <= now
                          ? j.engine === "ai"
                            ? t.aiJudging
                            : t.overdue
                          : j.status}
                      </span>
                      {j.engine && (
                        <small>
                          {j.engine === "ai" ? t.aiJudgment : t.ruleJudgment}
                        </small>
                      )}
                      {j.notice && <p>{j.notice}</p>}
                      {j.error && <p>{j.error}</p>}
                    </button>
                  ))}
              </div>
            </div>
          )}
          <div className="console-footer">
            <span>{t.footer}</span>
            <button disabled={busy} onClick={() => void act(refresh)}>
              {t.refresh}
            </button>
          </div>
        </>
      </div>
    </div>
  );
}
