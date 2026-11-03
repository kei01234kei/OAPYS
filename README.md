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

Open http://localhost:3000. The page works without the backend and displays a disconnected status.
`GET /api/health` returns 200 when the backend is connected and 503 when it is unavailable.

```sh
npm run lint
npm run typecheck
npm run build
```

`BACKEND_URL` is used only by the Next.js server. Never put secrets in `NEXT_PUBLIC_*` variables.
The browser does not connect directly to the backend, so development CORS permissions are unnecessary.
Only health checks are implemented at this stage. Authentication, domain verification, and security testing are not implemented yet.

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

## Documentation languages

Agent workflow instructions are in [AGENTS.md](AGENTS.md). Shared Codex settings are in [`.codex/`](.codex/README.md), and agent resources are in [`.agents/`](.agents/README.md).

Use English for `README.md` and Japanese for `README.ja.md`. Update both versions together.
Use English for code identifiers, code comments, and development logs.
