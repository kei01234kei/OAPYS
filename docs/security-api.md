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
| POST | `/targets` | `hostname`; returns `target`, `recordName`, `recordValue`; DNS challenge value appears only in this response |
| POST | `/targets/{id}/verify` | `{}`; returns `verifiedUntil` after backend DNS ownership checks |
| DELETE | `/targets/{id}` | Revoke approval, cancel execution, remove target graph data |
| POST | `/jobs` | `targetId`, `authorized: true`; 202 after backend scope and fresh ownership checks |

A failed operation returns `{ "error": "…" }` with a non-2xx status. The client polls the snapshot every four seconds while displaying live data. A connection transitions from `pending` to `syncing` and then `connected` or `error`. Jobs are `running`, `completed`, `failed`, or `cancelled`.

Assets include `id`, `name`, `kind`, `provider`, `region`, optional `connectionId`, `targetId`, and `checkedAt`. Edges include `source`, `target`, `relation`. Findings include `id`, `assetId`, `severity`, `rule`, `title`, `evidence`, `remediation`, `detectedAt`. Targets expose challenge/approval expiration but never the token hash. Cloud credentials are never returned in a snapshot.

The coverage denominator is every resource except organization/cloud account containers, including public IP and network nodes that are inventoried but have no implemented check. A resource is checked only when `checkedAt` is present. This measures implemented check coverage, not protection from all vulnerabilities. Live findings display severity without inventing CVSS scores. A failed refresh clears the displayed live snapshot; a failed cloud sync retains the previous inventory and its timestamps, while the connection shows the failure.

Demo and live datasets are separate. Live Exploration graph shows observed configuration relationships within two hops of the selected asset. It does not generate speculative attack paths or establish effective reachability. Initial connectors cover AWS EC2/security groups and GCP Compute/classic VPC firewall rules, not every cloud service. HTTPS diagnostics cover certificate and selected response-header checks on ownership-verified exact hostnames; they do not enumerate CVEs or exploit systems. Backend authorization remains authoritative even for direct API requests.

## AI investigation contract

All AI routes require the same administrator session and mutation Origin checks:

| Method | Browser path | Result |
| --- | --- | --- |
| GET | `/api/security/ai/status` | `configured`, `label`, `model`, optional `reason`; no credentials or endpoint URL |
| GET | `/api/security/investigations` | Newest 20 `investigations` summaries |
| POST | `/api/security/investigations` | `question`, optional `assetId`, `shareData: true`; returns 202 with run |
| GET | `/api/security/investigations/{id}` | Run status, captured evidence, tool steps, optional report/error |
| POST | `/api/security/investigations/{id}/cancel` | `{}`; cancels the active run and retains history |

A run has `id`, `question`, `assetId`, `status` (`running`, `completed`, `failed`, `cancelled`), `provider`, `model`, `createdAt`, `snapshotAt`, `deadline`, optional `finishedAt`, `steps`, `evidence`, and optional `report`/`error`. The report contains `title`, `summary`, `observations`, `unknowns`, `nextSteps`, `graphAssetIds`. Each observation includes `title`, `explanation`, `basis` (`observed` or `inferred`), `evidenceIds`, and `recommendation`. Evidence includes an opaque `id`, `kind`, `resourceId`, `assetIds`, `label`, captured `data`, and `capturedAt`. Reference integrity is checked by the service; semantic truth is not guaranteed by a matching citation.

The UI polls a running investigation every two seconds. It displays provider configuration status, obtains data-sharing consent for each run, shows AI interpretation and uncertainty, and can highlight cited assets in the graph. Captured evidence remains readable after assets disappear; graph focus is restricted to assets still present. Demo mode explains the workflow and makes no model call. AI endpoints cannot run diagnostics, access arbitrary URLs, or change cloud resources. Provider/model selection and secrets remain server-side; compatible protocol support is required.
