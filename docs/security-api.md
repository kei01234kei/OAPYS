# Security workspace API contract

**English** | [日本語](security-api.ja.md)

The frontend integrates with an independently deployed backend. Configure server-only `BACKEND_URL` and `BACKEND_API_TOKEN` (at least 32 characters). Never prefix credentials with `NEXT_PUBLIC_`. The backend operator must configure the same administrative bearer credential and cloud access separately. This initial contract serves one administrator and one workspace; multi-tenant accounts and hosted sign-up are not implemented.

Browser requests use `/api/security/…`. Sign in using `POST /api/security/session` with `{ "token": "…" }`. A successful response sets an HttpOnly, SameSite=Strict, eight-hour session cookie; HTTPS also sets Secure. `GET` reports configuration/session state and `DELETE` logs out. Mutations require a matching Origin. Login is limited to five attempts per minute per Next.js process. The server forwards the backend bearer credential only after verifying the session. Read and write responses are not cached.

The backend endpoints below live under `/api/v1`. The Next.js proxy allows only these paths and methods. IDs are opaque 48-character hexadecimal strings.

| Method | Path | Request / result |
| --- | --- | --- |
| GET | `/snapshot` | `assets`, `edges`, `findings`, `connections`, `targets`, `jobs`, `audit` arrays |
| POST | `/connections` | `name`, `provider` (`AWS`/`GCP`), `region`, `roleArn`, `projectId`; returns connection, including server-issued AWS `externalId` |
| POST | `/connections/{id}/sync` | `{}`; 202, asynchronous status in snapshot |
| DELETE | `/connections/{id}` | Disconnect and remove collected graph data; does not remove cloud resources |
| POST | `/targets` | `hostname`; returns `target`, `recordName`, `recordValue`. A duplicate hostname returns 409 |
| GET | `/targets/{id}/challenge` | Redisplays `target`, `recordName`, `recordValue`. Only when the backend has `OAPYS_DNS_CHALLENGE_KEY` and the stored hash matches; otherwise 409 (revoke and register again) |
| POST | `/targets/{id}/verify` | `{}`; returns `verifiedUntil` after backend DNS ownership checks |
| DELETE | `/targets/{id}` | Revoke approval, cancel execution, remove target graph data |
| POST | `/jobs` | `targetId`, `authorized: true`, optional `engine` (`ai`/`rule`), `scheme` (`http`/`https`, default `https`), `method` (default `GET`), `path` (default `/`), `port` (default 443 for https, 80 for http); 202 after backend scope and fresh ownership checks |

A failed operation returns `{ "error": "…" }` with a non-2xx status. The client polls the snapshot every four seconds while displaying live data. A connection transitions from `pending` to `syncing` and then `connected` or `error`. Jobs are `running`, `completed`, `failed`, or `cancelled`.

Assets include `id`, `name`, `kind`, `provider`, `region`, optional `connectionId`, `targetId`, and `checkedAt`. Edges include `source`, `target`, `relation`. Findings include `id`, `assetId`, `severity`, `rule`, `title`, `evidence`, `remediation`, `detectedAt`. Targets expose challenge/approval expiration but never the token hash. Cloud credentials are never returned in a snapshot.

The coverage denominator is every resource except organization/cloud account containers, including public IP and network nodes that are inventoried but have no implemented check. A resource is checked only when `checkedAt` is present. This measures implemented check coverage, not protection from all vulnerabilities. Live findings display severity without inventing CVSS scores. A failed refresh clears the displayed live snapshot; a failed cloud sync retains the previous inventory and its timestamps, while the connection shows the failure.

Demo and live datasets are separate. Live Exploration graph shows observed configuration relationships within two hops of the selected asset. It does not generate speculative attack paths or establish effective reachability. Initial connectors cover AWS EC2/security groups and GCP Compute/classic VPC firewall rules, not every cloud service. HTTP(S) probes send one configurable request (scheme, method, path, port; defaults `https GET /` on 443) to an ownership-verified exact hostname that may resolve to a public or internal address, following redirects up to 10 hops. Checks cover certificate and selected response-header items, and known vulnerabilities are enumerated non-intrusively by matching versions observed in response banners (`Server`, `X-Powered-By`) against a local CVE feed. Matching reads only the already-collected observation and sends no additional traffic to the target; a match flags a known-vulnerable version rather than proving exploitability. Backend authorization remains authoritative even for direct API requests.

## AI investigation contract

All AI routes require the same administrator session and mutation Origin checks:

| Method | Browser path | Result |
| --- | --- | --- |
| GET | `/api/security/ai/status` | `configured`, `label`, `model`, optional `reason`, `provider` (`lmstudio`/`anthropic`/`openai`); no credentials or endpoint URL |
| GET | `/api/security/ai/config` | Saved AI provider (`provider`, `model`, `label`, `hasKey`, `keyHint` = last 4 characters). The API key is never returned |
| POST | `/api/security/ai/config` | `{provider: "anthropic"\|"openai", model, apiKey?, label?}`. An empty `apiKey` keeps the saved key for the same provider. Requests go only to the official endpoints. Keys are encrypted on the backend |
| POST | `/api/security/ai/config/models` | `{provider, apiKey?}` → `{models: [{id, name?}]}`; also a key/connection test |
| GET | `/api/security/ai/local/models` | LM Studio status: `enabled`, `reachable`, `state` (`connected`/`not_running`/`auth_required`/`outdated`/`error`), `url`, `hasToken`, `canSaveToken`, `inDocker`, `models` (downloaded), `selection` (`loading`/`ready`/`failed`) |
| POST | `/api/security/ai/local/runtime` | `{url?, token?, clearToken?}`: change the LM Studio origin (this machine over HTTP, or HTTPS) and/or save (encrypted) or remove its API token. Empty fields keep the current value |
| POST | `/api/security/ai/local/detect` | Probe the current origin and the backend's fixed candidates (ports 1234–1239 on the host) and switch to the first LM Studio found; returns the same body as `ai/local/models` |
| GET | `/api/security/ai/local/search?q=` | Hugging Face GGUF chat-model repositories, most downloaded first |
| GET | `/api/security/ai/local/files?repo=owner/name` | GGUF quantizations with total size (shards grouped) |
| GET/POST | `/api/security/ai/local/downloads` | List downloads with progress / start `{repo, quantization}` through LM Studio |
| POST | `/api/security/ai/local/select` | `{model}`: load a downloaded LLM in LM Studio, then use it for AI (202, poll `ai/local/models`) |
| GET | `/api/security/investigations` | Newest 20 `investigations` summaries |
| POST | `/api/security/investigations` | `question`, optional `assetId`, `shareData: true`; returns 202 with run |
| GET | `/api/security/investigations/{id}` | Run status, captured evidence, tool steps, optional report/error |
| POST | `/api/security/investigations/{id}/cancel` | `{}`; cancels the active run and retains history |

A run has `id`, `question`, `assetId`, `status` (`running`, `completed`, `failed`, `cancelled`), `provider`, `model`, `createdAt`, `snapshotAt`, `deadline`, optional `finishedAt`, `steps`, `evidence`, and optional `report`/`error`. The report contains `title`, `summary`, `observations`, `unknowns`, `nextSteps`, `graphAssetIds`. Each observation includes `title`, `explanation`, `basis` (`observed` or `inferred`), `evidenceIds`, and `recommendation`. Evidence includes an opaque `id`, `kind`, `resourceId`, `assetIds`, `label`, captured `data`, and `capturedAt`. Reference integrity is checked by the service; semantic truth is not guaranteed by a matching citation.

The UI polls a running investigation every two seconds. It displays provider configuration status, obtains data-sharing consent for each run, shows AI interpretation and uncertainty, and can highlight cited assets in the graph. Captured evidence remains readable after assets disappear; graph focus is restricted to assets still present. Demo mode explains the workflow and makes no model call. AI endpoints cannot run diagnostics, access arbitrary URLs, or change cloud resources. Provider/model selection and secrets remain server-side; compatible protocol support is required.

## Agent task contract

All agent routes require the same administrator session and mutation Origin checks:

| Method | Browser path | Result |
| --- | --- | --- |
| GET | `/api/security/agent/tasks` | `tasks`: newest-first summaries (`id`, `goal`, `hostname`, `status`, optional `summary`/`error`, `approvalMode`, `pendingApprovals`, timestamps, `stats`) |
| POST | `/api/security/agent/tasks` | `goal` (3–2000 bytes), `targetId`, `authorized: true`, optional `approvalMode` (`auto`/`strict`; accepted but no gating is performed), `workers` (1–8), `deadlineMinutes` (5–10080); 202 with the task. Requires a configured AI model and fresh DNS ownership verification of the target |
| GET | `/api/security/agent/tasks/{id}` | Full task: exploration graph `nodes`/`edges`, shared `todo`, captured `evidence`, `approvals`, live `activity`, `stats` |
| POST | `/api/security/agent/tasks/{id}/cancel` | `{}`; cancels the run |
| POST | `/api/security/agent/tasks/{id}/pause` / `resume` | `{}`; freezes progress between model turns and tool calls |
| GET | `/api/security/agent/tasks/{id}/approvals` | `approvals`, newest first (50) |
| POST | `/api/security/agent/tasks/{id}/approvals/{approvalId}` | `{ "decision": "approve" \| "deny" }`; 409 when unknown or already decided |

A task has `id`, `goal`, `targetId`, `hostname`, `status` (`running`, `paused`, `completed`, `failed`, `cancelled`), optional `summary`/`error`, `approvalMode`, `provider`, `model`, `createdAt`, `deadline`, optional `finishedAt`, and the per-task exploration graph: `nodes` (kind `goal`/`intent`/`fact`/`finding`; intents carry status `pending`/`running`/`done`/`failed`; nodes may anchor an `assetId`), `edges` (`spawns`/`derived_from`/`yields`/`proves`), the shared `todo`, captured `evidence` (opaque `id`, kind `bash`/`http`, bounded `data`), `approvals` (kept for compatibility; no pending requests are created anymore), live `activity`, and `stats`.

The backend runs a planner agent (the only intent producer, maintaining the shared todolist) and worker agents that execute real tools directly: every call runs without per-call approval, gated only by the DNS ownership check revalidated before each execution. At most four tasks run concurrently per workspace (429 otherwise). Findings reported by workers appear in snapshot `findings` with `source: "agent"` anchored to an asset, and the snapshot includes `agentTasks` summaries for polling. The UI should poll a running task every two seconds; revoking the target cancels its tasks.
