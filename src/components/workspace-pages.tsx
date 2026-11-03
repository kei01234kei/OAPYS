"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import InvestigationWorkspace from "@/components/investigation-workspace";
import ConnectionConsole from "@/components/connection-console";
import ExploitGraph, { exploitPaths } from "@/components/exploit-graph";
import type { Exploit, LiveFinding, ScanJob } from "@/lib/security-types";
import { Icon, riskLabel, useWorkspace } from "@/components/security-workspace";

export function OverviewPage() {
  const {
    snapshot,
    live,
    assets,
    findings,
    resources,
    scanned,
    coverage,
    setRisk,
    realEdges,
    showCoverage,
    explore,
  } = useWorkspace();
  return (
    <>
      <section
        id="workspace-summary"
        className="metrics"
        aria-label="管理対象とリスクのサマリー"
      >
        <button
          className="metric"
          onClick={() => {
            showCoverage();
          }}
        >
          <span className="metric-label">
            検出された管理対象
            <Icon name="layers" size={16} />
          </span>
          <span className="metric-value">
            {
              assets.filter((a) => a.kind !== "Organization" && !a.component)
                .length
            }
            <small className="metric-neutral">
              {live ? (snapshot?.connections.length ?? 0) : 2} cloud
              environments
            </small>
          </span>
          <span className="metric-foot">
            <span className="tiny-dot mint" />
            すべての接続済み環境
          </span>
        </button>
        <button
          className="metric"
          onClick={() => {
            showCoverage("scanned");
          }}
        >
          <span className="metric-label">
            チェック状況
            <Icon name="shield" size={16} />
          </span>
          <span className="metric-value">
            {coverage}
            <span className="percent">%</span>
            <small className="metric-positive">
              {scanned} / {resources.length} resources
            </small>
          </span>
          <span className="coverage-bar">
            <i style={{ width: `${coverage}%` }} />
          </span>
        </button>
        <button
          className="metric"
          onClick={() => {
            showCoverage("critical");
          }}
        >
          <span className="metric-label">
            重大なリスク
            <Icon name="shield" size={16} />
          </span>
          <span className="metric-value">
            {findings.filter((f) => f.severity === "critical").length}
            <small className="critical-text">Critical findings</small>
          </span>
          <span className="metric-foot">
            <span className="tiny-dot red" />
            優先的な対応が必要
          </span>
        </button>
        <button
          className="metric"
          onClick={() => {
            setRisk("all");
            if (live) showCoverage();
            else explore("domain");
          }}
        >
          <span className="metric-label">
            {live ? "構成上のつながり" : "攻撃経路（デモ）"}
            <Icon name="graph" size={16} />
          </span>
          <span className="metric-value">
            {live
              ? realEdges.filter((e) => e.relation !== "contains").length
              : 2}
            <small className="metric-neutral">
              {live ? "API で確認した関係" : "潜在的な侵入経路"}
            </small>
          </span>
          <span className="metric-foot">
            つながりから影響を理解する
            <Icon name="arrow" size={14} />
          </span>
        </button>
      </section>
      <div className="overview-links">
        <Link href="/assets">
          <Icon name="layers" />
          <strong>管理対象を確認</strong>
          <span>システム構成とエクスプロイトグラフを見る →</span>
        </Link>
        <Link href="/investigations">
          <Icon name="search" />
          <strong>AI に調査を依頼</strong>
          <span>リスクの優先順位と根拠を調べる →</span>
        </Link>
        <Link href="/settings">
          <Icon name="settings" />
          <strong>接続と診断を管理</strong>
          <span>クラウド接続・診断対象を設定する →</span>
        </Link>
      </div>
      <FindingsList limit={5} />
    </>
  );
}

export function AssetsPage() {
  const {
    snapshot,
    live,
    aiFocus,
    setAIFocus,
    view,
    setView,
    selected,
    setSelected,
    provider,
    setProvider,
    risk,
    setRisk,
    search,
    setSearch,
    zoom,
    setZoom,
    pan,
    setPan,
    drag,
    setDrag,
    detailTab,
    setDetailTab,
    query,
    visibleIds,
    shown,
    active,
    edges,
    graphAssets,
    graphHeight,
    clearFilters,
    explore,
    exportGraph,
    openSettings,
    findingAsset,
  } = useWorkspace();
  const exploit = live && view === "exploration";
  return (
    <section
      id="security-graph"
      className="graph-panel"
      aria-label="セキュリティグラフ"
    >
      <div className="graph-heading">
        <div className="graph-tabs" role="tablist" aria-label="グラフの種類">
          <button
            role="tab"
            aria-selected={view === "coverage"}
            className={view === "coverage" ? "active" : ""}
            onClick={() => {
              setView("coverage");
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            <Icon name="layers" size={16} />
            システム構成
          </button>
          <button
            role="tab"
            aria-selected={view === "exploration"}
            className={view === "exploration" ? "active" : ""}
            onClick={() => explore()}
          >
            <Icon name="graph" size={16} />
            {live ? "エクスプロイトグラフ" : "攻撃経路（デモ）"}
          </button>
        </div>
        <span className="graph-live">
          <span className="live-dot" />
          {live ? "Live data" : "Sample data"}
        </span>
      </div>
      {exploit ? (
        <ExploitPanel
          selected={selected}
          onSelect={setSelected}
          onShowInSystem={(id) => {
            setSelected(id);
            setDetailTab("overview");
            setView("coverage");
          }}
          onOpenSettings={() => openSettings("targets")}
        />
      ) : (
        <>
          <div className="graph-toolbar">
            <label className="search-field">
              <Icon name="search" size={16} />
              <input
                aria-label="管理対象を検索"
                placeholder="管理対象の名前・リソースタイプで検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>⌕</kbd>
            </label>
            <div className="filter-group">
              <select
                aria-label="クラウド環境"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="All">すべての環境</option>
                <option>AWS</option>
                <option>GCP</option>
                {live && <option>External</option>}
              </select>
              <select
                aria-label="リスク状態"
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
              >
                <option value="all">すべてのステータス</option>
                <option value="findings">検出結果のある管理対象</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="scanned">診断済み（全重要度）</option>
                <option value="covered">Covered</option>
                <option value="unscanned">Unscanned</option>
              </select>
              <span className="toolbar-divider" />
              <button
                className="icon-button"
                aria-label="グラフをリセット"
                onClick={() => {
                  clearFilters();
                  setPan({ x: 0, y: 0 });
                  setZoom(1);
                }}
              >
                <Icon name="refresh" size={16} />
              </button>
              <button
                className="icon-button"
                aria-label="グラフを JSON でエクスポート"
                onClick={exportGraph}
              >
                <Icon name="download" size={16} />
              </button>
            </div>
          </div>
          {aiFocus.length > 0 && (
            <div className="ai-focus-banner">
              <span>
                ✧ AI の説明に関連する {aiFocus.length} 管理対象を強調しています
              </span>
              <button onClick={() => setAIFocus([])}>強調を解除</button>
            </div>
          )}
          <div className="graph-content">
            <div className="graph-canvas">
              <div className="canvas-caption">
                <span className="canvas-mode">
                  {view === "coverage"
                    ? "ASSET TOPOLOGY"
                    : live
                      ? "ASSET RELATION EXPLORER"
                      : "ATTACK PATH EXPLORER"}
                </span>
                <span>
                  {view === "coverage"
                    ? live
                      ? "診断状況と構成上の関係。選んだ管理対象の関係名を表示します"
                      : "管理対象のつながりと診断状況"
                    : live
                      ? "確認済みの構成上の関係・到達可能性は未検証"
                      : "公開エンドポイントから重要システムへの経路"}
                </span>
              </div>
              {view === "exploration" && !live && (
                <div className="query-switch">
                  <button
                    className={query === "exposure" ? "chosen" : ""}
                    onClick={() => {
                      setSelected("web");
                    }}
                  >
                    公開ワークロード → データベース
                  </button>
                  <button
                    className={query === "storage" ? "chosen" : ""}
                    onClick={() => {
                      setSelected("bucket");
                    }}
                  >
                    ストレージの公開経路
                  </button>
                </div>
              )}
              <svg
                className={`network ${drag ? "dragging" : ""}`}
                viewBox={`0 0 ${live ? 1120 : 920} ${graphHeight}`}
                role="group"
                aria-label={
                  view === "coverage"
                    ? "管理対象の構成とチェック状況。各ノードを選択して詳細を表示"
                    : live
                      ? "管理対象間の構成上の関係。各ノードを選択して詳細を表示"
                      : "管理対象間の攻撃経路。各ノードを選択して詳細を表示"
                }
                onPointerDown={(e) => {
                  if (e.target === e.currentTarget) {
                    setDrag({ x: e.clientX - pan.x, y: e.clientY - pan.y });
                    e.currentTarget.setPointerCapture(e.pointerId);
                  }
                }}
                onPointerMove={(e) => {
                  if (drag)
                    setPan({ x: e.clientX - drag.x, y: e.clientY - drag.y });
                }}
                onPointerUp={() => setDrag(null)}
                onPointerCancel={() => setDrag(null)}
              >
                <defs>
                  <marker
                    id="arrow-end"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                  >
                    <path
                      d="M1 1l6 3-6 3"
                      fill="none"
                      className="attack-arrow"
                    />
                  </marker>
                </defs>
                <g
                  transform={`translate(${pan.x} ${pan.y}) translate(460 260) scale(${zoom}) translate(-460 -260)`}
                >
                  {edges.map(({ from, to, relation }) => (
                    <g
                      key={`${from.id}-${to.id}`}
                      opacity={
                        visibleIds.has(from.id) &&
                        visibleIds.has(to.id) &&
                        (!aiFocus.length ||
                          (aiFocus.includes(from.id) &&
                            aiFocus.includes(to.id)))
                          ? 1
                          : 0.1
                      }
                    >
                      <path
                        className={`edge ${view === "exploration" && !live ? "attack-edge" : ""} ${selected === to.id || (live && selected === from.id) ? "selected-edge" : ""}`}
                        d={`M${from.x + 25},${from.y} C${(from.x + to.x) / 2},${from.y} ${(from.x + to.x) / 2},${to.y} ${to.x - 27},${to.y}`}
                        markerEnd={
                          view === "exploration" && !live
                            ? "url(#arrow-end)"
                            : undefined
                        }
                      />
                      {(view === "exploration" ||
                        (live &&
                          (from.id === active?.id ||
                            to.id === active?.id))) && (
                        <text
                          className="edge-label"
                          x={(from.x + to.x) / 2}
                          y={(from.y + to.y) / 2 - 15}
                        >
                          {live
                            ? relation
                            : query === "storage"
                              ? "contains"
                              : to.id === "web"
                                ? "exposes"
                                : to.id === "api"
                                  ? "can access"
                                  : "connects to"}
                        </text>
                      )}
                    </g>
                  ))}
                  {graphAssets.map((a) => (
                    <g
                      key={a.id}
                      className={`asset-node ${a.risk} ${active?.id === a.id ? "selected" : ""} ${aiFocus.includes(a.id) ? "ai-focused" : ""}`}
                      transform={`translate(${a.x} ${a.y})`}
                      opacity={
                        visibleIds.has(a.id) &&
                        (!aiFocus.length || aiFocus.includes(a.id))
                          ? 1
                          : 0.12
                      }
                      role="button"
                      aria-label={`${a.name}, ${riskLabel[a.risk]}`}
                      aria-pressed={active?.id === a.id}
                      tabIndex={visibleIds.has(a.id) ? 0 : -1}
                      onClick={() => {
                        if (visibleIds.has(a.id)) {
                          setSelected(a.id);
                          setDetailTab("overview");
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          (e.key === "Enter" || e.key === " ") &&
                          visibleIds.has(a.id)
                        ) {
                          e.preventDefault();
                          setSelected(a.id);
                          setDetailTab("overview");
                        }
                      }}
                    >
                      {active?.id === a.id && (
                        <circle className="selection-ring" r="36" />
                      )}
                      <rect
                        className="node-bg"
                        x="-25"
                        y="-25"
                        width="50"
                        height="50"
                        rx="13"
                      />
                      <g transform="translate(-11 -11)">
                        <Icon name={a.icon} size={22} />
                      </g>
                      {a.findings > 0 && (
                        <>
                          <circle
                            className="node-badge"
                            cx="23"
                            cy="-23"
                            r="9"
                          />
                          <text className="node-badge-text" x="23" y="-20">
                            {a.findings}
                          </text>
                        </>
                      )}
                      <text className="node-name" textAnchor="middle" y="47">
                        {a.name}
                      </text>
                      <text className="node-kind" textAnchor="middle" y="63">
                        {a.kind}
                      </text>
                      {a.risk === "unscanned" && (
                        <text
                          className="unscanned-label"
                          textAnchor="middle"
                          y="80"
                        >
                          未診断
                        </text>
                      )}
                    </g>
                  ))}
                </g>
              </svg>
              {shown.length === 0 && (
                <div className="empty-state">
                  条件に一致する管理対象はありません。
                  <button
                    onClick={() => {
                      clearFilters();
                    }}
                  >
                    フィルターをクリア
                  </button>
                </div>
              )}
              <div className="graph-bottom">
                <div className="legend">
                  <span>
                    <i className="mint" />
                    診断済み
                  </span>
                  <span>
                    <i className="red" />
                    Critical
                  </span>
                  <span>
                    <i className="orange" />
                    High
                  </span>
                  <span>
                    <i className="gray" />
                    未診断
                  </span>
                </div>
                <div className="zoom-controls">
                  <button
                    disabled={zoom <= 0.5}
                    aria-label="縮小"
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
                  >
                    <Icon name="minus" size={15} />
                  </button>
                  <span>{Math.round(zoom * 100)}%</span>
                  <button
                    disabled={zoom >= 1.8}
                    aria-label="拡大"
                    onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
                  >
                    <Icon name="plus" size={15} />
                  </button>
                  <button
                    aria-label="グラフを全体表示"
                    onClick={() => {
                      setZoom(1);
                      setPan({ x: 0, y: 0 });
                    }}
                  >
                    <Icon name="fit" size={15} />
                  </button>
                </div>
              </div>
            </div>
            {active && (
              <aside
                className="asset-details"
                aria-label="選択した管理対象の詳細"
              >
                <div className="detail-heading">
                  <span>ASSET DETAILS</span>
                </div>
                <div className={`detail-asset-icon ${active.risk}`}>
                  <Icon name={active.icon} size={25} />
                </div>
                <h2>{active.name}</h2>
                <div className="detail-subtitle">
                  {active.kind}
                  <span>•</span>
                  {active.provider === "All" ? "Workspace" : active.provider}
                </div>
                <span className={`status-badge ${active.risk}`}>
                  <span />
                  {riskLabel[active.risk]}
                </span>
                <div className="detail-tabs">
                  <button
                    className={detailTab === "overview" ? "active" : ""}
                    onClick={() => setDetailTab("overview")}
                  >
                    概要
                  </button>
                  <button
                    className={detailTab === "risks" ? "active" : ""}
                    onClick={() => setDetailTab("risks")}
                  >
                    リスク <span>{active.findings}</span>
                  </button>
                </div>
                {detailTab === "overview" ? (
                  <>
                    <dl className="asset-properties">
                      <div>
                        <dt>環境</dt>
                        <dd>
                          {live
                            ? active.provider
                            : active.provider === "GCP"
                              ? "Development"
                              : active.id === "org"
                                ? "Organization"
                                : "Production"}
                        </dd>
                      </div>
                      <div>
                        <dt>リージョン</dt>
                        <dd>
                          {live
                            ? active.region || "—"
                            : active.id === "org"
                              ? "—"
                              : active.provider === "GCP"
                                ? "asia-northeast1"
                                : "ap-northeast-1"}
                        </dd>
                      </div>
                      <div>
                        <dt>診断ステータス</dt>
                        <dd
                          className={
                            active.risk === "unscanned" ? "muted" : "green-text"
                          }
                        >
                          {active.kind === "Organization" ||
                          active.kind === "Cloud account" ||
                          active.kind === "Cloud project"
                            ? "集約ノード（診断対象外）"
                            : active.risk === "unscanned"
                              ? "未診断"
                              : "✓ 診断済み"}
                        </dd>
                      </div>
                      <div>
                        <dt>データソース</dt>
                        <dd>{live ? "Cloud API / HTTPS" : "Demo dataset"}</dd>
                      </div>
                      {live && (
                        <div>
                          <dt>最終チェック</dt>
                          <dd>
                            {active.checkedAt
                              ? new Date(active.checkedAt).toLocaleString(
                                  "ja-JP",
                                )
                              : "未実施"}
                          </dd>
                        </div>
                      )}
                    </dl>
                    <div className="detail-section-label">SECURITY CONTEXT</div>
                    <div
                      className={`context-box ${active.risk === "covered" ? "safe" : ""}`}
                    >
                      <Icon name="shield" size={17} />
                      <div>
                        <strong>
                          {active.risk === "critical"
                            ? "優先的な確認が必要です"
                            : active.risk === "high"
                              ? "アクセス範囲を確認してください"
                              : active.risk === "unscanned"
                                ? "未チェックの管理対象です"
                                : active.findings
                                  ? "検出結果を確認してください"
                                  : active.kind === "Organization" ||
                                      active.kind === "Cloud account" ||
                                      active.kind === "Cloud project"
                                    ? "配下の管理対象を確認してください"
                                    : "チェック済みの管理対象です"}
                        </strong>
                        <p>
                          {active.risk === "critical"
                            ? "外部公開と関連するリスクを、グラフで確認できます。"
                            : active.risk === "unscanned"
                              ? "この管理対象はまだ診断されていません。"
                              : "関連する管理対象とのつながりを探索し、影響範囲を確認できます。"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="asset-risks">
                    {live ? (
                      <>
                        {snapshot?.findings
                          .filter(
                            (f) =>
                              (findingAsset[f.id] ?? f.assetId) === active.id,
                          )
                          .map((f) => (
                            <article className="live-finding" key={f.id}>
                              <span className={`severity ${f.severity}`}>
                                {riskLabel[f.severity]}
                              </span>
                              <h3>{f.title}</h3>
                              <p>{f.evidence}</p>
                              <strong>推奨対応</strong>
                              <p>{f.remediation}</p>
                              <small>
                                {f.source === "ai"
                                  ? `AI 判定${f.model ? `（${f.model}）` : ""}`
                                  : "ルール判定"}{" "}
                                ·{" "}
                                {new Date(f.detectedAt).toLocaleString("ja-JP")}
                              </small>
                            </article>
                          ))}
                        {!active.findings && (
                          <p>
                            検出結果はありません。チェック範囲外のリスクは評価していません。
                          </p>
                        )}
                      </>
                    ) : (
                      <p>
                        サンプルの管理対象の検出数：{active.findings}
                        。攻撃経路のデモで関連する経路を確認できます。
                      </p>
                    )}
                  </div>
                )}
                {(!live ||
                  !!active.component ||
                  active.kind === "HTTPS endpoint") && (
                  <button
                    className="explore-button"
                    onClick={() => {
                      explore();
                    }}
                  >
                    {live
                      ? "エクスプロイトグラフで確認"
                      : "攻撃経路のデモを見る"}
                    <Icon name="arrow" size={16} />
                  </button>
                )}
                <p className="detail-note">ノードを選択して、つながりを発見</p>
              </aside>
            )}
          </div>
          <div className="graph-footer">
            <span>
              <span className="live-dot" />
              {shown.filter((a) => a.kind !== "Organization").length}{" "}
              管理対象を表示 <span className="footer-separator">/</span>{" "}
              {view === "coverage" ? "階層レイアウト" : "経路レイアウト"}
            </span>
            <span>ドラッグで移動 · ノードをクリックして詳細を表示</span>
          </div>
        </>
      )}
    </section>
  );
}

export function AIInvestigationPage() {
  const {
    investigation,
    live,
    setAIFocus,
    assets,
    setView,
    setSelected,
    setProvider,
    setRisk,
    setSearch,
    setZoom,
    setPan,
    setNotice,
    setDetailTab,
    selectedAsset,
    openAssets,
    openSettings,
  } = useWorkspace();
  return (
    <InvestigationWorkspace
      investigation={investigation}
      live={live}
      selectedAsset={
        live && selectedAsset.id !== "workspace"
          ? { id: selectedAsset.id, name: selectedAsset.name }
          : undefined
      }
      onConnect={() => openSettings("cloud")}
      onFocus={(ids) => {
        const valid = ids.filter((id) => assets.some((a) => a.id === id));
        if (!valid.length) {
          setNotice(
            "この調査で参照した管理対象は現在のグラフにありません。調査時点の根拠を確認してください。",
          );
          return;
        }
        setAIFocus(valid);
        setView("coverage");
        setSelected(valid[0]);
        setRisk("all");
        setSearch("");
        setProvider("All");
        setDetailTab("risks");
        setZoom(1);
        setPan({ x: 0, y: 0 });
        openAssets(valid[0], "coverage", "risks");
      }}
    />
  );
}

function FindingsList({ limit }: { limit?: number }) {
  const {
    live,
    assets,
    findings,
    selected,
    details,
    setDetails,
    riskListSearch,
    setRiskListSearch,
    riskSeverity,
    setRiskSeverity,
    setDetailTab,
    explore,
    findingAsset,
  } = useWorkspace();
  const riskSearch = limit ? "" : riskListSearch;
  const severity = limit ? "all" : riskSeverity;
  const filteredFindings = findings
    .filter(
      (f) =>
        (severity === "all" || f.severity === severity) &&
        `${f.title} ${assets.find((a) => a.id === f.asset)?.name ?? ""}`
          .toLowerCase()
          .includes(riskSearch.trim().toLowerCase()),
    )
    .sort((a, b) => {
      const rank = { critical: 0, high: 1, medium: 2, low: 3 };
      return rank[a.severity] - rank[b.severity];
    })
    .slice(0, limit);
  return (
    <section id="workspace-findings" className="findings-section">
      <div className="section-heading">
        <div>
          <h2>
            優先して確認するリスク<span>{filteredFindings.length}</span>
          </h2>
          <p>単体の脆弱性から、管理対象のつながりに潜むリスクへ。</p>
        </div>
        {limit ? (
          <Link className="text-button" href="/risks">
            すべてのリスクを確認 →
          </Link>
        ) : (
          <button
            className="text-button"
            onClick={() => {
              setDetails((v) => !v);
            }}
          >
            {details ? "説明を閉じる" : "検出結果について"}
            <Icon name="arrow" size={15} />
          </button>
        )}
      </div>
      {details && (
        <div className="risk-explanation">
          {live
            ? "クラウド構成および HTTPS 応答で確認した検出結果です。CVE や実際の侵入可能性は評価していません。行を選択し、管理対象詳細のリスクタブで証跡と推奨対応を確認できます。"
            : "デモには Critical 2 件、High 1 件のリスクシナリオを収録しています。ノードの件数は管理対象ごとのサンプル検出数です。"}
        </div>
      )}
      {!limit && (
        <div className="risk-filters">
          <label className="search-field">
            <Icon name="search" size={16} />
            <input
              aria-label="リスクを検索"
              placeholder="リスク名・管理対象で検索"
              value={riskSearch}
              onChange={(e) => setRiskListSearch(e.target.value)}
            />
          </label>
          <select
            aria-label="重要度"
            value={severity}
            onChange={(e) => setRiskSeverity(e.target.value)}
          >
            <option value="all">すべての重要度</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      )}
      <div className="findings-table">
        <div className="table-header">
          <span>重要度</span>
          <span>検出されたリスク</span>
          <span>管理対象</span>
          <span>{live ? "重要度" : "リスクスコア"}</span>
          <span />
        </div>
        {filteredFindings.map((f) => (
          <button
            key={f.id}
            className={`finding-row ${selected === f.asset ? "finding-selected" : ""}`}
            onClick={() => {
              explore(findingAsset[f.id] ?? f.asset);
              setDetailTab("risks");
            }}
          >
            <span>
              <span className={`severity ${f.severity}`}>
                <i />
                {riskLabel[f.severity]}
              </span>
            </span>
            <span className="finding-title">
              {f.title}
              <small>{f.detail}</small>
            </span>
            <span className="finding-asset">
              <Icon
                name={assets.find((a) => a.id === f.asset)!.icon}
                size={15}
              />
              {assets.find((a) => a.id === f.asset)!.name}
            </span>
            <span className={`risk-score ${f.severity}`}>
              {live ? riskLabel[f.severity] : f.score}
              {!live && <small>/ 10</small>}
            </span>
            <Icon name="chevron" size={15} />
          </button>
        ))}
        {filteredFindings.length === 0 && (
          <div className="table-empty">
            現在のフィルターに一致する優先リスクはありません。
          </div>
        )}
      </div>
    </section>
  );
}
export function RisksPage() {
  return <FindingsList />;
}

export function SettingsPage() {
  const {
    investigation,
    snapshot,
    receiveSnapshot,
    setSnapshot,
    setLive,
    setSelected,
  } = useWorkspace();
  const params = useSearchParams();
  const tab = params.get("tab") === "targets" ? "targets" : "cloud";
  return (
    <ConnectionConsole
      key={tab}
      embedded
      snapshot={snapshot}
      onSnapshot={receiveSnapshot}
      initialTab={tab}
      onClose={() => {}}
      onLogout={() => {
        investigation.reset();
        setSnapshot(null);
        setLive(false);
        setSelected("web");
      }}
    />
  );
}

// The exploit graph for one diagnosis target, chosen from the targets that
// the workspace has registered. It follows the latest job so a running
// diagnosis keeps adding components as the snapshot refreshes.
function ExploitPanel({
  selected,
  onSelect,
  onShowInSystem,
  onOpenSettings,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onShowInSystem: (assetId: string) => void;
  onOpenSettings: () => void;
}) {
  // Topology ids are "<target>" or "<target>/<component>"; both views share them.
  const [selectedTarget, focus] = selected.split("/");
  const { snapshot } = useWorkspace();
  const params = useSearchParams();
  const now = useNow();
  const targets = snapshot?.targets ?? [];
  const jobs = snapshot?.jobs ?? [];
  const latest = (id: string) => jobs.filter((j) => j.targetId === id).at(-1);
  const target =
    targets.find((t) => t.id === selectedTarget) ??
    targets.find((t) => t.id === jobs.at(-1)?.targetId) ??
    targets[0];
  const pinned = jobs.find(
    (j) => j.id === params.get("job") && j.targetId === target?.id,
  );
  const job = pinned ?? (target && latest(target.id));
  if (!targets.length) {
    return (
      <div className="xg-panel-empty">
        <strong>診断対象がまだありません</strong>
        <p>
          ドメインを登録して DNS
          で所有を確認すると、診断した経路がここに表示されます。
        </p>
        <button className="secondary-button" onClick={onOpenSettings}>
          診断対象を追加
        </button>
      </div>
    );
  }
  return (
    <div className="xg-panel">
      <div className="xg-targets" role="tablist" aria-label="診断対象">
        {targets.map((t) => {
          const last = latest(t.id);
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === target?.id}
              className={t.id === target?.id ? "active" : ""}
              onClick={() => onSelect(t.id)}
            >
              <span className={`xg-target-dot ${last?.status ?? "none"}`} />
              {t.hostname}
            </button>
          );
        })}
        <button className="xg-targets-run" onClick={onOpenSettings}>
          診断を実行
        </button>
      </div>
      {job ? (
        <>
          <p className="xg-panel-meta" aria-live="polite">
            {job.status === "running"
              ? `診断中・経過 ${Math.max(0, Math.round((now - Date.parse(job.createdAt)) / 1000))} 秒`
              : job.status === "completed"
                ? "診断完了"
                : "診断は完了しませんでした"}
            ：{new Date(job.createdAt).toLocaleString("ja-JP")}
            {job.engine === "ai"
              ? "・AI 判定"
              : job.engine === "rule"
                ? "・ルール判定"
                : ""}
            {job !== latest(job.targetId) && "・過去の診断を表示中"}
          </p>
          {job.notice && <p className="xg-panel-meta">{job.notice}</p>}
          {job.error && <p className="xg-panel-meta error">{job.error}</p>}
          <ExploitWorkbench
            key={`${job.id}:${focus ?? ""}`}
            focus={selectedTarget === job.targetId ? focus : undefined}
            onShowInSystem={(node) =>
              onShowInSystem(
                node === "domain" ? job.targetId : `${job.targetId}/${node}`,
              )
            }
            job={job}
            latestCompleted={jobs
              .filter(
                (j) => j.targetId === job.targetId && j.status === "completed",
              )
              .at(-1)}
            findings={(snapshot?.findings ?? []).filter(
              (f) => f.assetId === job.targetId,
            )}
            exploits={(snapshot?.exploits ?? []).filter(
              (e) => e.targetId === job.targetId,
            )}
          />
        </>
      ) : (
        <div className="xg-panel-empty">
          <strong>{target?.hostname} はまだ診断していません</strong>
          <p>
            診断を実行すると、到達した経路と見つかったリスクがここに増えていきます。
          </p>
          <button className="secondary-button" onClick={onOpenSettings}>
            診断を実行
          </button>
        </div>
      )}
    </div>
  );
}

type ExploitRow = {
  id: string;
  title: string;
  severity: LiveFinding["severity"];
  rule: string;
  state: "detecting" | "new" | "open" | "resolved";
  firstSeen?: string;
  lastSeen?: string;
  resolvedAt?: string;
  detections?: number;
  source?: string;
};
const ROW_STATE: Record<ExploitRow["state"], string> = {
  detecting: "新規・診断中",
  new: "新規",
  open: "継続",
  resolved: "解消済み",
};
const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 } as const;

// The exploit graph plus the history of attack paths found for this target.
// New paths are added as diagnoses discover them; paths that stop being
// detected stay in the list as resolved.
function ExploitWorkbench({
  job,
  latestCompleted,
  findings,
  exploits,
  focus,
  onShowInSystem,
}: {
  job: ScanJob;
  latestCompleted?: ScanJob;
  findings: LiveFinding[];
  exploits: Exploit[];
  focus?: string;
  onShowInSystem: (node: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(focus ?? null);
  const [preview, setPreview] = useState<string | null>(null);
  const [filter, setFilter] = useState<"open" | "resolved" | "all">("open");
  const pathOf = exploitPaths(job, findings);
  const rows: ExploitRow[] = exploits.map((e) => ({
    ...e,
    state:
      e.status === "resolved"
        ? "resolved"
        : e.firstJobId === latestCompleted?.id
          ? "new"
          : "open",
  }));
  const known = new Set(rows.map((r) => r.id));
  // Findings the running diagnosis just reported, before they are saved.
  if (job.status === "running")
    for (const e of job.events ?? []) {
      const id = e.data?.finding;
      if (!id || known.has(id)) continue;
      known.add(id);
      rows.push({
        id,
        title: e.label.replace(/^検出: /, ""),
        severity: (e.data?.severity as ExploitRow["severity"]) ?? "medium",
        rule: e.data?.rule ?? "",
        source: e.data?.source,
        state: "detecting",
        firstSeen: e.at,
      });
    }
  // Findings saved before history tracking began.
  for (const f of findings)
    if (!known.has(f.id))
      rows.push({ ...f, state: "open", firstSeen: f.detectedAt });
  rows.sort(
    (a, b) =>
      Number(a.state === "resolved") - Number(b.state === "resolved") ||
      SEV_ORDER[a.severity] - SEV_ORDER[b.severity] ||
      (b.firstSeen ?? "").localeCompare(a.firstSeen ?? ""),
  );
  const counts = {
    open: rows.filter((r) => r.state !== "resolved").length,
    resolved: rows.filter((r) => r.state === "resolved").length,
    all: rows.length,
  };
  const shown = rows.filter((r) =>
    filter === "all"
      ? true
      : filter === "open"
        ? r.state !== "resolved"
        : r.state === "resolved",
  );
  const fmt = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleString("ja-JP", {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";
  return (
    <>
      <ExploitGraph
        job={job}
        findings={findings}
        focus={focus}
        selected={selected}
        onSelect={(id) => {
          setPreview(null);
          setSelected(id);
        }}
        preview={preview}
        onPreview={setPreview}
        onShowInSystem={onShowInSystem}
        sidebar={
          <div className="xl">
            <header className="xl-head">
              <div>
                <h3>エクスプロイト一覧</h3>
                <p>
                  見つかった想定経路の履歴です。新しい検出は追加され、検出されなくなると解消済みになります。悪用は未検証です。
                </p>
              </div>
              <div
                className="xl-filter"
                role="tablist"
                aria-label="表示する状態"
              >
                {(
                  [
                    ["open", "未解消"],
                    ["resolved", "解消済み"],
                    ["all", "すべて"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={filter === key}
                    className={filter === key ? "active" : ""}
                    onClick={() => setFilter(key)}
                  >
                    {label} <span>{counts[key]}</span>
                  </button>
                ))}
              </div>
            </header>
            {shown.length === 0 ? (
              <p className="xl-empty">
                {filter === "resolved"
                  ? "解消済みのエクスプロイトはまだありません。"
                  : "未解消のエクスプロイトはありません。"}
              </p>
            ) : (
              <ol className="xl-list">
                {shown.map((r) => {
                  const path = pathOf(r.id, r.rule);
                  const node = path.inGraph ? `f:${r.id}` : path.anchor;
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        className={`xl-row ${r.state} ${selected === node ? "selected" : ""} ${preview && preview === node ? "previewed" : ""}`}
                        aria-pressed={selected === node}
                        onClick={() => {
                          setPreview(null);
                          if (node) setSelected(node);
                        }}
                        onPointerEnter={() => node && setPreview(node)}
                        onPointerLeave={() => setPreview(null)}
                        onFocus={() => node && setPreview(node)}
                        onBlur={() => setPreview(null)}
                      >
                        <span className={`severity ${r.severity}`}>
                          <i />
                          {riskLabel[r.severity]}
                        </span>
                        <span className="xl-main">
                          <strong>{r.title}</strong>
                          <span className="xl-path">
                            {["インターネット", ...path.titles.slice(1)].map(
                              (t, i) => (
                                <span key={`${i}:${t}`}>{t}</span>
                              ),
                            )}
                          </span>
                        </span>
                        <span className="xl-meta">
                          <span className={`xl-state ${r.state}`}>
                            {ROW_STATE[r.state]}
                          </span>
                          <small>
                            {r.state === "resolved"
                              ? `解消 ${fmt(r.resolvedAt)}`
                              : `初回 ${fmt(r.firstSeen)}`}
                            {r.detections ? `・検出 ${r.detections} 回` : ""}
                            {r.source === "ai"
                              ? "・AI 判定"
                              : r.source === "rule"
                                ? "・ルール判定"
                                : ""}
                          </small>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        }
      />
    </>
  );
}

// Ticks once a second so a running diagnosis shows its elapsed time.
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}
