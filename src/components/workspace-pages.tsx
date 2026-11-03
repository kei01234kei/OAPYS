"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import InvestigationWorkspace from "@/components/investigation-workspace";
import ConnectionConsole from "@/components/connection-console";
import ExploitGraph, { exploitPaths } from "@/components/exploit-graph";
import type { Exploit, LiveFinding, ScanJob } from "@/lib/security-types";
import { Icon, riskLabel, useWorkspace } from "@/components/security-workspace";
import { useLocale, useMessages } from "@/components/locale-provider";
import { workspacePagesMessages } from "@/i18n/workspace-pages";
import { intlLocale } from "@/lib/i18n";

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
  const t = useMessages(workspacePagesMessages).overview;
  return (
    <>
      <section
        id="workspace-summary"
        className="metrics"
        aria-label={t.summaryLabel}
      >
        <button
          className="metric"
          onClick={() => {
            showCoverage();
          }}
        >
          <span className="metric-label">
            {t.detectedAssets}
            <Icon name="layers" size={16} />
          </span>
          <span className="metric-value">
            {
              assets.filter((a) => a.kind !== "Organization" && !a.component)
                .length
            }
            <small className="metric-neutral">
              {live ? (snapshot?.connections.length ?? 0) : 2}{" "}
              {t.cloudEnvironments}
            </small>
          </span>
          <span className="metric-foot">
            <span className="tiny-dot mint" />
            {t.allConnected}
          </span>
        </button>
        <button
          className="metric"
          onClick={() => {
            showCoverage("scanned");
          }}
        >
          <span className="metric-label">
            {t.checkStatus}
            <Icon name="shield" size={16} />
          </span>
          <span className="metric-value">
            {coverage}
            <span className="percent">%</span>
            <small className="metric-positive">
              {scanned} / {resources.length} {t.resources}
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
            {t.criticalRisks}
            <Icon name="shield" size={16} />
          </span>
          <span className="metric-value">
            {findings.filter((f) => f.severity === "critical").length}
            <small className="critical-text">{t.criticalFindings}</small>
          </span>
          <span className="metric-foot">
            <span className="tiny-dot red" />
            {t.needsAttention}
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
            {live ? t.configRelations : t.attackPathsDemo}
            <Icon name="graph" size={16} />
          </span>
          <span className="metric-value">
            {live
              ? realEdges.filter((e) => e.relation !== "contains").length
              : 2}
            <small className="metric-neutral">
              {live ? t.apiRelations : t.potentialPaths}
            </small>
          </span>
          <span className="metric-foot">
            {t.understandImpact}
            <Icon name="arrow" size={14} />
          </span>
        </button>
      </section>
      <div className="overview-links">
        <Link href="/assets">
          <Icon name="layers" />
          <strong>{t.reviewAssets}</strong>
          <span>{t.reviewAssetsSub}</span>
        </Link>
        <Link href="/investigations">
          <Icon name="search" />
          <strong>{t.askAI}</strong>
          <span>{t.askAISub}</span>
        </Link>
        <Link href="/settings">
          <Icon name="settings" />
          <strong>{t.manage}</strong>
          <span>{t.manageSub}</span>
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
  const t = useMessages(workspacePagesMessages).assets;
  const locale = useLocale();
  return (
    <section
      id="security-graph"
      className="graph-panel"
      aria-label={t.graphLabel}
    >
      <div className="graph-heading">
        <div className="graph-tabs" role="tablist" aria-label={t.graphKinds}>
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
            {t.topology}
          </button>
          <button
            role="tab"
            aria-selected={view === "exploration"}
            className={view === "exploration" ? "active" : ""}
            onClick={() => explore()}
          >
            <Icon name="graph" size={16} />
            {live ? t.exploitGraph : t.attackPathsDemo}
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
                aria-label={t.searchLabel}
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>⌕</kbd>
            </label>
            <div className="filter-group">
              <select
                aria-label={t.cloudEnv}
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="All">{t.allEnvs}</option>
                <option>AWS</option>
                <option>GCP</option>
                {live && <option>External</option>}
              </select>
              <select
                aria-label={t.riskState}
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
              >
                <option value="all">{t.allStatuses}</option>
                <option value="findings">{t.withFindings}</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="scanned">{t.scannedAll}</option>
                <option value="covered">Covered</option>
                <option value="unscanned">Unscanned</option>
              </select>
              <span className="toolbar-divider" />
              <button
                className="icon-button"
                aria-label={t.resetGraph}
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
                aria-label={t.exportJson}
                onClick={exportGraph}
              >
                <Icon name="download" size={16} />
              </button>
            </div>
          </div>
          {aiFocus.length > 0 && (
            <div className="ai-focus-banner">
              <span>{t.aiFocus(aiFocus.length)}</span>
              <button onClick={() => setAIFocus([])}>{t.clearFocus}</button>
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
                      ? t.captionLiveCoverage
                      : t.captionDemoCoverage
                    : live
                      ? t.captionLiveExploration
                      : t.captionDemoExploration}
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
                    {t.queryExposure}
                  </button>
                  <button
                    className={query === "storage" ? "chosen" : ""}
                    onClick={() => {
                      setSelected("bucket");
                    }}
                  >
                    {t.queryStorage}
                  </button>
                </div>
              )}
              <svg
                className={`network ${drag ? "dragging" : ""}`}
                viewBox={`0 0 ${live ? 1120 : 920} ${graphHeight}`}
                role="group"
                aria-label={
                  view === "coverage"
                    ? t.ariaCoverage
                    : live
                      ? t.ariaLiveExploration
                      : t.ariaDemoExploration
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
                          {t.unscanned}
                        </text>
                      )}
                    </g>
                  ))}
                </g>
              </svg>
              {shown.length === 0 && (
                <div className="empty-state">
                  {t.noMatch}
                  <button
                    onClick={() => {
                      clearFilters();
                    }}
                  >
                    {t.clearFilters}
                  </button>
                </div>
              )}
              <div className="graph-bottom">
                <div className="legend">
                  <span>
                    <i className="mint" />
                    {t.scanned}
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
                    {t.unscanned}
                  </span>
                </div>
                <div className="zoom-controls">
                  <button
                    disabled={zoom <= 0.5}
                    aria-label={t.zoomOut}
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
                  >
                    <Icon name="minus" size={15} />
                  </button>
                  <span>{Math.round(zoom * 100)}%</span>
                  <button
                    disabled={zoom >= 1.8}
                    aria-label={t.zoomIn}
                    onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
                  >
                    <Icon name="plus" size={15} />
                  </button>
                  <button
                    aria-label={t.fit}
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
              <aside className="asset-details" aria-label={t.detailsLabel}>
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
                    {t.tabOverview}
                  </button>
                  <button
                    className={detailTab === "risks" ? "active" : ""}
                    onClick={() => setDetailTab("risks")}
                  >
                    {t.tabRisks} <span>{active.findings}</span>
                  </button>
                </div>
                {detailTab === "overview" ? (
                  <>
                    <dl className="asset-properties">
                      <div>
                        <dt>{t.environment}</dt>
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
                        <dt>{t.region}</dt>
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
                        <dt>{t.scanStatus}</dt>
                        <dd
                          className={
                            active.risk === "unscanned" ? "muted" : "green-text"
                          }
                        >
                          {active.kind === "Organization" ||
                          active.kind === "Cloud account" ||
                          active.kind === "Cloud project"
                            ? t.aggregate
                            : active.risk === "unscanned"
                              ? t.unscanned
                              : t.scannedCheck}
                        </dd>
                      </div>
                      <div>
                        <dt>{t.dataSource}</dt>
                        <dd>{live ? "Cloud API / HTTPS" : "Demo dataset"}</dd>
                      </div>
                      {live && (
                        <div>
                          <dt>{t.lastCheck}</dt>
                          <dd>
                            {active.checkedAt
                              ? new Date(active.checkedAt).toLocaleString(
                                  intlLocale(locale),
                                )
                              : t.notYet}
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
                            ? t.ctxCritical
                            : active.risk === "high"
                              ? t.ctxHigh
                              : active.risk === "unscanned"
                                ? t.ctxUnscanned
                                : active.findings
                                  ? t.ctxFindings
                                  : active.kind === "Organization" ||
                                      active.kind === "Cloud account" ||
                                      active.kind === "Cloud project"
                                    ? t.ctxAggregate
                                    : t.ctxCovered}
                        </strong>
                        <p>
                          {active.risk === "critical"
                            ? t.ctxCriticalBody
                            : active.risk === "unscanned"
                              ? t.ctxUnscannedBody
                              : t.ctxDefaultBody}
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
                              <strong>{t.remediation}</strong>
                              <p>{f.remediation}</p>
                              <small>
                                {f.source === "ai"
                                  ? t.aiJudged(f.model)
                                  : t.ruleJudged}{" "}
                                ·{" "}
                                {new Date(f.detectedAt).toLocaleString(
                                  intlLocale(locale),
                                )}
                              </small>
                            </article>
                          ))}
                        {!active.findings && <p>{t.noFindings}</p>}
                      </>
                    ) : (
                      <p>{t.sampleFindings(active.findings)}</p>
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
                    {live ? t.viewInExploit : t.viewDemo}
                    <Icon name="arrow" size={16} />
                  </button>
                )}
                <p className="detail-note">{t.detailNote}</p>
              </aside>
            )}
          </div>
          <div className="graph-footer">
            <span>
              <span className="live-dot" />
              {t.showing(
                shown.filter((a) => a.kind !== "Organization").length,
              )}{" "}
              <span className="footer-separator">/</span>{" "}
              {view === "coverage" ? t.layoutHierarchy : t.layoutPath}
            </span>
            <span>{t.footerHint}</span>
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
  const t = useMessages(workspacePagesMessages).investigation;
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
          setNotice(t.notInGraph);
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
  const t = useMessages(workspacePagesMessages).findings;
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
            {t.heading}
            <span>{filteredFindings.length}</span>
          </h2>
          <p>{t.subheading}</p>
        </div>
        {limit ? (
          <Link className="text-button" href="/risks">
            {t.viewAll}
          </Link>
        ) : (
          <button
            className="text-button"
            onClick={() => {
              setDetails((v) => !v);
            }}
          >
            {details ? t.closeExplanation : t.aboutFindings}
            <Icon name="arrow" size={15} />
          </button>
        )}
      </div>
      {details && (
        <div className="risk-explanation">
          {live ? t.liveExplanation : t.demoExplanation}
        </div>
      )}
      {!limit && (
        <div className="risk-filters">
          <label className="search-field">
            <Icon name="search" size={16} />
            <input
              aria-label={t.searchLabel}
              placeholder={t.searchPlaceholder}
              value={riskSearch}
              onChange={(e) => setRiskListSearch(e.target.value)}
            />
          </label>
          <select
            aria-label={t.severity}
            value={severity}
            onChange={(e) => setRiskSeverity(e.target.value)}
          >
            <option value="all">{t.allSeverities}</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      )}
      <div className="findings-table">
        <div className="table-header">
          <span>{t.severity}</span>
          <span>{t.detectedRisk}</span>
          <span>{t.asset}</span>
          <span>{live ? t.severity : t.riskScore}</span>
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
          <div className="table-empty">{t.empty}</div>
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
  const t = useMessages(workspacePagesMessages).exploit;
  const locale = useLocale();
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
        <strong>{t.noTargets}</strong>
        <p>{t.noTargetsBody}</p>
        <button className="secondary-button" onClick={onOpenSettings}>
          {t.addTarget}
        </button>
      </div>
    );
  }
  return (
    <div className="xg-panel">
      <div className="xg-targets" role="tablist" aria-label={t.targetsLabel}>
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
          {t.runScan}
        </button>
      </div>
      {job ? (
        <>
          <p className="xg-panel-meta" aria-live="polite">
            {job.status === "running"
              ? t.running(
                  Math.max(
                    0,
                    Math.round((now - Date.parse(job.createdAt)) / 1000),
                  ),
                )
              : job.status === "completed"
                ? t.completed
                : t.incomplete}
            {locale === "ja" ? "：" : ": "}
            {new Date(job.createdAt).toLocaleString(intlLocale(locale))}
            {job.engine === "ai"
              ? t.aiJudged
              : job.engine === "rule"
                ? t.ruleJudged
                : ""}
            {job !== latest(job.targetId) && t.pastScan}
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
          <strong>{t.notScanned(target?.hostname)}</strong>
          <p>{t.notScannedBody}</p>
          <button className="secondary-button" onClick={onOpenSettings}>
            {t.runScan}
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
  const t = useMessages(workspacePagesMessages).exploit;
  const locale = useLocale();
  const pathOf = exploitPaths(job, findings, locale);
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
      ? new Date(iso).toLocaleString(intlLocale(locale), {
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
                <h3>{t.listTitle}</h3>
                <p>{t.listBody}</p>
              </div>
              <div
                className="xl-filter"
                role="tablist"
                aria-label={t.filterLabel}
              >
                {(
                  [
                    ["open", t.filterOpen],
                    ["resolved", t.filterResolved],
                    ["all", t.filterAll],
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
                {filter === "resolved" ? t.noResolved : t.noOpen}
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
                            {[t.internet, ...path.titles.slice(1)].map(
                              (t, i) => (
                                <span key={`${i}:${t}`}>{t}</span>
                              ),
                            )}
                          </span>
                        </span>
                        <span className="xl-meta">
                          <span className={`xl-state ${r.state}`}>
                            {t.rowState[r.state]}
                          </span>
                          <small>
                            {r.state === "resolved"
                              ? t.resolvedAt(fmt(r.resolvedAt))
                              : t.firstSeen(fmt(r.firstSeen))}
                            {r.detections ? t.detections(r.detections) : ""}
                            {r.source === "ai"
                              ? t.aiJudged
                              : r.source === "rule"
                                ? t.ruleJudged
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
