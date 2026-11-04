"use client";

import type { useInvestigation } from "@/lib/use-investigation";
import { useLocale, useMessages } from "@/components/locale-provider";
import { investigationMessages } from "@/i18n/investigation-workspace";
import { intlLocale } from "@/lib/i18n";
import type { InvestigationEvidence } from "@/lib/investigation-types";

type Props = {
  live: boolean;
  investigation: ReturnType<typeof useInvestigation>;
  selectedAsset?: { id: string; name: string };
  onConnect: () => void;
  onFocus: (ids: string[]) => void;
};
function EvidenceDetails({ evidence }: { evidence: InvestigationEvidence }) {
  const d = evidence.data;
  const t = useMessages(investigationMessages).evidence;
  const dateLocale = intlLocale(useLocale());
  if (evidence.kind === "asset")
    return (
      <dl className="evidence-values">
        <div>
          <dt>{t.assetName}</dt>
          <dd>{String(d.name ?? "—")}</dd>
        </div>
        <div>
          <dt>{t.kindProvider}</dt>
          <dd>
            {String(d.kind ?? "—")} / {String(d.provider ?? "—")}
          </dd>
        </div>
        <div>
          <dt>{t.lastChecked}</dt>
          <dd>
            {typeof d.checkedAt === "string"
              ? new Date(d.checkedAt).toLocaleString(dateLocale)
              : t.notChecked}
          </dd>
        </div>
      </dl>
    );
  if (evidence.kind === "finding")
    return (
      <div className="evidence-text">
        <strong>{t.recordedEvidence}</strong>
        <p>{String(d.evidence ?? "—")}</p>
        <strong>{t.remediation}</strong>
        <p>{String(d.remediation ?? "—")}</p>
        <small>
          {t.detectedAt}
          {typeof d.detectedAt === "string"
            ? new Date(d.detectedAt).toLocaleString(dateLocale)
            : "—"}
        </small>
      </div>
    );
  if (evidence.kind === "workspace")
    return (
      <dl className="evidence-values">
        <div>
          <dt>{t.collectedAssets}</dt>
          <dd>{String(d.assets ?? 0)}</dd>
        </div>
        <div>
          <dt>{t.findings}</dt>
          <dd>{String(d.findings ?? 0)}</dd>
        </div>
        <div>
          <dt>{t.checkedResources}</dt>
          <dd>{String(d.checkedResources ?? 0)}</dd>
        </div>
        <div>
          <dt>{t.relationships}</dt>
          <dd>{String(d.relationships ?? 0)}</dd>
        </div>
      </dl>
    );
  const edges = Array.isArray(d.edges) ? d.edges : [];
  return (
    <div className="evidence-text">
      <p>{t.edgesReferenced(edges.length)}</p>
      {d.truncated === true && <p>{t.truncated}</p>}
    </div>
  );
}

export default function InvestigationWorkspace({
  live,
  selectedAsset,
  onConnect,
  onFocus,
  investigation,
}: Props) {
  const {
    info,
    history,
    run,
    question,
    setQuestion,
    shareData,
    setShareData,
    busy,
    error,
    setOpenedEvidence,
    running,
    start,
    load,
    cancel,
    evidenceAssets,
    selectedEvidence,
  } = investigation;
  const t = useMessages(investigationMessages);
  const dateLocale = intlLocale(useLocale());
  return (
    <section
      className="ai-workspace"
      id="ai-investigation"
      aria-label={t.sectionLabel}
    >
      <div className="ai-heading">
        <div className="ai-heading-title">
          <span className="ai-mark">✧</span>
          <div>
            <h2>{t.heading}</h2>
          </div>
        </div>
        <span
          className={`ai-connection ${live && info?.configured ? "connected" : ""}`}
        >
          {!live
            ? t.connection.intro
            : info === null
              ? t.connection.checking
              : info.configured
                ? `${info.label} · ${info.model}`
                : t.connection.notConfigured}
        </span>
      </div>
      <div className="ai-body">
        <div className="ai-input-area">
          <p className="ai-intro">{t.intro}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (live) void start();
              else onConnect();
            }}
          >
            <label className="ai-question-label" htmlFor="ai-question">
              {t.questionLabel}
            </label>
            <textarea
              id="ai-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder={t.placeholder}
              disabled={busy || running}
            />
            <div className="ai-prompt-examples">
              {t.questions.map((q, i) => (
                <button
                  key={q}
                  type="button"
                  disabled={running}
                  onClick={() => setQuestion(q)}
                >
                  {t.questionButtons[i]}
                </button>
              ))}
            </div>
            <div className="ai-scope">
              <span>{t.scope}</span>
              <strong>
                {live && selectedAsset ? selectedAsset.name : t.wholeWorkspace}
              </strong>
              {live && selectedAsset && <small>{t.scopeHint}</small>}
            </div>
            {live && (
              <label className="ai-consent">
                <input
                  type="checkbox"
                  checked={shareData}
                  onChange={(e) => setShareData(e.target.checked)}
                  disabled={running}
                />
                {t.consent}
              </label>
            )}
            <div className="ai-input-footer">
              <span>{live ? t.footerLive : t.footerDemo}</span>
              <button
                className="primary-button"
                disabled={
                  busy ||
                  running ||
                  (live &&
                    (!info?.configured ||
                      !shareData ||
                      question.trim().length < 3))
                }
              >
                {running
                  ? t.submit.running
                  : busy
                    ? t.submit.busy
                    : live
                      ? t.submit.live
                      : t.submit.demo}
              </button>
            </div>
          </form>
          {live && info && !info.configured && (
            <div className="ai-setup-note">
              {info.reason} {t.setupNote}
            </div>
          )}
          {error && (
            <div className="ai-error" role="alert">
              {error}
              <button onClick={onConnect}>{t.checkConnection}</button>
            </div>
          )}
          {history.length > 0 && (
            <label className="ai-history">
              {t.history}
              <select
                value={run?.id ?? ""}
                onChange={(e) => {
                  if (e.target.value) void load(e.target.value);
                }}
                disabled={busy || running}
              >
                <option value="">{t.selectHistory}</option>
                {history.map((h) => (
                  <option key={h.id} value={h.id}>
                    {new Date(h.createdAt).toLocaleString(dateLocale)} ·{" "}
                    {t.status[h.status]} · {h.question.slice(0, 35)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="ai-result-area" aria-live="polite">
          {!run ? (
            <div className="ai-flow">
              <h3>{t.result}</h3>
              <p>{t.resultIntro}</p>
              <details>
                <summary>{t.flowSummary}</summary>
                <ol>
                  {t.flow.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </details>
              <small>{live ? t.resultLive : t.resultDemo}</small>
            </div>
          ) : (
            <>
              <div className="ai-run-heading">
                <span className={`ai-run-status ${run.status}`}>
                  {running && <i />}
                  {t.status[run.status]}
                </span>
                <small>
                  {run.provider} ·{" "}
                  {t.asOf(new Date(run.snapshotAt).toLocaleString(dateLocale))}
                </small>
                {running && (
                  <button disabled={busy} onClick={() => void cancel()}>
                    {t.cancel}
                  </button>
                )}
              </div>
              {run.steps.length > 0 && (
                <details className="ai-steps" open={running}>
                  <summary>{t.steps(run.steps.length)}</summary>
                  <ol>
                    {run.steps.map((step, i) => (
                      <li key={`${step.at}-${i}`}>
                        <span>✓</span>
                        {step.label}
                      </li>
                    ))}
                  </ol>
                </details>
              )}
              {running && (
                <div className="ai-running">
                  <span className="ai-mark">✧</span>
                  <p>{run.steps.at(-1)?.label ?? t.preparing}</p>
                  <small>{t.runningNote}</small>
                </div>
              )}
              {run.error && (
                <div className="ai-error">
                  {run.error}
                  <p>{t.failedNote}</p>
                </div>
              )}
              {run.report && (
                <div className="ai-report">
                  <span className="ai-result-kicker">
                    AI INVESTIGATION REPORT
                  </span>
                  <h3>{run.report.title}</h3>
                  <p className="ai-report-summary">{run.report.summary}</p>
                  <p className="ai-interpretation-note">{t.interpretation}</p>
                  {run.report.observations.map((o, i) => (
                    <article key={i} className="ai-observation">
                      <div>
                        <span className={`ai-basis ${o.basis}`}>
                          {o.basis === "inferred" ? t.inferred : t.observed}
                        </span>
                        <h4>{o.title}</h4>
                      </div>
                      <p>{o.explanation}</p>
                      <div className="ai-citations">
                        {o.evidenceIds.map((id) => (
                          <button
                            key={id}
                            onClick={() => setOpenedEvidence(id)}
                          >
                            ↗{" "}
                            {run.evidence.find((e) => e.id === id)?.label ?? id}
                          </button>
                        ))}
                      </div>
                      {o.recommendation && (
                        <p className="ai-recommendation">
                          <strong>{t.recommendation}</strong>
                          {o.recommendation}
                        </p>
                      )}
                      {evidenceAssets(o.evidenceIds).length > 0 && (
                        <button
                          className="ai-graph-link"
                          onClick={() => onFocus(evidenceAssets(o.evidenceIds))}
                        >
                          {t.viewRelated}
                        </button>
                      )}
                    </article>
                  ))}
                  {run.report.unknowns.length > 0 && (
                    <div className="ai-unknowns">
                      <h4>{t.unknowns}</h4>
                      <ul>
                        {run.report.unknowns.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {run.report.nextSteps.length > 0 && (
                    <div className="ai-next-steps">
                      <h4>{t.nextSteps}</h4>
                      <ol>
                        {run.report.nextSteps.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ol>
                      <small>{t.nextStepsNote}</small>
                    </div>
                  )}
                  {run.report.graphAssetIds.length > 0 && (
                    <button
                      className="ai-graph-overview"
                      onClick={() => onFocus(run.report!.graphAssetIds)}
                    >
                      {t.viewAll}
                    </button>
                  )}
                </div>
              )}
              {selectedEvidence && (
                <section
                  className="ai-evidence-card"
                  aria-label={t.evidenceLabel}
                >
                  <div>
                    <strong>{t.evidenceTitle(selectedEvidence.label)}</strong>
                    <button
                      aria-label={t.closeEvidence}
                      onClick={() => setOpenedEvidence(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <small>
                    {t.capturedAt}
                    {new Date(selectedEvidence.capturedAt).toLocaleString(
                      dateLocale,
                    )}
                  </small>
                  <EvidenceDetails evidence={selectedEvidence} />
                  {selectedEvidence.assetIds.length > 0 && (
                    <button
                      className="ai-graph-link"
                      onClick={() => onFocus(selectedEvidence.assetIds)}
                    >
                      {t.viewEvidenceAssets}
                    </button>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
