"use client";

import { useEffect, useRef, useState } from "react";
import { securityRequest } from "@/lib/security-types";
import type {
  AIStatus,
  Investigation,
  InvestigationEvidence,
} from "@/lib/investigation-types";

type Props = {
  live: boolean;
  investigation: ReturnType<typeof useInvestigation>;
  selectedAsset?: { id: string; name: string };
  onConnect: () => void;
  onFocus: (ids: string[]) => void;
};
const questions = [
  "いま優先して確認すべきリスクと、その根拠を教えて",
  "選択した管理対象の検出結果と関連する管理対象を調べて",
  "診断の空白と収集データの古さを整理して",
];
const statusNames = {
  running: "調査中",
  completed: "調査完了",
  failed: "調査失敗",
  cancelled: "中止済み",
};
function EvidenceDetails({ evidence }: { evidence: InvestigationEvidence }) {
  const d = evidence.data;
  if (evidence.kind === "asset")
    return (
      <dl className="evidence-values">
        <div>
          <dt>管理対象の名前</dt>
          <dd>{String(d.name ?? "—")}</dd>
        </div>
        <div>
          <dt>種類 / 環境</dt>
          <dd>
            {String(d.kind ?? "—")} / {String(d.provider ?? "—")}
          </dd>
        </div>
        <div>
          <dt>最終チェック</dt>
          <dd>
            {typeof d.checkedAt === "string"
              ? new Date(d.checkedAt).toLocaleString("ja-JP")
              : "未実施"}
          </dd>
        </div>
      </dl>
    );
  if (evidence.kind === "finding")
    return (
      <div className="evidence-text">
        <strong>記録された証跡</strong>
        <p>{String(d.evidence ?? "—")}</p>
        <strong>推奨対応</strong>
        <p>{String(d.remediation ?? "—")}</p>
        <small>
          検出日時：
          {typeof d.detectedAt === "string"
            ? new Date(d.detectedAt).toLocaleString("ja-JP")
            : "—"}
        </small>
      </div>
    );
  if (evidence.kind === "workspace")
    return (
      <dl className="evidence-values">
        <div>
          <dt>取得済みの管理対象</dt>
          <dd>{String(d.assets ?? 0)}</dd>
        </div>
        <div>
          <dt>検出結果</dt>
          <dd>{String(d.findings ?? 0)}</dd>
        </div>
        <div>
          <dt>チェック済みリソース</dt>
          <dd>{String(d.checkedResources ?? 0)}</dd>
        </div>
        <div>
          <dt>構成上の関係</dt>
          <dd>{String(d.relationships ?? 0)}</dd>
        </div>
      </dl>
    );
  const edges = Array.isArray(d.edges) ? d.edges : [];
  return (
    <div className="evidence-text">
      <p>
        {edges.length}{" "}
        件の構成上の関係を参照しました。実際の通信到達性は未検証です。
      </p>
      {d.truncated === true && (
        <p>表示上限があるため、一部の関係だけを参照しています。</p>
      )}
    </div>
  );
}

export function useInvestigation(
  live: boolean,
  selectedAsset?: { id: string; name: string },
) {
  const sessionVersion = useRef(0);
  const [info, setInfo] = useState<AIStatus | null>(null);
  const [history, setHistory] = useState<Investigation[]>([]);
  const [run, setRun] = useState<Investigation | null>(null);
  const [question, setQuestion] = useState(questions[0]);
  const [shareData, setShareData] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [openedEvidence, setOpenedEvidence] = useState<string | null>(null);
  const running = run?.status === "running";
  const runID = run?.id;
  const runStatus = run?.status;
  useEffect(() => {
    if (!live) return;
    const version = sessionVersion.current;
    let active = true;
    Promise.all([
      securityRequest<AIStatus>("ai/status"),
      securityRequest<{ investigations: Investigation[] }>("investigations"),
    ])
      .then(([status, records]) => {
        if (active && version === sessionVersion.current) {
          setInfo(status);
          setHistory(records.investigations);
        }
      })
      .catch((e) => {
        if (active && version === sessionVersion.current) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [live]);
  useEffect(() => {
    if (!live || !runID || runStatus !== "running") return;
    const version = sessionVersion.current;
    let active = true,
      pending = false;
    const timer = setInterval(async () => {
      if (pending) return;
      pending = true;
      try {
        const current = await securityRequest<Investigation>(
          `investigations/${runID}`,
        );
        if (active && version === sessionVersion.current) {
          setRun(current);
        }
      } catch (e) {
        if (active && version === sessionVersion.current)
          setError(e instanceof Error ? e.message : "調査状態を取得できません");
      } finally {
        pending = false;
      }
    }, 2000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [live, runID, runStatus]);
  useEffect(() => {
    if (!live || !runID || runStatus === "running") return;
    const version = sessionVersion.current;
    let active = true;
    securityRequest<{ investigations: Investigation[] }>("investigations")
      .then((records) => {
        if (active && version === sessionVersion.current)
          setHistory(records.investigations);
      })
      .catch((e) => {
        if (active && version === sessionVersion.current)
          setError(e instanceof Error ? e.message : "履歴を更新できません");
      });
    return () => {
      active = false;
    };
  }, [live, runID, runStatus]);
  async function start() {
    const version = sessionVersion.current;
    setBusy(true);
    setError("");
    setOpenedEvidence(null);
    try {
      const current = await securityRequest<Investigation>(
        "investigations",
        "POST",
        { question, assetId: selectedAsset?.id ?? "", shareData },
      );
      if (version !== sessionVersion.current) return;
      setRun(current);
      setShareData(false);
    } catch (e) {
      if (version !== sessionVersion.current) return;
      setError(e instanceof Error ? e.message : "調査を開始できませんでした");
    } finally {
      if (version === sessionVersion.current) setBusy(false);
    }
  }
  async function load(id: string) {
    const version = sessionVersion.current;
    setBusy(true);
    setError("");
    setOpenedEvidence(null);
    try {
      const current = await securityRequest<Investigation>(
        `investigations/${id}`,
      );
      if (version === sessionVersion.current) setRun(current);
    } catch (e) {
      if (version !== sessionVersion.current) return;
      setError(e instanceof Error ? e.message : "履歴を取得できません");
    } finally {
      if (version === sessionVersion.current) setBusy(false);
    }
  }
  async function cancel() {
    if (!run) return;
    const version = sessionVersion.current;
    setBusy(true);
    try {
      await securityRequest(`investigations/${run.id}/cancel`, "POST", {});
      if (version !== sessionVersion.current) return;
      const current = await securityRequest<Investigation>(
        `investigations/${run.id}`,
      );
      if (version === sessionVersion.current) setRun(current);
    } catch (e) {
      if (version !== sessionVersion.current) return;
      setError(e instanceof Error ? e.message : "中止できません");
    } finally {
      if (version === sessionVersion.current) setBusy(false);
    }
  }
  function evidenceAssets(ids: string[]) {
    return [
      ...new Set(
        run?.evidence
          .filter((e) => ids.includes(e.id))
          .flatMap((e) => e.assetIds) ?? [],
      ),
    ];
  }
  const selectedEvidence = run?.evidence.find((e) => e.id === openedEvidence);
  function reset() {
    sessionVersion.current += 1;
    setBusy(false);
    setInfo(null);
    setHistory([]);
    setRun(null);
    setShareData(false);
    setError("");
    setOpenedEvidence(null);
  }
  return {
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
    reset,
  };
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
  return (
    <section
      className="ai-workspace"
      id="ai-investigation"
      aria-label="AI による調査と説明"
    >
      <div className="ai-heading">
        <div className="ai-heading-title">
          <span className="ai-mark">✧</span>
          <div>
            <h2>AI に調査を依頼</h2>
          </div>
        </div>
        <span
          className={`ai-connection ${live && info?.configured ? "connected" : ""}`}
        >
          {!live
            ? "ワークフローの紹介"
            : info === null
              ? "接続状態を確認中"
              : info.configured
                ? `${info.label} · ${info.model}`
                : "AI 接続先：未設定"}
        </span>
      </div>
      <div className="ai-body">
        <div className="ai-input-area">
          <p className="ai-intro">
            知りたいことを伝えると、AI
            が管理対象・検出結果・システム構成図を調べ、優先順位と次の確認事項を整理します。
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (live) void start();
              else onConnect();
            }}
          >
            <label className="ai-question-label" htmlFor="ai-question">
              調べたいこと
            </label>
            <textarea
              id="ai-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="例：この環境で最初に対応すべきリスクは？"
              disabled={busy || running}
            />
            <div className="ai-prompt-examples">
              {questions.map((q, i) => (
                <button
                  key={q}
                  type="button"
                  disabled={running}
                  onClick={() => setQuestion(q)}
                >
                  {
                    [
                      "優先順位を調べる",
                      "関連と影響を調べる",
                      "診断の空白を調べる",
                    ][i]
                  }
                </button>
              ))}
            </div>
            <div className="ai-scope">
              <span>調査の起点</span>
              <strong>
                {live && selectedAsset
                  ? selectedAsset.name
                  : "ワークスペース全体"}
              </strong>
              {live && selectedAsset && (
                <small>システム構成図を選ぶと、起点も変わります</small>
              )}
            </div>
            {live && (
              <label className="ai-consent">
                <input
                  type="checkbox"
                  checked={shareData}
                  onChange={(e) => setShareData(e.target.checked)}
                  disabled={running}
                />
                質問と、調査に必要な管理対象の名前・設定・検出結果を、設定済みの
                AI 接続先に送信します。
              </label>
            )}
            <div className="ai-input-footer">
              <span>
                {live
                  ? "参照専用の調査 · 最大 2 分"
                  : "実環境の調査には管理者ログインが必要です"}
              </span>
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
                  ? "調査中..."
                  : busy
                    ? "処理中..."
                    : live
                      ? "AI に調査を依頼 ↗"
                      : "実環境で調査する ↗"}
              </button>
            </div>
          </form>
          {live && info && !info.configured && (
            <div className="ai-setup-note">
              {info.reason}{" "}
              接続先は後から交換できます。接続されるまでモデルの呼び出しは行いません。
            </div>
          )}
          {error && (
            <div className="ai-error" role="alert">
              {error}
              <button onClick={onConnect}>接続・ログインを確認</button>
            </div>
          )}
          {history.length > 0 && (
            <label className="ai-history">
              調査履歴
              <select
                value={run?.id ?? ""}
                onChange={(e) => {
                  if (e.target.value) void load(e.target.value);
                }}
                disabled={busy || running}
              >
                <option value="">履歴を選択</option>
                {history.map((h) => (
                  <option key={h.id} value={h.id}>
                    {new Date(h.createdAt).toLocaleString("ja-JP")} ·{" "}
                    {statusNames[h.status]} · {h.question.slice(0, 35)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="ai-result-area" aria-live="polite">
          {!run ? (
            <div className="ai-flow">
              <h3>調査結果</h3>
              <p>
                調べたいことを入力すると、根拠とともにリスクの優先順位と次の対応を整理します。
              </p>
              <details>
                <summary>AI 調査の流れ</summary>
                <ol>
                  <li>管理対象と検出結果を確認</li>
                  <li>システム構成図から影響を調査</li>
                  <li>根拠・不明点・推奨対応を整理</li>
                  <li>グラフと証跡で結果を確認</li>
                </ol>
              </details>
              <small>
                {live
                  ? "調査結果はここに表示され、履歴に保存されます。"
                  : "仕組みの説明です。この表示で AI は実行していません。"}
              </small>
            </div>
          ) : (
            <>
              <div className="ai-run-heading">
                <span className={`ai-run-status ${run.status}`}>
                  {running && <i />}
                  {statusNames[run.status]}
                </span>
                <small>
                  {run.provider} ·{" "}
                  {new Date(run.snapshotAt).toLocaleString("ja-JP")} 時点
                </small>
                {running && (
                  <button disabled={busy} onClick={() => void cancel()}>
                    調査を中止
                  </button>
                )}
              </div>
              {run.steps.length > 0 && (
                <details className="ai-steps" open={running}>
                  <summary>
                    参照した調査手順 · {run.steps.length} ステップ
                  </summary>
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
                  <p>{run.steps.at(-1)?.label ?? "調査の準備をしています"}</p>
                  <small>AI が必要なデータを選び、調査を進めています。</small>
                </div>
              )}
              {run.error && (
                <div className="ai-error">
                  {run.error}
                  <p>
                    完了したレポートとしては扱いません。質問を絞るか、接続設定を確認して再実行してください。
                  </p>
                </div>
              )}
              {run.report && (
                <div className="ai-report">
                  <span className="ai-result-kicker">
                    AI INVESTIGATION REPORT
                  </span>
                  <h3>{run.report.title}</h3>
                  <p className="ai-report-summary">{run.report.summary}</p>
                  <p className="ai-interpretation-note">
                    AI
                    による解釈です。根拠のデータと推論を確認して判断してください。
                  </p>
                  {run.report.observations.map((o, i) => (
                    <article key={i} className="ai-observation">
                      <div>
                        <span className={`ai-basis ${o.basis}`}>
                          {o.basis === "inferred"
                            ? "推論・要確認"
                            : "観測データの解釈"}
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
                          <strong>推奨する確認・対応</strong>
                          {o.recommendation}
                        </p>
                      )}
                      {evidenceAssets(o.evidenceIds).length > 0 && (
                        <button
                          className="ai-graph-link"
                          onClick={() => onFocus(evidenceAssets(o.evidenceIds))}
                        >
                          関連する管理対象をグラフで確認 →
                        </button>
                      )}
                    </article>
                  ))}
                  {run.report.unknowns.length > 0 && (
                    <div className="ai-unknowns">
                      <h4>まだ分からないこと</h4>
                      <ul>
                        {run.report.unknowns.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {run.report.nextSteps.length > 0 && (
                    <div className="ai-next-steps">
                      <h4>次に確認すること</h4>
                      <ol>
                        {run.report.nextSteps.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ol>
                      <small>
                        提案した追加診断や変更は、この調査から自動実行しません。
                      </small>
                    </div>
                  )}
                  {run.report.graphAssetIds.length > 0 && (
                    <button
                      className="ai-graph-overview"
                      onClick={() => onFocus(run.report!.graphAssetIds)}
                    >
                      調査全体の関連する管理対象をグラフで見る →
                    </button>
                  )}
                </div>
              )}
              {selectedEvidence && (
                <section className="ai-evidence-card" aria-label="調査の根拠">
                  <div>
                    <strong>参照した根拠 · {selectedEvidence.label}</strong>
                    <button
                      aria-label="根拠を閉じる"
                      onClick={() => setOpenedEvidence(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <small>
                    調査時点の記録：
                    {new Date(selectedEvidence.capturedAt).toLocaleString(
                      "ja-JP",
                    )}
                  </small>
                  <EvidenceDetails evidence={selectedEvidence} />
                  {selectedEvidence.assetIds.length > 0 && (
                    <button
                      className="ai-graph-link"
                      onClick={() => onFocus(selectedEvidence.assetIds)}
                    >
                      この根拠の管理対象をグラフで確認 →
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
