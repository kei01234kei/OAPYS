"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useInvestigation } from "@/components/investigation-workspace";
import { useModal } from "@/lib/use-modal";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ThemeSelect from "@/components/theme-select";
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
export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
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
export const riskLabel = {
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

function useWorkspaceState() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  function updateGraphParam(key: string, value: string) {
    if (pathname !== "/assets") return;
    const next = new URLSearchParams(window.location.search);
    next.set(key, value);
    window.history.replaceState(null, "", `/assets?${next}`);
  }
  const [snapshot, setSnapshot] = useState<SecuritySnapshot | null>(null);
  const [live, setLive] = useState(false);
  function openSettings(tab: "cloud" | "targets") {
    router.push(tab === "targets" ? "/settings?tab=targets" : "/settings");
  }
  const [liveError, setLiveError] = useState("");
  const [aiFocus, setAIFocus] = useState<string[]>([]);
  const receiveSnapshot = useCallback((data: SecuritySnapshot) => {
    setSnapshot(data);
    setLive(true);
    setLiveError("");
  }, []);
  useEffect(() => {
    let active = true;
    securityRequest<{ authenticated: boolean }>("session")
      .then(async (session) => {
        if (!session.authenticated) return;
        const data = await securityRequest<SecuritySnapshot>("snapshot");
        if (active) receiveSnapshot(data);
      })
      .catch(() => {
        /* The demo remains available without a backend session. */
      });
    return () => {
      active = false;
    };
  }, [receiveSnapshot]);
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
  const [savedView, saveView] = useState<"coverage" | "exploration">(
    "coverage",
  );
  const viewParam = pathname === "/assets" ? params.get("view") : null;
  const view =
    viewParam === "coverage" || viewParam === "exploration"
      ? viewParam
      : savedView;
  function setView(value: "coverage" | "exploration") {
    saveView(value);
    updateGraphParam("view", value);
  }
  const [savedSelected, saveSelected] = useState("web");
  const selected =
    (pathname === "/assets" ? params.get("asset") : null) || savedSelected;
  function setSelected(value: string) {
    saveSelected(value);
    updateGraphParam("asset", value);
  }
  const [provider, setProvider] = useState("All");
  const [risk, setRisk] = useState("all");
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [notice, setNotice] = useState("");
  const noticeDialog = useRef<HTMLDivElement>(null);
  useModal(noticeDialog, !!notice);
  const [details, setDetails] = useState(false);
  const [riskListSearch, setRiskListSearch] = useState("");
  const [riskSeverity, setRiskSeverity] = useState("all");
  const [savedDetailTab, saveDetailTab] = useState("overview");
  const detailParam = pathname === "/assets" ? params.get("tab") : null;
  const detailTab =
    detailParam === "overview" || detailParam === "risks"
      ? detailParam
      : savedDetailTab;
  function setDetailTab(value: string) {
    saveDetailTab(value);
    updateGraphParam("tab", value);
  }
  const query = ["bucket", "backup"].includes(selected)
    ? "storage"
    : "exposure";
  const selectedAsset = assets.find((a) => a.id === selected) ?? assets[0];
  const focusedID = selectedAsset.id;
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
          (!search.trim() ||
            `${a.name} ${a.kind}`
              .toLowerCase()
              .includes(search.trim().toLowerCase())),
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
  const active = shown.find((a) => a.id === selected) ?? shown[0];
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
  function clearFilters() {
    setRisk("all");
    setProvider("All");
    setSearch("");
    setAIFocus([]);
  }
  function openAssets(
    id: string,
    mode: "coverage" | "exploration",
    tab = "overview",
  ) {
    router.push(
      `/assets?asset=${encodeURIComponent(id)}&view=${mode}&tab=${tab}`,
    );
  }
  function showCoverage(nextRisk = "all") {
    clearFilters();
    setRisk(nextRisk);
    setView("coverage");
    setPan({ x: 0, y: 0 });
    setZoom(1);
    openAssets(selected, "coverage");
  }
  function explore(id = active?.id ?? selected) {
    clearFilters();
    const assetId = live
      ? assets.some((a) => a.id === id)
        ? id
        : focusedID
      : [...attackIds, "bucket", "backup"].includes(id)
        ? id
        : "web";
    setSelected(assetId);
    setView("exploration");
    setDetailTab("risks");
    setPan({ x: 0, y: 0 });
    setZoom(1);
    openAssets(assetId, "exploration", "risks");
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
  const investigation = useInvestigation(
    live,
    selectedAsset.id !== "workspace" ? selectedAsset : undefined,
  );
  return {
    investigation,
    snapshot,
    setSnapshot,
    live,
    setLive,
    liveError,
    aiFocus,
    setAIFocus,
    receiveSnapshot,
    assets,
    findings,
    resources,
    scanned,
    coverage,
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
    notice,
    setNotice,
    noticeDialog,
    details,
    setDetails,
    riskListSearch,
    setRiskListSearch,
    riskSeverity,
    setRiskSeverity,
    detailTab,
    setDetailTab,
    query,
    selectedAsset,
    focusedID,
    visible,
    visibleIds,
    shown,
    active,
    edges,
    realEdges,
    graphAssets,
    graphHeight,
    clearFilters,
    openAssets,
    showCoverage,
    explore,
    exportGraph,
    openSettings,
  };
}

const WorkspaceContext = createContext<ReturnType<
  typeof useWorkspaceState
> | null>(null);
export function useWorkspace() {
  const workspace = useContext(WorkspaceContext);
  if (!workspace) throw new Error("Workspace provider is missing");
  return workspace;
}

const navigation = [
  { href: "/", label: "概要", icon: "grid" },
  { href: "/assets", label: "管理対象", icon: "layers" },
  { href: "/risks", label: "リスク", icon: "shield" },
  { href: "/investigations", label: "AI 調査", icon: "search" },
  { href: "/settings", label: "設定", icon: "settings" },
] as const;
const pageDescriptions: Record<string, string> = {
  "/": "管理対象と診断状況、優先して確認するリスクを把握します。",
  "/assets": "管理対象のチェック状況と、関連する管理対象のつながりを確認します。",
  "/risks": "検出されたリスクを絞り込み、管理対象と証跡を確認します。",
  "/investigations": "AI に調査を依頼し、根拠と次の対応を確認します。",
  "/settings": "クラウド接続、診断対象、管理者セッションを管理します。",
};

export default function SecurityWorkspace({
  healthy,
  children,
}: {
  healthy: boolean;
  children: React.ReactNode;
}) {
  const workspace = useWorkspaceState();
  const {
    investigation,
    live,
    setLive,
    setSelected,
    findings,
    openSettings,
    notice,
    setNotice,
    noticeDialog,
    liveError,
    snapshot,
  } = workspace;
  const pathname = usePathname();
  const current =
    navigation.find((item) => item.href === pathname) ?? navigation[0];
  return (
    <WorkspaceContext.Provider value={workspace}>
      <div className="app-shell">
        <aside className="sidebar" inert={!!notice}>
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
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-current={pathname === item.href ? "page" : undefined}
                className={pathname === item.href ? "nav-active" : ""}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.href === "/risks" && (
                  <span className="nav-count">{findings.length}</span>
                )}
              </Link>
            ))}
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
            <div className="profile">
              <span className="avatar">SK</span>
              <div>
                Security team<small>Workspace admin</small>
              </div>
              <span className="profile-menu">···</span>
            </div>
          </div>
        </aside>
        <div className="main-shell" inert={!!notice}>
          <header className="topbar">
            <div className="breadcrumbs">
              Workspace <Icon name="chevron" size={12} />
              <span>{current.label}</span>
            </div>
            <div className="topbar-right">
              <ThemeSelect />
              <button
                className="mode-switch"
                onClick={() => {
                  if (live) {
                    investigation.reset();
                    setLive(false);
                    setSelected("web");
                  } else {
                    openSettings("cloud");
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
                <h1>{current.label}</h1>
                <p>{pageDescriptions[pathname]}</p>
              </div>
              {pathname !== "/settings" && (
                <div className="heading-actions">
                  <button
                    className="secondary-button"
                    onClick={() => openSettings("targets")}
                  >
                    実診断を管理
                  </button>
                  <button
                    className="primary-button"
                    onClick={() => openSettings("cloud")}
                  >
                    <Icon name="plus" size={16} />
                    クラウドを接続
                  </button>
                </div>
              )}
            </div>
            {liveError && (
              <div className="live-error" role="alert">
                {liveError} — 実環境データを表示できません。再ログインまたは
                backend の接続状態を確認してください。
              </div>
            )}
            {live &&
              snapshot?.connections.some((c) => c.status === "error") && (
                <div className="live-error">
                  クラウド同期に失敗した接続があります。前回の取得データと取得時刻を保持しています。クラウド接続から状態を確認してください。
                </div>
              )}
            {live && !snapshot?.assets.length && !liveError && (
              <div className="live-empty">
                <strong>実環境の管理対象を接続しましょう</strong>
                <span>
                  クラウドの同期、または DNS
                  所有確認後の診断で、管理対象と検出結果がここに反映されます。
                </span>
              </div>
            )}
            {children}
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
        {notice && (
          <div className="notice-backdrop" onClick={() => setNotice("")}>
            <div
              ref={noticeDialog}
              tabIndex={-1}
              className="notice-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="notice-title"
              onKeyDown={(e) => {
                if (e.key === "Escape") setNotice("");
                if (e.key === "Tab") {
                  e.preventDefault();
                  const buttons =
                    e.currentTarget.querySelectorAll<HTMLButtonElement>(
                      "button",
                    );
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
              <button className="primary-button" onClick={() => setNotice("")}>
                確認しました
              </button>
            </div>
          </div>
        )}
      </div>
    </WorkspaceContext.Provider>
  );
}
