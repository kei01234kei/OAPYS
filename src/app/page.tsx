import { isBackendHealthy } from "@/lib/backend";
export const dynamic = "force-dynamic";
export default async function Home() {
  const healthy = await isBackendHealthy();
  return (
    <main>
      <header><span className="brand">OAPYS<span className="accent">.</span></span><span className="badge">DEVELOPMENT</span></header>
      <section className="intro">
        <p className="eyebrow">OFFENSIVE ATTACK TO PROTECT YOUR SYSTEMS</p>
        <h1>攻めの視点で、<br />システムを守る。</h1>
        <p className="description">所有権を確認したドメインを対象に、セキュリティを検証するためのプラットフォーム。</p>
      </section>
      <section className="panel" aria-labelledby="status-title">
        <div className="panel-heading"><h2 id="status-title">開発環境</h2><span>01 / FOUNDATION</span></div>
        <dl>
          <div><dt>Frontend</dt><dd><span className="dot online" />Next.js · 起動中</dd></div>
          <div><dt>Backend</dt><dd><span className={`dot ${healthy ? "online" : "offline"}`} />{healthy ? "Go API · 接続済み" : "Go API · 未接続"}</dd></div>
          <div><dt>ドメイン所有確認</dt><dd className="muted">未実装</dd></div>
          <div><dt>診断機能</dt><dd className="muted">未実装</dd></div>
        </dl>
        <form action="/" method="get"><button type="submit">接続状態を再確認 <span aria-hidden="true">↗</span></button></form>
      </section>
      <footer>OAPYS / Authorized security testing</footer>
    </main>
  );
}
