import { isBackendHealthy } from "@/lib/backend";

export const dynamic = "force-dynamic";

export default async function Home() {
  const healthy = await isBackendHealthy();

  return (
    <main className="site-shell">
      <header className="site-header">
        <span className="brand">OAPYS<span className="accent">.</span></span>
        <span className="badge">DEVELOPMENT</span>
      </header>

      <div className="workspace">
        <section className="intro" aria-labelledby="intro-title">
          <p className="eyebrow">OFFENSIVE ATTACK TO<br />PROTECT YOUR SYSTEMS</p>
          <h1 id="intro-title">攻めの視点で、<br /><span className="accent">システムを守る。</span></h1>
          <p className="description">
            所有権を確認したドメインを対象に、<br className="desktop-break" />
            セキュリティを検証するためのプラットフォーム。
          </p>
          <p className="development-note">現在は開発段階です。ドメイン所有確認・診断機能は準備中です。</p>
        </section>

        <section className="panel" aria-labelledby="status-title">
          <div className="panel-heading">
            <div>
              <p className="panel-label">SYSTEM STATUS</p>
              <h2 id="status-title">開発環境</h2>
            </div>
            <span className="panel-index" aria-hidden="true">01</span>
          </div>
          <p className="panel-description">サービスの起動・接続状態を確認できます。</p>

          <dl className="status-list">
            <div>
              <dt>Frontend</dt>
              <dd>
                <span className="service-name">Next.js</span>
                <span className="status online"><span className="dot" aria-hidden="true" />起動中</span>
              </dd>
            </div>
            <div>
              <dt>Backend</dt>
              <dd>
                <span className="service-name">Go API</span>
                <span className={`status ${healthy ? "online" : "offline"}`}>
                  <span className="dot" aria-hidden="true" />{healthy ? "接続済み" : "未接続"}
                </span>
              </dd>
            </div>
            <div>
              <dt>ドメイン所有確認</dt>
              <dd><span className="status pending">未実装</span></dd>
            </div>
            <div>
              <dt>診断機能</dt>
              <dd><span className="status pending">未実装</span></dd>
            </div>
          </dl>

          <form action="/" method="get">
            <button className="refresh-button" type="submit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 7v5h-5" />
                <path d="M4 17v-5h5" />
                <path d="M6.1 6.1A8 8 0 0 1 19.5 10L20 12M4 12l.5 2A8 8 0 0 0 17.9 17.9" />
              </svg>
              接続状態を再確認
            </button>
          </form>
          <p className="panel-note">再確認すると、このページの状態表示を更新します。</p>
        </section>
      </div>

      <footer className="site-footer">
        <span>OAPYS / Authorized security testing</span>
        <span>許可されたシステムに、安全な検証を。</span>
      </footer>
    </main>
  );
}
