"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ConnectionConsole from "@/components/connection-console";
import { securityRequest, type SecuritySnapshot } from "@/lib/security-types";

type IconName =
  | "grid"
  | "graph"
  | "shield"
  | "layers"
  | "settings"
  | "chevron"
  | "search"
  | "bell"
  | "arrow"
  | "plus"
  | "minus"
  | "fit"
  | "download"
  | "refresh"
  | "cloud"
  | "server"
  | "database"
  | "globe"
  | "box"
  | "check"
  | "close"
  | "external";
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    graph: (
      <>
        <circle cx="5" cy="12" r="3" />
        <circle cx="18" cy="5" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8 10 7-4M8 14l7 4" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5" />
      </>
    ),
    settings: (
      <>
        <path d="m9 3-1 3-3 1-2 4 2 2v4l4 2 3-1 3 1 4-2v-4l2-2-2-4-3-1-1-3z" />
        <circle cx="12" cy="11" r="3" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    bell: (
      <>
        <path d="M5 17h14l-2-4V9a5 5 0 0 0-10 0v4zM10 21h4" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    fit: <path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6" />,
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
    refresh: (
      <>
        <path d="M20 4v6h-6M4 20v-6h6" />
        <path d="M5 8a8 8 0 0 1 13-3l2 5M4 14l2 5a8 8 0 0 0 13-3" />
      </>
    ),
    cloud: <path d="M6 18a5 5 0 1 1 1-10 6 6 0 0 1 11 2 4 4 0 1 1 0 8z" />,
    server: (
      <>
        <rect x="4" y="3" width="16" height="7" rx="2" />
        <rect x="4" y="14" width="16" height="7" rx="2" />
        <path d="M7 6.5h1M7 17.5h1M12 6.5h5M12 17.5h5" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    box: (
      <>
        <path d="m12 3 9 5v9l-9 5-9-5V8zm0 10v9M3 8l9 5 9-5M7 5l10 5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    external: <path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

type Asset = {
  id: string;
  name: string;
  kind: string;
  icon: IconName;
  x: number;
  y: number;
  parent?: string;
  risk: "critical" | "high" | "medium" | "low" | "covered" | "unscanned";
  region?: string;
  checkedAt?: string;
  provider: string;
  findings: number;
};
const demoAssets: Asset[] = [
  {
    id: "org",
    name: "OAPYS workspace",
    kind: "Organization",
    icon: "layers",
    x: 100,
    y: 235,
    risk: "covered",
    provider: "All",
    findings: 0,
  },
  {
    id: "aws",
    name: "AWS Production",
    kind: "Cloud account",
    icon: "cloud",
    x: 295,
    y: 130,
    parent: "org",
    risk: "covered",
    provider: "AWS",
    findings: 0,
  },
  {
    id: "gcp",
    name: "GCP Development",
    kind: "Cloud project",
    icon: "cloud",
    x: 295,
    y: 365,
    parent: "org",
    risk: "covered",
    provider: "GCP",
    findings: 0,
  },
  {
    id: "web",
    name: "web-prod-01",
    kind: "EC2 instance",
    icon: "server",
    x: 520,
    y: 65,
    parent: "aws",
    risk: "critical",
    provider: "AWS",
    findings: 3,
  },
  {
    id: "api",
    name: "api-prod-01",
    kind: "EC2 instance",
    icon: "server",
    x: 520,
    y: 185,
    parent: "aws",
    risk: "high",
    provider: "AWS",
    findings: 2,
  },
  {
    id: "bucket",
    name: "public-assets",
    kind: "S3 bucket",
    icon: "database",
    x: 520,
    y: 300,
    parent: "aws",
    risk: "critical",
    provider: "AWS",
    findings: 1,
  },
  {
    id: "cluster",
    name: "dev-cluster",
    kind: "GKE cluster",
    icon: "box",
    x: 520,
    y: 425,
    parent: "gcp",
    risk: "covered",
    provider: "GCP",
    findings: 0,
  },
  {
    id: "domain",
    name: "app.oapys.example",
    kind: "Public endpoint",
    icon: "globe",
    x: 755,
    y: 65,
    parent: "web",
    risk: "critical",
    provider: "AWS",
    findings: 1,
  },
  {
    id: "db",
    name: "production-db",
    kind: "RDS PostgreSQL",
    icon: "database",
    x: 755,
    y: 185,
    parent: "api",
    risk: "high",
    provider: "AWS",
    findings: 1,
  },
  {
    id: "backup",
    name: "backup-storage",
    kind: "S3 bucket",
    icon: "database",
    x: 755,
    y: 300,
    parent: "bucket",
    risk: "unscanned",
    provider: "AWS",
    findings: 0,
  },
  {
    id: "worker",
    name: "worker-service",
    kind: "Container",
    icon: "box",
    x: 755,
    y: 425,
    parent: "cluster",
    risk: "covered",
    provider: "GCP",
    findings: 0,
  },
];
const riskLabel = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  covered: "Covered",
  unscanned: "Unscanned",
};
const demoFindings = [
  {
    id: "F-001",
    title: "インターネットに公開された脆弱なワークロード",
    detail: "Public exposure + vulnerable package",
    asset: "web",
    severity: "critical",
    score: "9.8",
    category: "攻撃経路",
  },
  {
    id: "F-002",
    title: "パブリックストレージへの匿名アクセス",
    detail: "Public bucket + sensitive data",
    asset: "bucket",
    severity: "critical",
    score: "9.1",
    category: "データ露出",
  },
  {
    id: "F-003",
    title: "データベースへの過剰なアクセス権限",
    detail: "Overprivileged identity + database access",
    asset: "db",
    severity: "high",
    score: "8.2",
    category: "アクセス権限",
  },
] as const;
const attackIds = ["domain", "web", "api", "db"];

export default function SecurityWorkspace({ healthy }: { healthy: boolean }) {
  const [snapshot, setSnapshot] = useState<SecuritySnapshot | null>(null);
  const [live, setLive] = useState(false);
  const [consoleTab, setConsoleTab] = useState<"cloud" | "targets" | null>(
    null,
  );
  const [liveError, setLiveError] = useState("");
  const receiveSnapshot = useCallback((data: SecuritySnapshot) => {
    setSnapshot(data);
    setLive(true);
    setLiveError("");
  }, []);
  useEffect(() => {
    if (!live) return;
    let active = true;
    const refresh = async () => {
      try {
        const data = await securityRequest<SecuritySnapshot>("snapshot");
        if (active) {
          setSnapshot(data);
          setLiveError("");
        }
      } catch (error) {
        if (active) {
          setLiveError(
            error instanceof Error ? error.message : "更新に失敗しました",
          );
          setSnapshot(null);
        }
      }
    };
    const timer = setInterval(() => {
      void refresh();
    }, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [live]);
  const assets: Asset[] = useMemo(() => {
    if (!live) return demoAssets;
    const rows = [0, 0, 0, 0];
    const result: Asset[] = [
      {
        id: "workspace",
        name: "OAPYS workspace",
        kind: "Organization",
        icon: "layers",
        x: 80,
        y: 230,
        risk: "covered",
        provider: "All",
        findings: 0,
      },
    ];
    for (const asset of snapshot?.assets ?? []) {
      const related =
        snapshot?.findings.filter((f) => f.assetId === asset.id) ?? [];
      const severity = (["critical", "high", "medium", "low"] as const).find(
        (level) => related.some((f) => f.severity === level),
      );
      const column =
        asset.kind === "Cloud account"
          ? 0
          : ["Security group", "Firewall rule", "VPC network"].includes(
                asset.kind,
              )
            ? 1
            : asset.kind === "Public IP"
              ? 3
              : 2;
      const icon: IconName =
        asset.kind === "Cloud account"
          ? "cloud"
          : asset.kind === "Public IP" || asset.kind === "HTTPS endpoint"
            ? "globe"
            : ["Security group", "Firewall rule"].includes(asset.kind)
              ? "shield"
              : asset.kind === "VPC network"
                ? "graph"
                : "server";
      const parent = snapshot?.edges.find(
        (e) => e.target === asset.id && e.relation === "contains",
      )?.source;
      result.push({
        ...asset,
        icon,
        x: 285 + column * 205,
        y: 80 + rows[column]++ * 115,
        parent,
        findings: related.length,
        risk: severity ?? (asset.checkedAt ? "covered" : "unscanned"),
      });
    }
    return result;
  }, [live, snapshot]);
  const findings = live
    ? (snapshot?.findings ?? []).map((f) => ({
        ...f,
        asset: f.assetId,
        detail: f.evidence,
        score: "—",
        category: f.rule,
      }))
    : demoFindings;
  const resources = live
    ? assets.filter(
        (a) => a.kind !== "Organization" && a.kind !== "Cloud account",
      )
    : demoAssets.filter((a) =>
        live ? !!a.checkedAt : !["org", "aws", "gcp"].includes(a.id),
      );
  const scanned = resources.filter((a) =>
    live ? !!a.checkedAt : a.risk !== "unscanned",
  ).length;
  const coverage = resources.length
    ? Math.round((scanned / resources.length) * 1000) / 10
    : 0;
  const [view, setView] = useState<"coverage" | "exploration">("coverage");
  const [selected, setSelected] = useState("web");
  const [provider, setProvider] = useState("All");
  const [risk, setRisk] = useState("all");
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [notice, setNotice] = useState("");
  const [details, setDetails] = useState(false);
  const [detailTab, setDetailTab] = useState("overview");
  const [query, setQuery] = useState("exposure");
  const active = assets.find((a) => a.id === selected) ?? assets[0];
  const focusedID = active.id;
  const visible = useMemo(
    () =>
      assets.filter(
        (a) =>
          (provider === "All" || a.provider === provider || a.id === "org") &&
          (risk === "all" ||
            (risk === "findings"
              ? a.findings > 0
              : risk === "scanned"
                ? a.risk !== "unscanned" &&
                  (live ? !!a.checkedAt : !["org", "aws", "gcp"].includes(a.id))
                : a.risk === risk)) &&
          (!search ||
            `${a.name} ${a.kind}`.toLowerCase().includes(search.toLowerCase())),
      ),
    [provider, risk, search, assets, live],
  );
  const assetByID = new Map(assets.map((a) => [a.id, a]));
  const realEdges = (snapshot?.edges ?? []).filter(
    (e) => assetByID.has(e.source) && assetByID.has(e.target),
  );
  const neighborhood = new Set([focusedID]);
  for (let depth = 0; depth < 2; depth++) {
    const previous = new Set(neighborhood);
    for (const edge of realEdges) {
      if (previous.has(edge.source) || previous.has(edge.target)) {
        neighborhood.add(edge.source);
        neighborhood.add(edge.target);
      }
    }
  }
  const graphAssets =
    view === "coverage"
      ? assets
      : live
        ? assets.filter((a) => neighborhood.has(a.id))
        : (query === "storage" ? ["org", "bucket", "backup"] : attackIds)
            .map((id) => assets.find((a) => a.id === id)!)
            .map((a, i) => ({
              ...a,
              x: 130 + i * 210,
              y: 215 + (i % 2 ? 35 : -25),
            }));
  const visibleIds = new Set(visible.map((a) => a.id));
  const shown = graphAssets.filter((a) => visibleIds.has(a.id));
  const graphIDs = new Set(graphAssets.map((a) => a.id));
  const edges: { from: Asset; to: Asset; relation?: string }[] = live
    ? realEdges
        .filter((e) => graphIDs.has(e.source) && graphIDs.has(e.target))
        .map((e) => ({
          from: assetByID.get(e.source)!,
          to: assetByID.get(e.target)!,
          relation: e.relation,
        }))
    : view === "coverage"
      ? graphAssets
          .filter((a) => a.parent)
          .map((a) => ({
            from: graphAssets.find((p) => p.id === a.parent)!,
            to: a,
          }))
      : graphAssets.slice(1).map((a, i) => ({ from: graphAssets[i], to: a }));
  const graphHeight = live
    ? graphAssets.reduce((height, a) => Math.max(height, a.y + 100), 520)
    : 520;
  const filteredFindings = findings.filter((f) => visibleIds.has(f.asset));
  function explore(id = selected) {
    setSelected(
      live
        ? assets.some((a) => a.id === id)
          ? id
          : focusedID
        : [...attackIds, "bucket", "backup"].includes(id)
          ? id
          : "web",
    );
    setView("exploration");
    setQuery(["bucket", "backup"].includes(id) ? "storage" : "exposure");
    if (live) setDetailTab("risks");
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }
  function exportGraph() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            mode: view,
            assets: shown,
            relationships: edges
              .filter(
                (e) => visibleIds.has(e.from.id) && visibleIds.has(e.to.id),
              )
              .map((e) => ({
                source: e.from.id,
                target: e.to.id,
                relation: e.relation ?? "demo_relation",
              })),
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `oapys-${view}-graph.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="OAPYS ホーム">
          <span className="brand-symbol">◈</span> OAPYS
          <span className="brand-dot">.</span>
        </Link>
        <div className="workspace-picker">
          <span className="workspace-avatar">O</span>
          <div>
            OAPYS Workspace<small>Security workspace</small>
          </div>
          <Icon name="chevron" size={14} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="メインナビゲーション">
          <button
            onClick={() => {
              setView("coverage");
              setRisk("all");
              setSearch("");
            }}
          >
            <Icon name="grid" />
            概要<span className="nav-soon">Overview</span>
          </button>
          <button
            className={view === "coverage" ? "nav-active" : ""}
            onClick={() => {
              setView("coverage");
              setPan({ x: 0, y: 0 });
            }}
          >
            <Icon name="layers" />
            Asset coverage
            <span className="nav-indicator" />
          </button>
          <button
            className={view === "exploration" ? "nav-active" : ""}
            onClick={() => explore()}
          >
            <Icon name="graph" />
            Exploration graph
          </button>
          <button
            onClick={() => {
              setRisk(live ? "findings" : "critical");
              setView("coverage");
            }}
          >
            <Icon name="shield" />
            リスクと脆弱性<span className="nav-count">{findings.length}</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="environment">
            <span className="live-dot" />
            <span>
              {live ? "Live environment" : "Demo environment"}
              <small>
                {live ? "実環境データで探索" : "サンプルデータで探索"}
              </small>
            </span>
            <span className="demo-tag">{live ? "LIVE" : "DEMO"}</span>
          </div>
          <button
            className="settings-button"
            onClick={() => setConsoleTab("cloud")}
          >
            <Icon name="settings" />
            ワークスペース設定
          </button>
          <div className="profile">
            <span className="avatar">SK</span>
            <div>
              Security team<small>Workspace admin</small>
            </div>
            <span className="profile-menu">···</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            Workspace <Icon name="chevron" size={12} />
            <span>Security graph</span>
          </div>
          <div className="topbar-right">
            <button
              className="mode-switch"
              onClick={() => {
                if (live) {
                  setLive(false);
                  setSelected("web");
                } else {
                  setConsoleTab("cloud");
                }
              }}
            >
              {live ? "デモへ切替" : "実環境に切替"}
            </button>
            <span className="sample-badge">
              <span className="live-dot" />
              {live ? "実環境ワークスペース" : "デモワークスペース"}
            </span>
            <button
              className="icon-button"
              aria-label="通知"
              onClick={() =>
                setNotice(
                  live
                    ? `Backend ${healthy ? "接続済み" : "未接続"}。実データを 4 秒ごとに更新します。`
                    : "現在はデモデータを表示しています。実環境に切り替えると、実際の検出結果を確認できます。",
                )
              }
            >
              <Icon name="bell" />
              <span className="notification-dot" />
            </button>
            <span className="avatar small">SK</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span /> YOUR SECURITY, CONNECTED
              </div>
              <h1>
                Security graph<span className="beta">BETA</span>
              </h1>
              <p>資産をつなぎ、リスクの全体像を見つける。</p>
            </div>
            <div className="heading-actions">
              <button
                className="secondary-button"
                onClick={() => setConsoleTab("targets")}
              >
                実診断を管理
              </button>
              <button
                className="primary-button"
                onClick={() => setConsoleTab("cloud")}
              >
                <Icon name="plus" size={16} />
                クラウドを接続
              </button>
            </div>
          </div>
          {liveError && (
            <div className="live-error" role="alert">
              {liveError} — 実環境データを表示できません。再ログインまたは
              backend の接続状態を確認してください。
            </div>
          )}
          {live && snapshot?.connections.some((c) => c.status === "error") && (
            <div className="live-error">
              クラウド同期に失敗した接続があります。前回の取得データと取得時刻を保持しています。クラウド接続から状態を確認してください。
            </div>
          )}
          {live && !snapshot?.assets.length && !liveError && (
            <div className="live-empty">
              <strong>実環境の資産を接続しましょう</strong>
              <span>
                クラウドの同期、または DNS
                所有確認後の診断で、資産と検出結果がここに反映されます。
              </span>
            </div>
          )}
          <section className="metrics" aria-label="資産とリスクのサマリー">
            <button
              className="metric"
              onClick={() => {
                setRisk("all");
                setSearch("");
                setProvider("All");
              }}
            >
              <span className="metric-label">
                検出された資産
                <Icon name="layers" size={16} />
              </span>
              <span className="metric-value">
                {live ? assets.length - 1 : 11}
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
                setRisk("scanned");
                setView("coverage");
              }}
            >
              <span className="metric-label">
                診断カバレッジ
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
                setRisk("critical");
                setView("coverage");
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
                {live ? "資産の関連" : "攻撃経路"}
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
          <section className="graph-panel" aria-label="セキュリティグラフ">
            <div className="graph-heading">
              <div
                className="graph-tabs"
                role="tablist"
                aria-label="グラフの種類"
              >
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
                  Asset coverage graph
                </button>
                <button
                  role="tab"
                  aria-selected={view === "exploration"}
                  className={view === "exploration" ? "active" : ""}
                  onClick={() => explore()}
                >
                  <Icon name="graph" size={16} />
                  Exploration graph
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
                  aria-label="資産を検索"
                  placeholder="資産名・リソースタイプで検索..."
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
                  <option value="findings">検出結果のある資産</option>
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
                    setRisk("all");
                    setProvider("All");
                    setSearch("");
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
                      ? "資産のつながりと診断状況"
                      : live
                        ? "確認済みの構成上の関係・到達可能性は未検証"
                        : "公開エンドポイントから重要資産への経路"}
                  </span>
                </div>
                {view === "exploration" && !live && (
                  <div className="query-switch">
                    <button
                      className={query === "exposure" ? "chosen" : ""}
                      onClick={() => {
                        setQuery("exposure");
                        setSelected("web");
                      }}
                    >
                      公開ワークロード → データベース
                    </button>
                    <button
                      className={query === "storage" ? "chosen" : ""}
                      onClick={() => {
                        setQuery("storage");
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
                      ? "資産の階層とカバレッジ。各ノードを選択して詳細を表示"
                      : "資産間の攻撃経路。各ノードを選択して詳細を表示"
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
                      <path d="M1 1l6 3-6 3" fill="none" stroke="#aa7274" />
                    </marker>
                  </defs>
                  <g
                    transform={`translate(${pan.x} ${pan.y}) translate(460 260) scale(${zoom}) translate(-460 -260)`}
                  >
                    {edges.map(({ from, to, relation }) => (
                      <g
                        key={`${from.id}-${to.id}`}
                        opacity={
                          visibleIds.has(from.id) && visibleIds.has(to.id)
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
                        className={`asset-node ${a.risk} ${focusedID === a.id ? "selected" : ""}`}
                        transform={`translate(${a.x} ${a.y})`}
                        opacity={visibleIds.has(a.id) ? 1 : 0.12}
                        role="button"
                        aria-label={`${a.name}, ${riskLabel[a.risk]}`}
                        aria-pressed={focusedID === a.id}
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
                          }
                        }}
                      >
                        {focusedID === a.id && (
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
                    条件に一致する資産はありません。
                    <button
                      onClick={() => {
                        setSearch("");
                        setRisk("all");
                        setProvider("All");
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
                      aria-label="縮小"
                      onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
                    >
                      <Icon name="minus" size={15} />
                    </button>
                    <span>{Math.round(zoom * 100)}%</span>
                    <button
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
              <aside className="asset-details">
                <div className="detail-heading">
                  <span>ASSET DETAILS</span>
                  <Icon name="external" size={14} />
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
                          {active.risk === "unscanned"
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
                                ? "カバレッジに空白があります"
                                : active.findings
                                  ? "検出結果を確認してください"
                                  : "チェック済みの資産です"}
                        </strong>
                        <p>
                          {active.risk === "critical"
                            ? "外部公開と関連するリスクを、グラフで確認できます。"
                            : active.risk === "unscanned"
                              ? "この資産はまだ診断されていません。"
                              : "関連資産とのつながりを探索し、影響範囲を確認できます。"}
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
                        サンプル資産の検出数：{active.findings}。Exploration
                        graph で関連経路を確認できます。
                      </p>
                    )}
                  </div>
                )}
                <button
                  className="explore-button"
                  onClick={() => {
                    setRisk("all");
                    setProvider("All");
                    setSearch("");
                    explore();
                  }}
                >
                  Exploration graph で探索
                  <Icon name="arrow" size={16} />
                </button>
                <p className="detail-note">ノードを選択して、つながりを発見</p>
              </aside>
            </div>
            <div className="graph-footer">
              <span>
                <span className="live-dot" />
                {shown.length} assets displayed{" "}
                <span className="footer-separator">/</span>{" "}
                {view === "coverage" ? "階層レイアウト" : "経路レイアウト"}
              </span>
              <span>ドラッグで移動 · ノードをクリックして詳細を表示</span>
            </div>
          </section>
          <section className="findings-section">
            <div className="section-heading">
              <div>
                <h2>
                  優先して確認するリスク<span>{filteredFindings.length}</span>
                </h2>
                <p>単体の脆弱性から、資産のつながりに潜むリスクへ。</p>
              </div>
              <button
                className="text-button"
                onClick={() => {
                  setRisk("all");
                  setProvider("All");
                  setSearch("");
                  setDetails((v) => !v);
                }}
              >
                {details ? "説明を閉じる" : "すべてのリスクを確認"}
                <Icon name="arrow" size={15} />
              </button>
            </div>
            {details && (
              <div className="risk-explanation">
                {live
                  ? "クラウド構成および HTTPS 応答で確認した検出結果です。CVE や実際の侵入可能性は評価していません。行を選択し、資産詳細のリスクタブで証跡と推奨対応を確認できます。"
                  : "デモには Critical 2 件、High 1 件のリスクシナリオを収録しています。ノードの件数は資産単位のサンプル検出数です。"}
              </div>
            )}
            <div className="findings-table">
              <div className="table-header">
                <span>重要度</span>
                <span>検出されたリスク</span>
                <span>対象資産</span>
                <span>{live ? "重要度" : "リスクスコア"}</span>
                <span />
              </div>
              {filteredFindings.map((f) => (
                <button
                  key={f.id}
                  className={`finding-row ${selected === f.asset ? "finding-selected" : ""}`}
                  onClick={() => {
                    setRisk("all");
                    setSearch("");
                    setProvider("All");
                    explore(f.asset);
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
          <footer className="page-footer">
            <span>
              <span className="brand-symbol">◈</span> OAPYS
              <span className="footer-separator">/</span>See the connections.
              Secure the whole.
            </span>
            <span>
              {live
                ? "実環境データ · HTTPS / クラウド構成チェック"
                : "デモデータ · 実際の診断は実行されません"}
            </span>
          </footer>
        </main>
      </div>
      {consoleTab && (
        <ConnectionConsole
          snapshot={snapshot}
          onSnapshot={receiveSnapshot}
          initialTab={consoleTab}
          onClose={() => setConsoleTab(null)}
          onLogout={() => {
            setSnapshot(null);
            setLive(false);
            setSelected("web");
          }}
        />
      )}
      {notice && (
        <div className="notice-backdrop" onClick={() => setNotice("")}>
          <div
            className="notice-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") setNotice("");
              if (e.key === "Tab") {
                e.preventDefault();
                const buttons =
                  e.currentTarget.querySelectorAll<HTMLButtonElement>("button");
                const index = Array.from(buttons).indexOf(
                  document.activeElement as HTMLButtonElement,
                );
                buttons[
                  (index + (e.shiftKey ? buttons.length - 1 : 1)) %
                    buttons.length
                ]?.focus();
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="notice-close icon-button"
              aria-label="閉じる"
              onClick={() => setNotice("")}
            >
              <Icon name="close" />
            </button>
            <div className="notice-icon">
              <Icon name="shield" size={26} />
            </div>
            <h2 id="notice-title">ワークスペースのお知らせ</h2>
            <p>{notice}</p>
            <button
              className="primary-button"
              autoFocus
              onClick={() => setNotice("")}
            >
              確認しました
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
