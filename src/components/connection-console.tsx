"use client";

import { useEffect, useRef, useState } from "react";
import { useModal } from "@/lib/use-modal";
import {
  securityRequest,
  type SecuritySnapshot,
  type Target,
} from "@/lib/security-types";

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
  const [tab, setTab] = useState(initialTab);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const [authenticated, setAuthenticated] = useState(!!snapshot);
  const [configured, setConfigured] = useState(true);
  const [token, setToken] = useState("");
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
  const dialog = useRef<HTMLDivElement>(null);
  useModal(dialog, !embedded);
  useEffect(() => {
    let active = true;
    securityRequest<{ configured: boolean; authenticated: boolean }>("session")
      .then(async (session) => {
        if (!active) return;
        setConfigured(session.configured);
        setAuthenticated(session.authenticated);
        if (session.authenticated) {
          const data = await securityRequest<SecuritySnapshot>("snapshot");
          if (active) onSnapshot(data);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [onSnapshot]);
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
      setError(e instanceof Error ? e.message : "操作に失敗しました。");
    } finally {
      setBusy(false);
    }
  }
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
            <h2 id="console-title">実環境ワークスペース</h2>
            <p>クラウド構成と、所有確認済みエンドポイントをグラフへ。</p>
          </div>
          {!embedded && (
            <button
              className="icon-button"
              aria-label="閉じる"
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
        {!authenticated ? (
          <form
            className="console-login"
            onSubmit={(e) => {
              e.preventDefault();
              void act(async () => {
                await securityRequest("session", "POST", { token });
                setToken("");
                await refresh();
                setAuthenticated(true);
              });
            }}
          >
            <h3>管理者としてログイン</h3>
            <p>
              この実装は単一管理者のワークスペースです。backend と frontend
              に設定した共通の管理トークンを入力してください。
            </p>
            {!configured && (
              <div className="console-hint">
                管理トークンが未設定です。README
                の実環境セットアップに従い、サーバー設定を行ってください。
              </div>
            )}
            <label>
              管理トークン
              <input
                type="password"
                autoComplete="current-password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                minLength={32}
              />
            </label>
            <button className="primary-button" disabled={busy || !configured}>
              {busy ? "確認中..." : "ログイン"}
            </button>
          </form>
        ) : (
          <>
            <div className="console-nav">
              <button
                className={tab === "cloud" ? "active" : ""}
                onClick={() => setTab("cloud")}
              >
                クラウド接続 <span>{snapshot?.connections.length ?? 0}</span>
              </button>
              <button
                className={tab === "targets" ? "active" : ""}
                onClick={() => setTab("targets")}
              >
                実診断 <span>{snapshot?.targets.length ?? 0}</span>
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
                ログアウト
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
                  <h3>読み取り専用のクラウド接続を登録</h3>
                  <div className="form-columns">
                    <label>
                      プロバイダー
                      <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                      >
                        <option>AWS</option>
                        <option>GCP</option>
                      </select>
                    </label>
                    <label>
                      接続名
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
                        リージョン
                        <input
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          required
                        />
                      </label>
                      <p className="console-hint">
                        登録後に表示される External ID を、backend
                        の実行プリンシパルを許可する IAM
                        ロールの信頼ポリシーに設定します。必要な権限：ec2:DescribeInstances
                        / ec2:DescribeSecurityGroups。登録だけでは AWS
                        へ接続しません。
                      </p>
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
                      <p className="console-hint">
                        backend の Application Default Credentials
                        を使用します。対象プロジェクトで Compute API
                        を有効化し、compute.instances.list /
                        compute.firewalls.list
                        を付与してください。認証情報はサーバー側で設定します。
                      </p>
                    </>
                  )}
                  <button className="primary-button" disabled={busy}>
                    {busy ? "処理中..." : "接続設定を登録"}
                  </button>
                </form>
                <div className="console-list">
                  <h3>登録済みの接続</h3>
                  {!snapshot?.connections.length && (
                    <p className="console-empty">
                      接続はまだありません。AWS または GCP を登録してください。
                    </p>
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
                            <summary>信頼ポリシーの設定例</summary>
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
                            <p>
                              BACKEND_ROLE_ARN を backend
                              の実行ロールに置換してください。読み取り権限ポリシーは
                              README を参照してください。
                            </p>
                          </details>
                        </>
                      )}
                      {c.error && <p className="connection-error">{c.error}</p>}
                      <small>
                        最終同期：
                        {c.lastSync
                          ? new Date(c.lastSync).toLocaleString("ja-JP")
                          : "未実行"}
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
                          {c.status === "syncing"
                            ? "同期中..."
                            : "接続して同期"}
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
                          接続を解除
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
                    <h3>診断対象の所有確認</h3>
                    <label>
                      正確なホスト名
                      <input
                        value={hostname}
                        onChange={(e) => setHostname(e.target.value)}
                        placeholder="app.example.com"
                        required
                      />
                    </label>
                    <p className="console-hint">
                      DNS TXT
                      で所有確認した公開ホストのみ診断できます。診断範囲は HTTPS
                      の GET / と TLS 証明書（TCP
                      443）です。リダイレクト先には接続しません。
                    </p>
                    <button className="primary-button" disabled={busy}>
                      DNS チャレンジを発行
                    </button>
                  </form>
                  {challenge && (
                    <div className="challenge-card">
                      <h3>DNS に TXT レコードを追加</h3>
                      <label>
                        レコード名<code>{challenge.recordName}</code>
                      </label>
                      <label>
                        値<code>{challenge.recordValue}</code>
                      </label>
                      <p>
                        値はこの画面でのみ表示します。再発行する場合は対象の承認を取り消して再登録してください。有効期限は
                        24 時間です。
                      </p>
                    </div>
                  )}
                  <div className="console-hint">
                    検出対象：TLS 証明書の検証・期限、HSTS、CSP、MIME sniffing
                    防止。ソフトウェアの CVE 検出や侵入試験は含みません。
                  </div>
                </div>
                <div className="console-list">
                  <h3>診断対象と実行履歴</h3>
                  {!snapshot?.targets.length && (
                    <p className="console-empty">
                      対象を登録し、DNS 所有確認を行ってください。
                    </p>
                  )}
                  {snapshot?.targets.map((t) => {
                    const verified = Date.parse(t.verifiedUntil) > now;
                    return (
                      <article className="connection-card" key={t.id}>
                        <div className="connection-card-heading">
                          <strong>{t.hostname}</strong>
                          <span
                            className={`connection-state ${verified ? "connected" : "pending"}`}
                          >
                            {verified ? "所有確認済み" : "未確認 / 期限切れ"}
                          </span>
                        </div>
                        <small>
                          承認期限：
                          {verified
                            ? new Date(t.verifiedUntil).toLocaleString("ja-JP")
                            : "—"}
                        </small>
                        <div className="connection-actions">
                          <button
                            disabled={busy}
                            onClick={() =>
                              void act(async () => {
                                await securityRequest(
                                  `targets/${t.id}/verify`,
                                  "POST",
                                  {},
                                );
                                await refresh();
                              })
                            }
                          >
                            DNS を確認
                          </button>
                          <button
                            disabled={busy}
                            onClick={() =>
                              void act(async () => {
                                await securityRequest(
                                  `targets/${t.id}`,
                                  "DELETE",
                                );
                                if (challenge?.target.id === t.id)
                                  setChallenge(null);
                                await refresh();
                              })
                            }
                          >
                            承認を取り消す
                          </button>
                        </div>
                        <label className="authorization-check">
                          <input
                            type="checkbox"
                            checked={!!authorized[t.id]}
                            onChange={(e) =>
                              setAuthorized((a) => ({
                                ...a,
                                [t.id]: e.target.checked,
                              }))
                            }
                          />
                          このホストへの HTTPS・TLS
                          検査の実行権限があり、サービス提供者の許可範囲内であることを確認しました。
                        </label>
                        <button
                          className="scan-button"
                          disabled={
                            busy ||
                            !verified ||
                            !authorized[t.id] ||
                            snapshot.jobs.some(
                              (j) =>
                                j.targetId === t.id &&
                                j.status === "running" &&
                                Date.parse(j.deadline) > now,
                            )
                          }
                          onClick={() =>
                            void act(async () => {
                              await securityRequest("jobs", "POST", {
                                targetId: t.id,
                                authorized: true,
                              });
                              setAuthorized((a) => ({ ...a, [t.id]: false }));
                              await refresh();
                            })
                          }
                        >
                          HTTPS・TLS 診断を実行
                        </button>
                      </article>
                    );
                  })}
                  {snapshot?.jobs
                    .slice()
                    .reverse()
                    .slice(0, 20)
                    .map((j) => (
                      <div className="job-row" key={j.id}>
                        <div>
                          <strong>{j.hostname}</strong>
                          <small>
                            {new Date(j.createdAt).toLocaleString("ja-JP")}
                          </small>
                        </div>
                        <span className={`connection-state ${j.status}`}>
                          {j.status === "running" &&
                          Date.parse(j.deadline) <= now
                            ? "期限超過・状態を確認"
                            : j.status}
                        </span>
                        {j.error && <p>{j.error}</p>}
                      </div>
                    ))}
                </div>
              </div>
            )}
            <div className="console-footer">
              <span>実環境データのみ収録 · デモデータとは分離</span>
              <button disabled={busy} onClick={() => void act(refresh)}>
                最新状態を取得
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
