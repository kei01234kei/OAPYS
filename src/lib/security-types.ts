export type LiveAsset = {
  id: string;
  name: string;
  kind: string;
  provider: string;
  region: string;
  connectionId?: string;
  targetId?: string;
  checkedAt?: string;
};
export type LiveEdge = { source: string; target: string; relation: string };
export type LiveFinding = {
  id: string;
  assetId: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  evidence: string;
  remediation: string;
  rule: string;
  detectedAt: string;
  /** "ai" when judged by the configured model, "rule" for fixed rules. */
  source?: "ai" | "rule";
  model?: string;
};
export type CloudConnection = {
  id: string;
  name: string;
  provider: string;
  region: string;
  roleArn: string;
  projectId?: string;
  externalId: string;
  accountId?: string;
  status: string;
  error?: string;
  lastSync?: string;
};
export type Target = {
  id: string;
  hostname: string;
  challengeExpires: string;
  verifiedUntil: string;
};
export type ScanJob = {
  id: string;
  targetId: string;
  hostname: string;
  status: string;
  error?: string;
  scope: string;
  createdAt: string;
  deadline: string;
  finishedAt?: string;
  /** Judgment used: "ai" (default when a model is configured) or "rule". */
  engine?: "ai" | "rule";
  /** Explains a fallback, e.g. AI judgment failed and rules were used. */
  notice?: string;
  /** Live trace of what the diagnosis contacted, in order. */
  events?: JobEvent[];
  /** System configuration seen during the diagnosis. */
  observation?: Observation;
};
export type JobPhase =
  "authorize" | "resolve" | "connect" | "tls" | "http" | "judge" | "save";
export type JobEvent = {
  at: string;
  phase: JobPhase;
  status: "running" | "ok" | "warn" | "error";
  label: string;
  detail?: string;
  /** Structured facts (addresses, certificate, headers, finding ids). */
  data?: Record<string, string>;
};
export type Observation = {
  hostname: string;
  observedAt: string;
  certificateError?: string;
  addresses?: string[];
  connectedAddress?: string;
  statusCode?: number;
  tlsVersion?: string;
  cipherSuite?: string;
  certificate?: {
    subject: string;
    issuer: string;
    notBefore: string;
    notAfter: string;
    dnsNames?: string[];
  };
  headers?: Record<string, string[]>;
};
export type SecuritySnapshot = {
  assets: LiveAsset[];
  edges: LiveEdge[];
  findings: LiveFinding[];
  connections: CloudConnection[];
  targets: Target[];
  jobs: ScanJob[];
  /** Attack-path history per target; absent on older backends. */
  exploits?: Exploit[];
  audit: { at: string; actor: string; action: string; resource: string }[];
};
/** One hypothesised attack path, tracked across diagnoses of a target. */
export type Exploit = {
  id: string;
  targetId: string;
  hostname: string;
  rule: string;
  title: string;
  severity: LiveFinding["severity"];
  source?: "ai" | "rule";
  model?: string;
  status: "open" | "resolved";
  firstSeen: string;
  lastSeen: string;
  resolvedAt?: string;
  firstJobId: string;
  lastJobId: string;
  detections: number;
};
export async function securityRequest<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/security/${path}`, {
    method,
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "操作に失敗しました。");
  return data as T;
}
