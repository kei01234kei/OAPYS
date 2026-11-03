// Contract for the backend's local model management (LM Studio + Hugging Face).
export type LocalModel = {
  key: string;
  displayName: string;
  publisher: string;
  type: "llm" | "embedding" | "decision" | string;
  format?: string;
  params?: string;
  quantization?: string;
  sizeBytes: number;
  maxContext?: number;
  toolUse: boolean;
  vision: boolean;
  loaded: boolean;
};
export type LocalSelection = {
  model: string;
  label: string;
  status: "loading" | "ready" | "failed";
  error?: string;
  at: string;
};
export type RuntimeState =
  | "connected"
  | "not_running"
  | "auth_required"
  | "outdated"
  | "error";
export type LocalModelsState = {
  enabled: boolean;
  reachable: boolean;
  state: RuntimeState;
  hasToken: boolean;
  canSaveToken: boolean;
  inDocker?: boolean;
  error?: string;
  models: LocalModel[];
  selection: LocalSelection | null;
  url?: string;
};
export type HubModel = {
  id: string;
  author: string;
  downloads: number;
  likes: number;
  lastModified?: string;
  pipeline?: string;
};
export type HubQuantization = {
  name: string;
  files: string[];
  sizeBytes: number;
};
export type DownloadJob = {
  id: string;
  repo: string;
  quantization: string;
  status: "downloading" | "paused" | "completed" | "failed";
  totalBytes: number;
  downloadedBytes: number;
  bytesPerSecond?: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
};
export type AIProvider = "lmstudio" | "anthropic" | "openai";
export type AIConfigState = {
  secretsAvailable: boolean;
  config?: {
    provider: AIProvider;
    model: string;
    label?: string;
    hasKey: boolean;
    keyHint?: string;
  };
  error?: string;
};
export type ProviderModel = { id: string; name?: string };
