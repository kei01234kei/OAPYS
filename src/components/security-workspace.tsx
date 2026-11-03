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
import { CommandPalette, StatusBar } from "@/components/console-chrome";
import {
  securityRequest,
  type LiveAsset,
  type LiveEdge,
  type LiveFinding,
  type SecuritySnapshot,
} from "@/lib/security-types";
import { componentsOf } from "@/components/exploit-graph";
import { useLocale } from "@/components/locale-provider";
import { securityWorkspaceMessages } from "@/i18n/security-workspace";

export type IconName =
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
  /** A component reached by a diagnosis, shared with the exploit graph. */
  component?: { targetId: string; node: string };
};
// How the system topology names each link of a diagnosed endpoint.
const RELATION: Record<string, string> = {
  ip: "resolves_to",
  port: "listens_on",
  tls: "terminates_tls",
  edge: "served_by",
  app: "routes_to",
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
const demoFindingBase = [
  {
    id: "F-001",
    key: "exposedWorkload",
    detail: "Public exposure + vulnerable package",
    asset: "web",
    severity: "critical",
    score: "9.8",
  },
  {
    id: "F-002",
    key: "publicStorage",
    detail: "Public bucket + sensitive data",
    asset: "bucket",
    severity: "critical",
    score: "9.1",
  },
  {
    id: "F-003",
    key: "databaseAccess",
    detail: "Overprivileged identity + database access",
    asset: "db",
    severity: "high",
    score: "8.2",
  },
] as const;
function demoFindingsFor(t: (typeof securityWorkspaceMessages)["en"]) {
  return demoFindingBase.map(({ key, ...finding }) => ({
    ...finding,
    ...t.demoFindings[key],
  }));
}
const attackIds = ["domain", "web", "api", "db"];
function hasLiveData(data: SecuritySnapshot) {
  return [data.assets, data.connections, data.targets, data.jobs].some(
    (rows) => rows.length > 0,
  );
}

function useWorkspaceState() {
  const locale = useLocale();
  const t = securityWorkspaceMessages[locale];
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
        if (!active) return;
        // Until anything real is registered, keep showing the demo so a new
        // admin can explore the product before running a diagnosis.
        if (hasLiveData(data)) receiveSnapshot(data);
        else setSnapshot(data);
      })
      .catch(() => {
        /* The demo remains available without a backend session. */
      });
    return () => {
      active = false;
    };
  }, [receiveSnapshot]);
  const diagnosing = !!snapshot?.jobs.some((j) => j.status === "running");
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
            error instanceof Error ? error.message : t.refreshFailed,
          );
        }
      }
    };
    // Poll faster while a diagnosis runs so the exploit graph grows live.
    const timer = setInterval(
      () => {
        void refresh();
      },
      diagnosing ? 1500 : 4000,
    );
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [live, diagnosing, t]);
  const topology = useMemo((): {
    assets: Asset[];
    links: LiveEdge[];
    findingAsset: Record<string, string>;
  } => {
    if (!live) return { assets: demoAssets, links: [], findingAsset: {} };
    const links: LiveEdge[] = [];
    const findingAsset: Record<string, string> = {};
    const chains: Asset[][] = [];
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
      if (asset.kind === "HTTPS endpoint") {
        chains.push(endpointChain(asset));
        continue;
      }
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
    // Diagnosed endpoints get their own lane, laid out in the same column
    // order as the exploit graph: domain → IP → port → TLS → edge → app.
    let top = 80 + Math.max(0, ...rows) * 115;
    for (const chain of chains) {
      const perCol = new Map<number, number>();
      for (const a of chain) perCol.set(a.x, (perCol.get(a.x) ?? 0) + 1);
      const height = Math.max(...perCol.values());
      const used = new Map<number, number>();
      for (const a of chain) {
        const i = used.get(a.x) ?? 0;
        used.set(a.x, i + 1);
        a.y = top + ((height - perCol.get(a.x)!) * 115) / 2 + i * 115;
        result.push(a);
      }
      top += height * 115 + 20;
    }
    const ys = result.slice(1).map((a) => a.y);
    if (ys.length) result[0].y = (Math.min(...ys) + Math.max(...ys)) / 2;
    return { assets: result, links, findingAsset };

    function endpointChain(asset: LiveAsset): Asset[] {
      const related =
        snapshot?.findings.filter((f) => f.assetId === asset.id) ?? [];
      const job = snapshot?.jobs
        .filter((j) => j.targetId === asset.id && j.observation)
        .at(-1);
      const graph = job ? componentsOf(job, related, locale) : null;
      const owner = (f: LiveFinding) => {
        const node = graph?.findingAnchor.get(f.id);
        return !node || node === "domain" ? asset.id : `${asset.id}/${node}`;
      };
      for (const f of related) findingAsset[f.id] = owner(f);
      const riskOf = (id: string, fallback: Asset["risk"]) => {
        const mine = related.filter((f) => owner(f) === id);
        return {
          findings: mine.length,
          risk:
            (["critical", "high", "medium", "low"] as const).find((level) =>
              mine.some((f) => f.severity === level),
            ) ?? fallback,
        };
      };
      const root: Asset = {
        ...asset,
        icon: "globe",
        x: 285,
        y: 0,
        parent: "workspace",
        ...riskOf(asset.id, asset.checkedAt ? "covered" : "unscanned"),
      };
      if (!graph) return [root];
      const idOf = (node: string) =>
        node === "domain" ? asset.id : `${asset.id}/${node}`;
      for (const l of graph.links)
        links.push({
          source: idOf(l.from),
          target: idOf(l.to),
          relation: RELATION[l.to.split(":")[0]] ?? "connects_to",
        });
      return [
        root,
        ...graph.components
          .filter((c) => c.id !== "domain")
          .map((c): Asset => ({
            id: idOf(c.id),
            name: c.title,
            kind: c.role,
            icon: c.icon,
            x: 285 + (c.col - 1) * 150,
            y: 0,
            provider: "External",
            region: "",
            checkedAt: job?.finishedAt,
            component: { targetId: asset.id, node: c.id },
            ...riskOf(idOf(c.id), c.dim ? "unscanned" : "covered"),
          })),
      ];
    }
  }, [live, snapshot, locale]);
  const { assets, findingAsset } = topology;
  const findings = live
    ? (snapshot?.findings ?? []).map((f) => ({
        ...f,
        asset: f.assetId,
        detail: f.evidence,
        score: "—",
        category: f.rule,
      }))
    : demoFindingsFor(t);
  const resources = live
    ? assets.filter(
        (a) =>
          a.kind !== "Organization" &&
          a.kind !== "Cloud account" &&
          !a.component,
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
  const realEdges = [...(snapshot?.edges ?? []), ...topology.links].filter(
    (e) => assetByID.has(e.source) && assetByID.has(e.target),
  );
  const graphAssets =
    view === "coverage"
      ? assets
      : live
        ? assets
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
    findingAsset,
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
  { href: "/", page: "overview", shortcut: "o", icon: "grid" },
  { href: "/assets", page: "assets", shortcut: "a", icon: "layers" },
  { href: "/risks", page: "risks", shortcut: "r", icon: "shield" },
  { href: "/investigations", page: "investigations", shortcut: "i", icon: "search" },
  { href: "/settings", page: "settings", shortcut: "s", icon: "settings" },
] as const;

export default function SecurityWorkspace({
  healthy,
  children,
}: {
  healthy: boolean;
  children: React.ReactNode;
}) {
  const workspace = useWorkspaceState();
  const t = securityWorkspaceMessages[useLocale()];
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
  const paletteNavigation = useMemo(
    () =>
      navigation.map((item) => ({
        href: item.href,
        key: item.shortcut,
        label: t.nav[item.page],
      })),
    [t],
  );
  const toggleMode = useCallback(() => {
    if (live) {
      investigation.reset();
      setLive(false);
      setSelected("web");
    } else if (snapshot && hasLiveData(snapshot)) {
      setLive(true);
    } else {
      // Nothing registered yet: live mode starts from cloud setup.
      openSettings("cloud");
    }
  }, [live, snapshot, investigation, setLive, setSelected, openSettings]);
  return (
    <WorkspaceContext.Provider value={workspace}>
      <div className="app-shell">
        <aside className="sidebar" inert={!!notice}>
          <Link className="brand" href="/" aria-label={t.home}>
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
          <nav aria-label={t.mainNavigation}>
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={t.nav[item.page]}
                aria-current={pathname === item.href ? "page" : undefined}
                className={pathname === item.href ? "nav-active" : ""}
              >
                <Icon name={item.icon} />
                <span>{t.nav[item.page]}</span>
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
                <small>{live ? t.exploreLive : t.exploreSample}</small>
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
              <span>{t.nav[current.page]}</span>
            </div>
            <div className="topbar-right">
              <CommandPalette
                navigation={paletteNavigation}
                live={live}
                onToggleMode={toggleMode}
                onConnectCloud={() => openSettings("cloud")}
                onManageDiagnosis={() => openSettings("targets")}
              />
              <ThemeSelect />
              <button
                className="mode-switch"
                onClick={toggleMode}
              >
                {live ? t.switchToDemo : t.switchToLive}
              </button>
              <span className="sample-badge">
                <span className="live-dot" />
                {live ? t.liveWorkspace : t.demoWorkspace}
              </span>
              <button
                className="icon-button"
                aria-label={t.notifications}
                onClick={() =>
                  setNotice(live ? t.liveNotice(healthy) : t.demoNotice)
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
                <h1>{t.nav[current.page]}</h1>
                <p>{t.descriptions[current.page]}</p>
              </div>
              {pathname !== "/settings" && (
                <div className="heading-actions">
                  <button
                    className="secondary-button"
                    onClick={() => openSettings("targets")}
                  >
                    {t.manageDiagnosis}
                  </button>
                  <button
                    className="primary-button"
                    onClick={() => openSettings("cloud")}
                  >
                    <Icon name="plus" size={16} />
                    {t.connectCloud}
                  </button>
                </div>
              )}
            </div>
            {liveError && (
              <div className="live-error" role="alert">
                {liveError} {t.liveErrorSuffix}
              </div>
            )}
            {live &&
              snapshot?.connections.some((c) => c.status === "error") && (
                <div className="live-error">{t.syncFailed}</div>
              )}
            {live && !snapshot?.assets.length && !liveError && (
              <div className="live-empty">
                <strong>{t.emptyTitle}</strong>
                <span>{t.emptyBody}</span>
              </div>
            )}
            {children}
            <footer className="page-footer">
              <span>
                <span className="brand-symbol">◈</span> OAPYS
                <span className="footer-separator">/</span>See the connections.
                Secure the whole.
              </span>
              <span>{live ? t.footerLive : t.footerDemo}</span>
            </footer>
          </main>
          <StatusBar
            healthy={healthy}
            live={live}
            findings={findings.length}
            snapshot={snapshot}
          />
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
                aria-label={t.close}
                onClick={() => setNotice("")}
              >
                <Icon name="close" />
              </button>
              <div className="notice-icon">
                <Icon name="shield" size={26} />
              </div>
              <h2 id="notice-title">{t.noticeTitle}</h2>
              <p>{notice}</p>
              <button className="primary-button" onClick={() => setNotice("")}>
                {t.acknowledge}
              </button>
            </div>
          </div>
        )}
      </div>
    </WorkspaceContext.Provider>
  );
}
