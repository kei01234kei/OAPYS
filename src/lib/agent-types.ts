// Types for the autonomous agent tasks surface. These mirror the backend
// contract documented in docs/security-api.md ("Agent task contract") and are
// kept read-only here: the frontend never bypasses the approval gate, it only
// displays tasks and relays an operator's explicit approve/deny decision.

export type AgentTaskStatus =
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type AgentStats = {
  plannerTurns: number;
  workerTurns: number;
  intents: number;
  facts: number;
  findings: number;
  toolCalls: number;
  approvals: number;
};

/** One node of the per-task exploration graph. */
export type AgentNode = {
  id: string;
  kind: "goal" | "intent" | "fact" | "finding" | "hint";
  title: string;
  detail?: string;
  assetId?: string;
  status?: string; // intents: pending/running/done/failed; findings: open
  createdAt: string;
};

export type AgentEdge = {
  source: string;
  target: string;
  relation: "spawns" | "derived_from" | "yields" | "proves";
};

/** One entry of the planner's shared todolist. */
export type TodoItem = {
  id: number;
  text: string;
  status: "pending" | "in_progress" | "done" | "blocked";
  intentId?: string;
};

/** A guard decision point: a tool call that needs explicit operator approval. */
export type ApprovalRequest = {
  id: string;
  tool: string;
  args: unknown;
  reason: string;
  status: "pending" | "approved" | "denied" | "expired";
  createdAt: string;
  expiresAt: string;
  decidedAt?: string;
};

/** One captured tool process cited by findings. */
export type AgentEvidence = {
  id: string;
  kind: "bash" | "http";
  label: string;
  intentId?: string;
  data: unknown;
  capturedAt: string;
};

/** One observable step of the run, shown live. */
export type ActivityEvent = {
  at: string;
  phase: "planner" | "worker" | "guard" | "tool" | "engine";
  status: "running" | "ok" | "warn" | "error" | "waiting_approval";
  label: string;
  detail?: string;
};

export type AgentTask = {
  id: string;
  goal: string;
  targetId: string;
  hostname: string;
  status: AgentTaskStatus;
  summary?: string;
  error?: string;
  approvalMode: "auto" | "strict";
  provider: string;
  model: string;
  createdAt: string;
  deadline: string;
  finishedAt?: string;
  nodes: AgentNode[];
  edges: AgentEdge[];
  todo: TodoItem[];
  evidence: AgentEvidence[];
  approvals: ApprovalRequest[];
  activity: ActivityEvent[];
  stats: AgentStats;
};

/** The list view of a task: no graph, evidence, or activity. */
export type AgentTaskSummary = {
  id: string;
  goal: string;
  hostname: string;
  status: AgentTaskStatus;
  summary?: string;
  error?: string;
  approvalMode: "auto" | "strict";
  pendingApprovals: number;
  createdAt: string;
  deadline: string;
  finishedAt?: string;
  stats: AgentStats;
};

/** True while the run can still act and accept approvals. */
export function isActiveStatus(status: AgentTaskStatus): boolean {
  return status === "running" || status === "paused";
}
