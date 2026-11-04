"use client";

import { useCallback, useEffect, useState } from "react";
import { securityRequest } from "@/lib/security-request";
import type { AIStatus } from "@/lib/investigation-types";
import type {
  AIConfigState,
  AIProvider,
  ProviderModel,
} from "@/lib/local-model-types";
import { localModelMessages } from "@/i18n/local-models";
import { useMessages } from "@/components/locale-provider";
import LocalModelManager from "@/components/local-model-manager";

// Suggested IDs shown before the model list is fetched with a key.
const SUGGESTED: Partial<Record<AIProvider, string[]>> = {
  anthropic: ["claude-sonnet-5-5", "claude-opus-5-5", "claude-haiku-5-5"],
};

function fetchAIState() {
  return Promise.all([
    securityRequest<AIStatus>("ai/status"),
    securityRequest<AIConfigState>("ai/config"),
  ]);
}

// Settings tab for choosing where AI features run: a local LM Studio model,
// Claude, or OpenAI. This is the only place AI is configured; API keys are
// stored encrypted by the backend.
export default function AIProviderSettings() {
  const t = useMessages(localModelMessages);
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [config, setConfig] = useState<AIConfigState | null>(null);
  const [provider, setProvider] = useState<AIProvider | null>(null);
  const [error, setError] = useState("");

  const apply = useCallback(([s, c]: [AIStatus, AIConfigState]) => {
    setStatus(s);
    setConfig(c);
    setProvider((p) => p ?? c.config?.provider ?? "lmstudio");
  }, []);
  const reload = useCallback(() => fetchAIState().then(apply), [apply]);
  useEffect(() => {
    let active = true;
    fetchAIState()
      .then((state) => active && apply(state))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [apply]);

  const providers: { id: AIProvider; label: string }[] = [
    { id: "lmstudio", label: t.providerLocal },
    { id: "anthropic", label: t.providerAnthropic },
    { id: "openai", label: t.providerOpenAI },
  ];
  return (
    <div className="ai-provider-settings">
      <div className="ai-provider-head">
        <section>
          <h3>{t.activeTitle}</h3>
          {status?.configured ? (
            <div className="connection-card active">
              <div className="connection-card-heading">
                <strong>{status.label}</strong>
                <span className="connection-state connected">{t.inUse}</span>
              </div>
              <p className="local-model-key">{status.model}</p>
            </div>
          ) : (
            <div className="console-empty">
              {config?.error ? (
                <>
                  <strong>{t.configError}</strong>
                  <p>{config.error}</p>
                  <p>{t.configErrorHelp}</p>
                </>
              ) : (
                t.noActive
              )}
            </div>
          )}
        </section>
        <section>
          <h3>{t.providerTitle}</h3>
          <div
            className="ai-provider-choices"
            role="radiogroup"
            aria-label={t.providerTitle}
          >
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={provider === p.id}
                className={provider === p.id ? "active" : ""}
                onClick={() => setProvider(p.id)}
              >
                {p.label}
                {status?.provider === p.id && <small>{t.inUse}</small>}
              </button>
            ))}
          </div>
        </section>
      </div>
      {error && (
        <div className="console-error" role="alert">
          {error}
        </div>
      )}
      {provider === "lmstudio" && (
        <LocalModelManager status={status} onChanged={reload} />
      )}
      {provider && provider !== "lmstudio" && config && (
        <CloudProviderForm
          key={provider}
          provider={provider}
          config={config}
          onSaved={reload}
        />
      )}
    </div>
  );
}

function CloudProviderForm({
  provider,
  config,
  onSaved,
}: {
  provider: Exclude<AIProvider, "lmstudio">;
  config: AIConfigState;
  onSaved: () => Promise<void>;
}) {
  const t = useMessages(localModelMessages);
  const saved =
    config.config?.provider === provider ? config.config : undefined;
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(
    saved?.model ?? SUGGESTED[provider]?.[0] ?? "",
  );
  const [label, setLabel] = useState(saved?.label ?? "");
  const [models, setModels] = useState<ProviderModel[] | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"" | "models" | "save">("");
  const keySaved = !!saved?.hasKey;
  const needsKey = !keySaved;
  const body = () => ({ provider, apiKey: apiKey.trim() });

  async function run(kind: "models" | "save") {
    setBusy(kind);
    setError("");
    setMessage("");
    try {
      if (kind === "models") {
        const data = await securityRequest<{ models: ProviderModel[] }>(
          "ai/config/models",
          "POST",
          body(),
        );
        setModels(data.models);
        setMessage(t.modelsFound(data.models.length));
        if (!model && data.models[0]) setModel(data.models[0].id);
      } else {
        await securityRequest("ai/config", "POST", {
          ...body(),
          model: model.trim(),
          label: label.trim(),
        });
        setApiKey("");
        setMessage(t.saved);
        await onSaved();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("");
    }
  }

  const options = models?.map((m) => m.id) ?? SUGGESTED[provider] ?? [];
  const listId = `ai-models-${provider}`;
  return (
    <div className="console-body">
      <form
        className="connection-form"
        onSubmit={(e) => {
          e.preventDefault();
          void run("save");
        }}
      >
        <label>
          {t.apiKey}
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={
              keySaved
                ? saved?.keyHint
                : provider === "anthropic"
                  ? t.apiKeyPlaceholderAnthropic
                  : t.apiKeyPlaceholderOpenAI
            }
            required={needsKey}
            maxLength={500}
          />
        </label>
        {keySaved && saved?.keyHint && (
          <p className="local-model-hint">{t.apiKeySaved(saved.keyHint)}</p>
        )}
        <button
          type="button"
          className="secondary-button"
          disabled={!!busy || (needsKey && !apiKey.trim())}
          onClick={() => void run("models")}
        >
          {busy === "models" ? t.fetchingModels : t.fetchModels}
        </button>
        <label className="ai-provider-model">
          {t.model}
          <input
            list={listId}
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={t.modelPlaceholder}
            required
            maxLength={200}
          />
          <datalist id={listId}>
            {options.map((id) => (
              <option key={id} value={id} />
            ))}
          </datalist>
        </label>
        <label>
          {t.label}
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={100}
          />
        </label>
        {message && <p className="ai-provider-ok">{message}</p>}
        {error && (
          <div className="console-error" role="alert">
            {error}
          </div>
        )}
        <button
          className="primary-button"
          disabled={!!busy || (!config.secretsAvailable && !!apiKey.trim())}
        >
          {busy === "save" ? t.saving : t.save}
        </button>
      </form>
      <div className="console-list">
        <p className="console-hint">
          {provider === "anthropic" ? t.keyHelpAnthropic : t.keyHelpOpenAI}
        </p>
        <p className="local-model-warn">{t.externalNotice}</p>
        <p className="local-model-hint">
          {config.secretsAvailable ? t.keyStorage : t.secretsUnavailable}
        </p>
      </div>
    </div>
  );
}
