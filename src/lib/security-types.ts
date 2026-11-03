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
};
export type SecuritySnapshot = {
  assets: LiveAsset[];
  edges: LiveEdge[];
  findings: LiveFinding[];
  connections: CloudConnection[];
  targets: Target[];
  jobs: ScanJob[];
  audit: { at: string; actor: string; action: string; resource: string }[];
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
