"use client";

import { useCallback, useEffect, useState } from "react";
import { securityRequest } from "@/lib/security-request";
import type { AIStatus } from "@/lib/investigation-types";
import type {
  DownloadJob,
  HubModel,
  HubQuantization,
  LocalModel,
  LocalModelsState,
} from "@/lib/local-model-types";
import { localModelMessages } from "@/i18n/local-models";
import { useLocale, useMessages } from "@/components/locale-provider";
import { intlLocale } from "@/lib/i18n";
import LMStudioConnection from "@/components/lm-studio-connection";

function formatBytes(bytes: number) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes,
    unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit++;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}
function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  if (seconds < 90) return `${Math.ceil(seconds)}s`;
  if (seconds < 5400) return `${Math.ceil(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}
const RECOMMENDED = "Q4_K_M";

// Settings tab that lets the administrator search Hugging Face for GGUF
// models, download them through LM Studio, and choose one for AI features.
export default function LocalModelManager({
  status,
  onChanged,
}: {
  status: AIStatus | null;
  onChanged: () => Promise<void>;
}) {
  const t = useMessages(localModelMessages);
  const numberLocale = intlLocale(useLocale());
  const count = (n: number) =>
    new Intl.NumberFormat(numberLocale, { notation: "compact" }).format(n);
  const [state, setState] = useState<LocalModelsState | null>(null);
  const [downloads, setDownloads] = useState<DownloadJob[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HubModel[] | null>(null);
  const [resultsFor, setResultsFor] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [opened, setOpened] = useState<string | null>(null);
  const [quants, setQuants] = useState<Record<string, HubQuantization[]>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const models = await securityRequest<LocalModelsState>("ai/local/models");
    setState(models);
    if (models.state === "connected") {
      const list = await securityRequest<{ downloads: DownloadJob[] }>(
        "ai/local/downloads",
      );
      setDownloads(list.downloads ?? []);
    }
  }, []);
  const search = useCallback(async (q: string) => {
    setSearching(true);
    setError("");
    try {
      const data = await securityRequest<{ models: HubModel[] }>(
        `ai/local/search?q=${encodeURIComponent(q)}`,
      );
      setResults(data.models);
      setResultsFor(q);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      securityRequest<LocalModelsState>("ai/local/models"),
      // Hugging Face being unreachable must not hide the installed models.
      securityRequest<{ models: HubModel[] }>("ai/local/search?q=").catch(
        (e: Error) => {
          if (active) setError(e.message);
          return { models: [] as HubModel[] };
        },
      ),
    ])
      .then(async ([first, popular]) => {
        if (!active) return;
        setResults(popular.models);
        setResultsFor("");
        // LM Studio may listen on another port; look for it once.
        const models =
          first.state === "not_running"
            ? await securityRequest<LocalModelsState>(
                "ai/local/detect",
                "POST",
                {},
              ).catch(() => first)
            : first;
        if (!active) return;
        setState(models);
        if (models.state === "connected") {
          const list = await securityRequest<{ downloads: DownloadJob[] }>(
            "ai/local/downloads",
          );
          if (active) setDownloads(list.downloads ?? []);
        }
      })
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, []);

  // Poll while a download runs or a selected model is loading into memory.
  const pending =
    downloads.some((d) => d.status === "downloading") ||
    state?.selection?.status === "loading";
  const selectionStatus = state?.selection?.status;
  useEffect(() => {
    if (selectionStatus === "ready" || selectionStatus === "failed")
      void onChanged().catch(() => {});
  }, [selectionStatus, onChanged]);
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => {
      refresh().catch(() => {});
    }, 2000);
    return () => clearInterval(timer);
  }, [pending, refresh]);
  // Until LM Studio answers, keep checking so starting it is noticed.
  const waiting = !!state && state.enabled && state.state !== "connected";
  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(() => {
      refresh().catch(() => {});
    }, 3000);
    return () => clearInterval(timer);
  }, [waiting, refresh]);
  const applyRuntime = useCallback(
    async (next: LocalModelsState) => {
      setState(next);
      if (next.state === "connected") await refresh();
      await onChanged();
    },
    [refresh, onChanged],
  );

  async function act(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  async function toggleRepo(repo: string) {
    if (opened === repo) {
      setOpened(null);
      return;
    }
    setOpened(repo);
    if (quants[repo]) return;
    try {
      const data = await securityRequest<{ quantizations: HubQuantization[] }>(
        `ai/local/files?repo=${encodeURIComponent(repo)}`,
      );
      setQuants((q) => ({ ...q, [repo]: data.quantizations }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setOpened(null);
    }
  }

  const enabled = !!state?.enabled;
  const reachable = state?.state === "connected";
  const selection = state?.selection ?? null;
  const llms = (state?.models ?? []).filter((m) => m.type === "llm");
  const others = (state?.models ?? []).filter((m) => m.type !== "llm");
  const activeKey = status?.configured ? status.model : "";
  const activeLocal = status?.provider === "lmstudio";
  const jobFor = (repo: string, quant: string) =>
    downloads
      .slice()
      .reverse()
      .find((d) => d.repo === repo && d.quantization === quant);

  function modelCard(m: LocalModel) {
    const active = m.key === activeKey && activeLocal;
    const loading =
      selection?.model === m.key && selection.status === "loading";
    const failed = selection?.model === m.key && selection.status === "failed";
    return (
      <article
        className={`connection-card local-model-card${active ? " active" : ""}`}
        key={m.key}
      >
        <div className="connection-card-heading">
          <strong>{m.displayName}</strong>
          {active && (
            <span className="connection-state connected">{t.inUse}</span>
          )}
          {loading && (
            <span className="connection-state running">{t.loadingModel}</span>
          )}
        </div>
        <p className="local-model-key">{m.key}</p>
        <div className="local-model-tags">
          {m.params && <span>{m.params}</span>}
          {m.quantization && <span>{m.quantization}</span>}
          <span>{formatBytes(m.sizeBytes)}</span>
          {m.toolUse && <span className="good">{t.toolUse}</span>}
          {m.vision && <span>{t.vision}</span>}
          {m.loaded && <span className="good">{t.loaded}</span>}
        </div>
        {!m.toolUse && <p className="local-model-warn">{t.noToolUse}</p>}
        {failed && (
          <p className="connection-error">
            {t.loadFailed}: {selection.error}
          </p>
        )}
        {!active && (
          <div className="connection-actions">
            <button
              disabled={
                busy || !reachable || loading || selection?.status === "loading"
              }
              onClick={() =>
                void act(async () => {
                  await securityRequest("ai/local/select", "POST", {
                    model: m.key,
                  });
                  await refresh();
                })
              }
            >
              {loading ? t.loadingModel : t.use}
            </button>
          </div>
        )}
      </article>
    );
  }

  return (
    <>
      <LMStudioConnection state={state} onState={applyRuntime} />
      <div className="console-body local-models">
        <div>
          <form
            className="connection-form"
            onSubmit={(e) => {
              e.preventDefault();
              void search(query.trim());
            }}
          >
            <h3>{t.searchTitle}</h3>
            <label>
              {t.searchLabel}
              <span className="local-model-search">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  maxLength={100}
                  disabled={!enabled}
                />
                <button
                  className="primary-button"
                  disabled={!enabled || searching}
                >
                  {searching ? t.searching : t.search}
                </button>
              </span>
            </label>
          </form>
          {error && (
            <div className="console-error" role="alert">
              {error}
            </div>
          )}
          {results && (
            <div className="local-model-results">
              {resultsFor === "" && <h3>{t.popular}</h3>}
              {results.length === 0 && (
                <p className="console-empty">{t.noResults}</p>
              )}
              {results.map((m) => (
                <div className="local-model-repo" key={m.id}>
                  <button
                    type="button"
                    className="local-model-repo-row"
                    aria-expanded={opened === m.id}
                    onClick={() => void toggleRepo(m.id)}
                  >
                    <span>
                      <strong>{m.id.split("/")[1]}</strong>
                      <small>{m.author}</small>
                    </span>
                    <small>
                      {t.downloadsCount(count(m.downloads))} ·{" "}
                      {t.likes(count(m.likes))}
                    </small>
                  </button>
                  {opened === m.id && (
                    <div className="local-model-quants">
                      {!quants[m.id] && <p>{t.loadingFiles}</p>}
                      {quants[m.id]?.length === 0 && <p>{t.noFiles}</p>}
                      {quants[m.id]?.map((q) => {
                        const job = jobFor(m.id, q.name);
                        const percent =
                          job && job.totalBytes
                            ? Math.min(
                                100,
                                Math.round(
                                  (job.downloadedBytes / job.totalBytes) * 100,
                                ),
                              )
                            : 0;
                        return (
                          <div className="local-model-quant" key={q.name}>
                            <span>
                              <code>{q.name}</code>
                              {q.name === RECOMMENDED && (
                                <em>{t.recommended}</em>
                              )}
                            </span>
                            <span>{formatBytes(q.sizeBytes)}</span>
                            {job?.status === "downloading" ? (
                              <span className="local-model-progress">
                                <span style={{ width: `${percent}%` }} />
                                <small>{percent}%</small>
                              </span>
                            ) : job?.status === "completed" ? (
                              <span className="connection-state completed">
                                {t.downloaded}
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={busy || !reachable}
                                onClick={() =>
                                  void act(async () => {
                                    await securityRequest(
                                      "ai/local/downloads",
                                      "POST",
                                      { repo: m.id, quantization: q.name },
                                    );
                                    await refresh();
                                  })
                                }
                              >
                                {job?.status === "failed"
                                  ? t.failed + " · "
                                  : ""}
                                {t.download}
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {!!quants[m.id]?.length && (
                        <p className="local-model-hint">{t.quantHint}</p>
                      )}
                      <a
                        href={`https://huggingface.co/${m.id}`}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {t.openOnHub} ↗
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="console-list">
          {downloads.length > 0 && (
            <>
              <h3>{t.downloadsTitle}</h3>
              {downloads
                .slice()
                .reverse()
                .map((d) => {
                  const percent = d.totalBytes
                    ? Math.min(
                        100,
                        Math.round((d.downloadedBytes / d.totalBytes) * 100),
                      )
                    : 0;
                  const left =
                    d.status === "downloading" && d.bytesPerSecond
                      ? formatDuration(
                          (d.totalBytes - d.downloadedBytes) / d.bytesPerSecond,
                        )
                      : "";
                  return (
                    <div className="job-row local-download" key={d.id}>
                      <div>
                        <strong>{d.repo}</strong>
                        <small>
                          {d.quantization} · {formatBytes(d.downloadedBytes)} /{" "}
                          {formatBytes(d.totalBytes)}
                          {left && ` · ${t.remaining(left)}`}
                        </small>
                      </div>
                      <span
                        className={`connection-state ${d.status === "downloading" ? "running" : d.status}`}
                      >
                        {d.status === "downloading"
                          ? `${percent}%`
                          : d.status === "completed"
                            ? t.downloaded
                            : d.status === "paused"
                              ? t.paused
                              : t.failed}
                      </span>
                      {d.status === "downloading" && (
                        <span className="local-model-progress wide">
                          <span style={{ width: `${percent}%` }} />
                        </span>
                      )}
                      {d.error && <p>{d.error}</p>}
                    </div>
                  );
                })}
            </>
          )}
          <h3>{t.installedTitle}</h3>
          {reachable && llms.length === 0 && (
            <p className="console-empty">{t.noInstalled}</p>
          )}
          {llms.map(modelCard)}
          {others.length > 0 && (
            <p className="local-model-hint">
              {t.embeddingNote} ({others.map((m) => m.displayName).join(", ")})
            </p>
          )}
          <p className="console-hint">{t.privacy}</p>
        </div>
      </div>
    </>
  );
}
