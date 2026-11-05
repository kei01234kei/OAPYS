"use client";

import { useEffect, useState } from "react";
import { useAgentTasks } from "@/lib/use-agent-tasks";
import type { Target } from "@/lib/security-types";
import {
  isActiveStatus,
  type AgentEvidence,
  type ApprovalRequest,
} from "@/lib/agent-types";
import { useLocale, useMessages } from "@/components/locale-provider";
import { agentTasksMessages } from "@/i18n/agent-tasks";
import { intlLocale } from "@/lib/i18n";

// Mirrors the backend's concurrent autonomous task limit.
const maxConcurrentTasks = 4;

type Props = {
  live: boolean;
  targets: Target[];
  onManageTargets: () => void;
  onFocusAsset: (id: string) => void;
};

function prettyArgs(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function EvidenceCard({
  evidence,
  onClose,
}: {
  evidence: AgentEvidence;
  onClose: () => void;
}) {
  const t = useMessages(agentTasksMessages).evidence;
  const dateLocale = intlLocale(useLocale());
  return (
    <section className="agent-evidence-card" aria-label={t.heading}>
      <div className="agent-evidence-head">
        <strong>
          {evidence.kind === "bash" ? t.bash : t.http} · {evidence.label}
        </strong>
        <button aria-label={t.close} onClick={onClose}>
          ✕
        </button>
      </div>
      <small>
        {t.capturedAt}
        {new Date(evidence.capturedAt).toLocaleString(dateLocale)}
      </small>
      <pre className="agent-evidence-data">{prettyArgs(evidence.data)}</pre>
    </section>
  );
}

function ApprovalCard({
  approval,
  deciding,
  onDecide,
}: {
  approval: ApprovalRequest;
  deciding: string | null;
  onDecide: (id: string, decision: "approve" | "deny") => void;
}) {
  const t = useMessages(agentTasksMessages).approvals;
  const dateLocale = intlLocale(useLocale());
  const pending = approval.status === "pending";
  const busy = deciding === approval.id;
  return (
    <article className={`agent-approval ${approval.status}`}>
      <header>
        <span className="agent-approval-tool">{approval.tool}</span>
        <span className={`agent-approval-state ${approval.status}`}>
          {approval.status}
        </span>
      </header>
      <p className="agent-approval-reason">
        <strong>{t.reason}:</strong> {approval.reason}
      </p>
      <pre className="agent-approval-args">{prettyArgs(approval.args)}</pre>
      {pending ? (
        <div className="agent-approval-actions">
          <small>
            {t.expires}: {new Date(approval.expiresAt).toLocaleTimeString(dateLocale)}
          </small>
          <div>
            <button
              className="agent-deny"
              disabled={busy}
              onClick={() => onDecide(approval.id, "deny")}
            >
              {busy ? t.deciding : t.deny}
            </button>
            <button
              className="agent-approve"
              disabled={busy}
              onClick={() => onDecide(approval.id, "approve")}
            >
              {busy ? t.deciding : t.approve}
            </button>
          </div>
        </div>
      ) : (
        <small className="agent-approval-decided">{t.decided(approval.status)}</small>
      )}
    </article>
  );
}

export default function AgentTasksWorkspace({
  live,
  targets,
  onManageTargets,
  onFocusAsset,
}: Props) {
  const {
    info,
    tasks,
    selectedId,
    setSelectedId,
    task,
    busy,
    deciding,
    error,
    runningCount,
    start,
    control,
    decide,
  } = useAgentTasks(live);
  const t = useMessages(agentTasksMessages);
  const dateLocale = intlLocale(useLocale());
  const [goal, setGoal] = useState("");
  const [targetId, setTargetId] = useState("");
  const [workers, setWorkers] = useState(2);
  const [deadline, setDeadline] = useState(60);
  const [authorized, setAuthorized] = useState(false);
  const [openEvidence, setOpenEvidence] = useState<string | null>(null);
  // Refresh the clock periodically so time-limited verifications expire in the
  // dropdown without a reload; a lazy initializer keeps render pure.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const verifiedTargets = targets.filter(
    (x) => new Date(x.verifiedUntil).getTime() > now,
  );
  const canStart =
    live &&
    !!info?.configured &&
    authorized &&
    goal.trim().length >= 3 &&
    !!targetId &&
    runningCount < maxConcurrentTasks &&
    !busy;

  const selectedEvidence = task?.evidence.find((e) => e.id === openEvidence);
  const pendingApprovals = (task?.approvals ?? []).filter(
    (a) => a.status === "pending",
  );
  const otherApprovals = (task?.approvals ?? [])
    .filter((a) => a.status !== "pending")
    .slice(-6)
    .reverse();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await start({
      goal: goal.trim(),
      targetId,
      workers,
      deadlineMinutes: deadline,
    });
    if (ok) {
      setGoal("");
      setAuthorized(false);
    }
  }

  return (
    <section className="agent-workspace" aria-label={t.sectionLabel}>
      <div className="agent-heading">
        <div className="agent-heading-title">
          <span className="ai-mark">⬡</span>
          <h2>{t.heading}</h2>
        </div>
        <span
          className={`ai-connection ${live && info?.configured ? "connected" : ""}`}
        >
          {!live
            ? t.demoNote
            : info === null
              ? t.connection.checking
              : info.configured
                ? `${info.label} · ${info.model}`
                : t.connection.notConfigured}
        </span>
      </div>

      <p className="agent-intro">{t.intro}</p>

      {error && (
        <div className="ai-error" role="alert">
          {error}
        </div>
      )}

      {!live ? (
        <div className="agent-demo-note">{t.demoNote}</div>
      ) : (
        <div className="agent-grid">
          <div className="agent-left">
            {/* New task form */}
            <form className="agent-form" onSubmit={submit}>
              <label htmlFor="agent-goal">{t.form.goalLabel}</label>
              <textarea
                id="agent-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder={t.form.goalPlaceholder}
                disabled={busy || runningCount >= maxConcurrentTasks}
              />
              <label htmlFor="agent-target">{t.form.targetLabel}</label>
              {verifiedTargets.length === 0 ? (
                <div className="agent-no-targets">
                  {t.form.noTargets}
                  <button type="button" onClick={onManageTargets}>
                    {t.form.manageTargets}
                  </button>
                </div>
              ) : (
                <select
                  id="agent-target"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  disabled={busy || runningCount >= maxConcurrentTasks}
                >
                  <option value="">{t.form.selectTarget}</option>
                  {verifiedTargets.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.hostname}
                    </option>
                  ))}
                </select>
              )}
              <div className="agent-form-row">
                <label>
                  {t.form.workersLabel}
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={workers}
                    onChange={(e) =>
                      setWorkers(
                        Math.max(1, Math.min(8, Number(e.target.value) || 1)),
                      )
                    }
                    disabled={busy || runningCount >= maxConcurrentTasks}
                  />
                </label>
                <label>
                  {t.form.deadlineLabel}
                  <input
                    type="number"
                    min={5}
                    max={10080}
                    value={deadline}
                    onChange={(e) =>
                      setDeadline(
                        Math.max(
                          5,
                          Math.min(10080, Number(e.target.value) || 5),
                        ),
                      )
                    }
                    disabled={busy || runningCount >= maxConcurrentTasks}
                  />
                </label>
              </div>
              <label className="agent-consent">
                <input
                  type="checkbox"
                  checked={authorized}
                  onChange={(e) => setAuthorized(e.target.checked)}
                  disabled={busy || runningCount >= maxConcurrentTasks}
                />
                {t.form.authorize}
              </label>
              {runningCount > 0 && (
                <p className="agent-running-note">{t.form.running}</p>
              )}
              {info && !info.configured && (
                <p className="agent-running-note">
                  {info.reason ?? t.connection.notConfigured}
                </p>
              )}
              <button className="primary-button" disabled={!canStart}>
                {busy ? t.form.submitBusy : t.form.submit}
              </button>
            </form>

            {/* Task list */}
            <div className="agent-list">
              <h3>{t.list.heading}</h3>
              {tasks.length === 0 ? (
                <p className="agent-muted">{t.list.empty}</p>
              ) : (
                <ul>
                  {tasks.map((x) => (
                    <li key={x.id}>
                      <button
                        className={selectedId === x.id ? "selected" : ""}
                        onClick={() => setSelectedId(x.id)}
                      >
                        <span className={`agent-status ${x.status}`}>
                          {t.status[x.status]}
                        </span>
                        <span className="agent-list-goal">{x.goal}</span>
                        <small>
                          {x.hostname} ·{" "}
                          {new Date(x.createdAt).toLocaleString(dateLocale)}
                        </small>
                        {x.pendingApprovals > 0 && (
                          <span className="agent-pending-badge">
                            {t.list.pending(x.pendingApprovals)}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Detail */}
          <div className="agent-detail" aria-live="polite">
            {!task ? (
              <p className="agent-muted agent-select-hint">{t.selectHint}</p>
            ) : (
              <>
                <div className="agent-detail-head">
                  <span className={`agent-status ${task.status}`}>
                    {isActiveStatus(task.status) && <i />}
                    {t.status[task.status]}
                  </span>
                  <div className="agent-controls">
                    {task.status === "running" && (
                      <button
                        disabled={busy}
                        onClick={() => void control("pause")}
                      >
                        {t.controls.pause}
                      </button>
                    )}
                    {task.status === "paused" && (
                      <button
                        disabled={busy}
                        onClick={() => void control("resume")}
                      >
                        {t.controls.resume}
                      </button>
                    )}
                    {isActiveStatus(task.status) && (
                      <button
                        className="agent-deny"
                        disabled={busy}
                        onClick={() => void control("cancel")}
                      >
                        {t.controls.cancel}
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="agent-detail-goal">{task.goal}</h3>
                <dl className="agent-meta">
                  <div>
                    <dt>{t.meta.target}</dt>
                    <dd>{task.hostname}</dd>
                  </div>
                  <div>
                    <dt>{t.meta.model}</dt>
                    <dd>
                      {task.provider} · {task.model}
                    </dd>
                  </div>
                  <div>
                    <dt>{t.meta.deadline}</dt>
                    <dd>{new Date(task.deadline).toLocaleString(dateLocale)}</dd>
                  </div>
                </dl>

                {task.error && <div className="ai-error">{task.error}</div>}
                {task.summary && (
                  <div className="agent-summary">
                    <strong>{t.summaryTitle}</strong>
                    <p>{task.summary}</p>
                  </div>
                )}

                {/* Approvals — the operator control surface */}
                <section className="agent-section">
                  <h4>{t.approvals.heading}</h4>
                  <p className="agent-approval-hint">{t.approvals.note}</p>
                  {pendingApprovals.length === 0 && otherApprovals.length === 0 ? (
                    <p className="agent-muted">{t.approvals.none}</p>
                  ) : (
                    <div className="agent-approvals">
                      {pendingApprovals.map((a) => (
                        <ApprovalCard
                          key={a.id}
                          approval={a}
                          deciding={deciding}
                          onDecide={decide}
                        />
                      ))}
                      {otherApprovals.map((a) => (
                        <ApprovalCard
                          key={a.id}
                          approval={a}
                          deciding={deciding}
                          onDecide={decide}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Run stats */}
                <section className="agent-section">
                  <h4>{t.stats.heading}</h4>
                  <div className="agent-stats">
                    {(
                      [
                        ["plannerTurns", task.stats.plannerTurns],
                        ["workerTurns", task.stats.workerTurns],
                        ["intents", task.stats.intents],
                        ["facts", task.stats.facts],
                        ["findings", task.stats.findings],
                        ["toolCalls", task.stats.toolCalls],
                        ["approvals", task.stats.approvals],
                      ] as const
                    ).map(([key, value]) => (
                      <div key={key} className="agent-stat">
                        <span className="agent-stat-value">{value}</span>
                        <span className="agent-stat-label">{t.stats[key]}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Shared todolist */}
                <section className="agent-section">
                  <h4>{t.graph.todo}</h4>
                  {task.todo.length === 0 ? (
                    <p className="agent-muted">{t.graph.noTodo}</p>
                  ) : (
                    <ol className="agent-todo">
                      {task.todo.map((item) => (
                        <li key={item.id} className={`todo-${item.status}`}>
                          <span className="agent-todo-status">
                            {t.nodeStatus[
                              item.status as keyof typeof t.nodeStatus
                            ] ?? item.status}
                          </span>
                          {item.text}
                        </li>
                      ))}
                    </ol>
                  )}
                </section>

                {/* Exploration graph nodes */}
                <section className="agent-section">
                  <h4>
                    {t.graph.heading} · {task.nodes.length} {t.graph.nodes}
                  </h4>
                  {task.nodes.length === 0 ? (
                    <p className="agent-muted">{t.graph.noNodes}</p>
                  ) : (
                    <ul className="agent-nodes">
                      {task.nodes.map((n) => (
                        <li key={n.id} className={`node-${n.kind}`}>
                          <div className="agent-node-head">
                            <span className={`agent-node-kind ${n.kind}`}>
                              {t.kind[n.kind]}
                            </span>
                            {n.status && (
                              <span className="agent-node-status">
                                {t.nodeStatus[
                                  n.status as keyof typeof t.nodeStatus
                                ] ?? n.status}
                              </span>
                            )}
                          </div>
                          <span className="agent-node-title">{n.title}</span>
                          {n.detail && (
                            <small className="agent-node-detail">{n.detail}</small>
                          )}
                          {n.assetId && (
                            <button
                              className="agent-anchor"
                              onClick={() => onFocusAsset(n.assetId!)}
                            >
                              {t.graph.viewAsset}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Captured evidence */}
                <section className="agent-section">
                  <h4>{t.evidence.heading}</h4>
                  {task.evidence.length === 0 ? (
                    <p className="agent-muted">{t.evidence.none}</p>
                  ) : (
                    <div className="agent-evidence-list">
                      {task.evidence
                        .slice()
                        .reverse()
                        .map((e) => (
                          <button
                            key={e.id}
                            className="agent-evidence-chip"
                            onClick={() => setOpenEvidence(e.id)}
                          >
                            ↗ {e.kind === "bash" ? t.evidence.bash : t.evidence.http}{" "}
                            · {e.label}
                          </button>
                        ))}
                    </div>
                  )}
                  {selectedEvidence && (
                    <EvidenceCard
                      evidence={selectedEvidence}
                      onClose={() => setOpenEvidence(null)}
                    />
                  )}
                </section>

                {/* Live activity */}
                <section className="agent-section">
                  <h4>{t.activity.heading}</h4>
                  {task.activity.length === 0 ? (
                    <p className="agent-muted">{t.activity.none}</p>
                  ) : (
                    <ol className="agent-activity">
                      {task.activity
                        .slice()
                        .reverse()
                        .slice(0, 40)
                        .map((a, i) => (
                          <li key={`${a.at}-${i}`} className={`phase-${a.status}`}>
                            <span className="agent-activity-phase">{a.phase}</span>
                            <span className="agent-activity-label">
                              {a.status === "waiting_approval"
                                ? t.activity.waiting
                                : a.label}
                            </span>
                            <small>
                              {new Date(a.at).toLocaleTimeString(dateLocale)}
                            </small>
                          </li>
                        ))}
                    </ol>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
