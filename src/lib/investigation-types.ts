export type AIStatus = {
  configured: boolean;
  label: string;
  model: string;
  reason?: string;
  provider?: "lmstudio" | "anthropic" | "openai";
};
export type InvestigationEvidence = {
  id: string;
  kind: string;
  resourceId: string;
  assetIds: string[];
  label: string;
  data: Record<string, unknown>;
  capturedAt: string;
};
export type InvestigationObservation = {
  title: string;
  explanation: string;
  basis: "observed" | "inferred";
  evidenceIds: string[];
  recommendation: string;
};
export type InvestigationReport = {
  title: string;
  summary: string;
  observations: InvestigationObservation[];
  unknowns: string[];
  nextSteps: string[];
  graphAssetIds: string[];
};
export type Investigation = {
  id: string;
  question: string;
  assetId?: string;
  status: "running" | "completed" | "failed" | "cancelled";
  error?: string;
  provider: string;
  model: string;
  createdAt: string;
  snapshotAt: string;
  deadline: string;
  finishedAt?: string;
  steps: { tool: string; label: string; at: string; evidenceIds: string[] }[];
  evidence: InvestigationEvidence[];
  report?: InvestigationReport;
};
