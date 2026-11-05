# OAPYS Frontend Instructions

**English** | [日本語](AGENTS.ja.md)

## Scope

- OAPYS means Offensive Attack to Protect Your Systems. This repository is its public Next.js frontend.
- Keep this repository usable without private backend source or parent workspace files.
- Do not copy backend implementation details, credentials, or private operational data here. Share only the API contract required by frontend contributors.
- Commit from this repository's own Git root. Do not combine the frontend and private backend into one public repository.

## Languages

- Write default documentation in English and matching `name.ja.md` translations in Japanese. Update both together, including commands, implementation status, and links.
- `AGENTS.md` is the active instruction file; `AGENTS.ja.md` is its Japanese translation.
- Use English for identifiers, code comments, and development logs. Follow the user's language in conversation.
- The UI supports English and Japanese. It shows Japanese when the browser/OS top-priority language (`Accept-Language`) is Japanese, and English otherwise. Add user-visible text to both tables under `src/i18n/` with `defineMessages(en, ja)`; do not hard-code UI strings in components.

## Development

- Use Node.js 24, npm, Next.js App Router, and strict TypeScript. Follow the versions recorded in the repository.
- Install with `npm ci`; start with `npm run dev`. See [README.md](README.md).
- Keep `BACKEND_URL` and future credentials on the server. Never expose secrets through `NEXT_PUBLIC_*` variables.
- Every workspace page requires the admin session; `src/proxy.ts` redirects visitors without one to `/login`. After sign-in, keep the demo dataset available (shown by default until live data is registered, and reachable via the mode switch). Keep lint, typecheck, build, and public CI independent of private backend access.
- Prefer existing tools and small changes. Update `package-lock.json` with dependency changes.
- Keep `.env`, build artifacts, and local caches out of version control.
- `.codex/` contains shared Codex configuration; `.agents/` contains shared agent resources. Do not store credentials or machine-specific paths there. Preserve user-selected model and permission settings; do not change them as part of routine development.

## Verification

- After frontend code changes, run `npm run lint`, `npm run typecheck`, and `npm run build`.
- For documentation-only changes, check relative links, bilingual command parity, and `git diff --check`; application builds are unnecessary.
- Report checks and limitations accurately. A successful build does not establish successful server startup.

## Security boundary

- The UI integrates health checks, single-admin sessions, AWS/GCP inventory, DNS verification, and HTTP(S) probes through the API contract. Multi-tenant authentication is not implemented.
- The backend must enforce ownership verification and execution authorization. Frontend flags or hidden controls are not access controls.
