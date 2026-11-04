import { defineMessages } from "@/lib/i18n";

export const securityWorkspaceMessages = defineMessages(
  {
    demoFindings: {
      exposedWorkload: {
        title: "Vulnerable workload exposed to the internet",
        category: "Attack path",
      },
      publicStorage: {
        title: "Anonymous access to public storage",
        category: "Data exposure",
      },
      databaseAccess: {
        title: "Excessive access permissions on the database",
        category: "Access permissions",
      },
    },
    refreshFailed: "Refresh failed",
    nav: {
      overview: "Overview",
      assets: "Assets",
      risks: "Risks",
      investigations: "AI investigation",
      agents: "Agent tasks",
      settings: "Settings",
    },
    descriptions: {
      overview:
        "See your assets, diagnosis status, and the risks to review first.",
      assets:
        "Review diagnosis status and connections in the system topology, and the paths and risks reached from outside in the exploit graph.",
      risks:
        "Filter detected risks and review the affected assets and evidence.",
      investigations:
        "Ask AI to investigate, then review the evidence and next actions.",
      agents:
        "Authorize an autonomous test against a verified target, then decide each tool call the guard flags.",
      settings:
        "Manage cloud connections, diagnosis targets, and the admin session.",
    },
    home: "OAPYS home",
    mainNavigation: "Main navigation",
    exploreLive: "Exploring live data",
    exploreSample: "Exploring sample data",
    switchToDemo: "Switch to demo",
    switchToLive: "Switch to live",
    liveWorkspace: "Live workspace",
    demoWorkspace: "Demo workspace",
    notifications: "Notifications",
    liveNotice: (healthy: boolean) =>
      `Backend ${healthy ? "connected" : "not connected"}. Live data refreshes every 4 seconds.`,
    demoNotice:
      "You are viewing demo data. Switch to live to see actual findings.",
    manageDiagnosis: "Manage diagnoses",
    connectCloud: "Connect cloud",
    liveErrorSuffix:
      "— Cannot show live data. Sign in again or check the backend connection.",
    syncFailed:
      "Some connections failed to sync. The previously collected data and its timestamp are kept. Check status under cloud connections.",
    emptyTitle: "Connect your live assets",
    emptyBody:
      "Assets and findings appear here after a cloud sync or a diagnosis following DNS ownership verification.",
    footerLive: "Live data · HTTPS / cloud configuration checks",
    footerDemo: "Demo data · No real diagnosis is run",
    close: "Close",
    noticeTitle: "Workspace notice",
    acknowledge: "Got it",
  },
  {
    demoFindings: {
      exposedWorkload: {
        title: "インターネットに公開された脆弱なワークロード",
        category: "攻撃経路",
      },
      publicStorage: {
        title: "パブリックストレージへの匿名アクセス",
        category: "データ露出",
      },
      databaseAccess: {
        title: "データベースへの過剰なアクセス権限",
        category: "アクセス権限",
      },
    },
    refreshFailed: "更新に失敗しました",
    nav: {
      overview: "概要",
      assets: "管理対象",
      risks: "リスク",
      investigations: "AI 調査",
      agents: "エージェントタスク",
      settings: "設定",
    },
    descriptions: {
      overview: "管理対象と診断状況、優先して確認するリスクを把握します。",
      assets:
        "システム構成で診断状況とつながりを、エクスプロイトグラフで外部から到達した経路とリスクを確認します。",
      risks: "検出されたリスクを絞り込み、管理対象と証跡を確認します。",
      investigations: "AI に調査を依頼し、根拠と次の対応を確認します。",
      agents:
        "確認済みターゲットに対する自律テストを認可し、ガードが提示した各ツール呼び出しを判断します。",
      settings: "クラウド接続、診断対象、管理者セッションを管理します。",
    },
    home: "OAPYS ホーム",
    mainNavigation: "メインナビゲーション",
    exploreLive: "実環境データで探索",
    exploreSample: "サンプルデータで探索",
    switchToDemo: "デモへ切替",
    switchToLive: "実環境に切替",
    liveWorkspace: "実環境ワークスペース",
    demoWorkspace: "デモワークスペース",
    notifications: "通知",
    liveNotice: (healthy: boolean) =>
      `Backend ${healthy ? "接続済み" : "未接続"}。実データを 4 秒ごとに更新します。`,
    demoNotice:
      "現在はデモデータを表示しています。実環境に切り替えると、実際の検出結果を確認できます。",
    manageDiagnosis: "実診断を管理",
    connectCloud: "クラウドを接続",
    liveErrorSuffix:
      "— 実環境データを表示できません。再ログインまたは backend の接続状態を確認してください。",
    syncFailed:
      "クラウド同期に失敗した接続があります。前回の取得データと取得時刻を保持しています。クラウド接続から状態を確認してください。",
    emptyTitle: "実環境の管理対象を接続しましょう",
    emptyBody:
      "クラウドの同期、または DNS 所有確認後の診断で、管理対象と検出結果がここに反映されます。",
    footerLive: "実環境データ · HTTPS / クラウド構成チェック",
    footerDemo: "デモデータ · 実際の診断は実行されません",
    close: "閉じる",
    noticeTitle: "ワークスペースのお知らせ",
    acknowledge: "確認しました",
  },
);
