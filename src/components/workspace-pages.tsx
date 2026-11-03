"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import InvestigationWorkspace from "@/components/investigation-workspace";
import ConnectionConsole from "@/components/connection-console";
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
            {assets.filter((a) => a.kind !== "Organization").length}
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
            explore("domain");
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
          <span>チェック状況と構成図を見る →</span>
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
  } = useWorkspace();
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
            管理対象のチェック状況
          </button>
          <button
            role="tab"
            aria-selected={view === "exploration"}
            className={view === "exploration" ? "active" : ""}
            onClick={() => explore()}
          >
            <Icon name="graph" size={16} />
            {live ? "システム構成図" : "攻撃経路（デモ）"}
          </button>
        </div>
        <span className="graph-live">
          <span className="live-dot" />
          {live ? "Live data" : "Sample data"}
        </span>
      </div>
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
                ? "管理対象のつながりと診断状況"
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
                <path d="M1 1l6 3-6 3" fill="none" className="attack-arrow" />
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
                      (aiFocus.includes(from.id) && aiFocus.includes(to.id)))
                      ? 1
                      : 0.1
                  }
                >
                  <path
                    className={`edge ${view === "exploration" && !live ? "attack-edge" : ""} ${selected === to.id ? "selected-edge" : ""}`}
                    d={`M${from.x + 25},${from.y} C${(from.x + to.x) / 2},${from.y} ${(from.x + to.x) / 2},${to.y} ${to.x - 27},${to.y}`}
                    markerEnd={
                      view === "exploration" && !live
                        ? "url(#arrow-end)"
                        : undefined
                    }
                  />
                  {view === "exploration" && (
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
                      <circle className="node-badge" cx="23" cy="-23" r="9" />
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
          <aside className="asset-details" aria-label="選択した管理対象の詳細">
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
                          ? new Date(active.checkedAt).toLocaleString("ja-JP")
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
                      .filter((f) => f.assetId === active.id)
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
                    サンプルの管理対象の検出数：{active.findings}。攻撃経路のデモで関連する経路を確認できます。
                  </p>
                )}
              </div>
            )}
            <button
              className="explore-button"
              onClick={() => {
                explore();
              }}
            >
              {live ? "システム構成図で確認" : "攻撃経路のデモを見る"}
              <Icon name="arrow" size={16} />
            </button>
            <p className="detail-note">ノードを選択して、つながりを発見</p>
          </aside>
        )}
      </div>
      <div className="graph-footer">
        <span>
          <span className="live-dot" />
          {
            shown.filter((a) => a.kind !== "Organization").length
          } 管理対象を表示 <span className="footer-separator">/</span>{" "}
          {view === "coverage" ? "階層レイアウト" : "経路レイアウト"}
        </span>
        <span>ドラッグで移動 · ノードをクリックして詳細を表示</span>
      </div>
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
              explore(f.asset);
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
