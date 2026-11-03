# OAPYS

**English** | [日本語](README.ja.md)

The public frontend for **Offensive Attack to Protect Your Systems**, built with Next.js App Router and TypeScript.
The backend is maintained in a separate private repository and is not included here.

## Local development

Use Node.js 24 and npm. `.node-version` and `.nvmrc` record the version used in the initial environment.

```sh
cp .env.example .env.local
npm ci
npm run dev
```

Open http://localhost:3000. The graph workspace works without the backend. Notifications show the backend connection status.
`GET /api/health` returns 200 when the backend is connected and 503 when it is unavailable.

```sh
npm run lint
npm run typecheck
npm run build
```

`BACKEND_URL` is used only by the Next.js server. Never put secrets in `NEXT_PUBLIC_*` variables.
The browser does not connect directly to the backend, so development CORS permissions are unnecessary.
In addition to health checks, administrator sessions, cloud connection/sync, DNS ownership verification, and HTTPS diagnostics are integrated through the API contract. Backend configuration and cloud permissions are required separately.

## Security graph workspace

The workspace is split into dedicated App Router pages with persistent sidebar navigation:

| URL | Page |
| --- | --- |
| `/` | Overview: metrics and up to five priority risks |
| `/assets` | Managed resources, check coverage, system topology, and resource details |
| `/risks` | Risk search, severity filters, and links to the affected assets |
| `/investigations` | AI questions, progress, reports, evidence, and history |
| `/settings` | Administrator sign-in, cloud connections, and diagnostic targets |

`/settings?tab=targets` opens diagnostic management directly. Asset links retain the asset, graph view, and detail tab in the URL. During client-side navigation, the shared layout retains the current environment, graph state, and AI investigation, including questions and ongoing progress. A full reload restores a valid administrator session and retrieves live inventory; saved investigation reports remain available through history. Risk-list filters are independent of graph filters.

The header's display mode selector offers **OS default**, **Light**, and **Dark**. The default follows the OS appearance, including changes while the page is open. Manual selections are saved in this browser and shared across tabs; choose OS default to resume automatic switching. The palette covers the workspace, graph, and connection dialogs.

The UI is available in English and Japanese. It uses Japanese when the top-priority language of the browser (which follows the OS language by default) is Japanese, and English otherwise. Messages live in `src/i18n/`. Text returned by the backend (errors, job events, AI output) is shown as received.

The Japanese UI calls servers, databases, storage, and similar resources **管理対象** (managed resources), and coverage **管理対象のチェック状況** (resource check status). The live **システム構成図** (system topology) shows configuration relationships returned by the API; it does not establish network reachability or successful exploitation. Fictional attack paths are labeled **攻撃経路（デモ）** (demo attack paths).

The UI provides two interactive views backed by a bundled fictional dataset:

- **Asset coverage graph**: asset topology across AWS and GCP, coverage status, severity filters, search, and asset details.
- **Exploration graph**: two illustrative attack paths connecting exposure, workloads, storage, and a database.
- Selectable nodes, pointer panning, zoom and fit controls, JSON export of the filtered graph, and risk rows that open the relevant path.

The demo's 11 nodes include the workspace, two cloud environments, and eight resources; seven resources are scanned (87.5%). The three prioritized scenarios are distinct from per-asset finding counts.

Switch to the live workspace to sign in, register/sync AWS and GCP connections, verify target DNS ownership, authorize HTTPS diagnostics, revoke approvals, and disconnect accounts. The live graph uses API assets, relationships, and findings, including evidence and remediation. Cloud secrets are not entered in the browser.

Set server-only `BACKEND_API_TOKEN` (32+ characters) and configure the same administrative credential on the backend. Actual AWS/GCP access requires backend roles/credentials and read permissions. The demo remains usable without configuration. See the [API contract](docs/security-api.md) for scope, authentication, endpoints, and coverage definitions.

## Docker (frontend only)

```sh
docker build -t oapys-frontend:dev .
docker run --rm -p 127.0.0.1:3000:3000 oapys-frontend:dev
```

The development Compose configuration for running both services is maintained in the private backend repository.
The public frontend can be developed without access to that repository.

## Dependencies

External network restrictions in the initial environment required pinning Next.js 16.2.6 and React 19.2.4 to versions available in the local cache.
Verification of the latest security updates remains pending. Before deploying to production, review official advisories in an environment with network access, update Next.js, React, and the runtime, and validate again.

```sh
npm install --save-exact next@latest react@latest react-dom@latest
npm install --save-dev --save-exact eslint-config-next@latest
npm audit
npm run lint
npm run typecheck
npm run build
```

References: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation) and [official security announcements](https://nextjs.org/blog).
An open-source license has not been selected yet. The owner should select one and add a LICENSE file before public distribution.

## Design guidelines

[DESIGN.md](DESIGN.md) defines OAPYS design guidance; [DESIGN.ja.md](DESIGN.ja.md) is its Japanese translation with the same machine-readable tokens.

Use restrained emerald accents, fine borders, clear typography, and structured product UI. The light surfaces and dark product/code panels are reference patterns; preserve the existing dark theme unless the UI task explicitly requests a theme change. These documents describe design guidance, not implemented features.

## Documentation languages

Agent workflow instructions are in [AGENTS.md](AGENTS.md). Shared Codex settings are in [`.codex/`](.codex/README.md), and agent resources are in [`.agents/`](.agents/README.md).

Use English for `README.md` and Japanese for `README.ja.md`. Update both versions together.
Use English for code identifiers, code comments, and development logs.

## AI-led investigation

Ask a question first, then inspect the evidence on the graph. The AI workspace supports investigation prompts, provider-configuration status, explicit data-sharing consent, progress, history, grounded reports, captured evidence, uncertainty, and graph focus. A model endpoint is configured separately by the backend operator; no provider is selected by default. See the [AI API contract](docs/security-api.md#ai-investigation-contract). The demo presents the workflow without invoking a model.
