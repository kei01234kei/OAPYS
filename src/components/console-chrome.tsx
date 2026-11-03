"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { useMessages } from "@/components/locale-provider";
import { consoleChromeMessages, type LogLevel } from "@/i18n/console-chrome";
import { useModal } from "@/lib/use-modal";
import { setTheme } from "@/lib/theme";
import type { SecuritySnapshot } from "@/lib/security-types";

export type PaletteNavItem = { href: string; label: string; key: string };

type Command = {
  id: string;
  group: "navigate" | "actions" | "appearance";
  label: string;
  hint?: string;
  run: () => void;
};

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

const noSubscribe = () => () => {};
function usePlatformKey() {
  return useSyncExternalStore(
    noSubscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl"),
    () => "⌘",
  );
}

/** ⌘K command palette plus `g <key>` navigation shortcuts. */
export function CommandPalette({
  navigation,
  live,
  onToggleMode,
  onConnectCloud,
  onManageDiagnosis,
}: {
  navigation: PaletteNavItem[];
  live: boolean;
  onToggleMode: () => void;
  onConnectCloud: () => void;
  onManageDiagnosis: () => void;
}) {
  const t = useMessages(consoleChromeMessages);
  const router = useRouter();
  const mod = usePlatformKey();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useModal(dialog, open);

  const commands = useMemo<Command[]>(
    () => [
      ...navigation.map((item) => ({
        id: `nav-${item.href}`,
        group: "navigate" as const,
        label: item.label,
        hint: `g ${item.key}`,
        run: () => router.push(item.href),
      })),
      {
        id: "connect",
        group: "actions",
        label: t.commands.connectCloud,
        run: onConnectCloud,
      },
      {
        id: "diagnosis",
        group: "actions",
        label: t.commands.manageDiagnosis,
        run: onManageDiagnosis,
      },
      {
        id: "mode",
        group: "actions",
        label: live ? t.commands.switchToDemo : t.commands.switchToLive,
        run: onToggleMode,
      },
      {
        id: "theme-system",
        group: "appearance",
        label: t.commands.themeSystem,
        run: () => setTheme("system"),
      },
      {
        id: "theme-light",
        group: "appearance",
        label: t.commands.themeLight,
        run: () => setTheme("light"),
      },
      {
        id: "theme-dark",
        group: "appearance",
        label: t.commands.themeDark,
        run: () => setTheme("dark"),
      },
    ],
    [navigation, live, t, router, onToggleMode, onConnectCloud, onManageDiagnosis],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.hint ?? ""} ${c.id}`.toLowerCase().includes(q),
    );
  }, [commands, query]);

  function close() {
    setOpen(false);
    setQuery("");
    setIndex(0);
  }
  function runCommand(command: Command | undefined) {
    if (!command) return;
    close();
    command.run();
  }

  useEffect(() => {
    let pendingG = 0;
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((value) => !value);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (document.querySelector("[aria-modal='true']")) return;
      if (e.key === "g") {
        pendingG = Date.now();
        return;
      }
      if (Date.now() - pendingG < 1200) {
        const item = navigation.find((n) => n.key === e.key);
        pendingG = 0;
        if (item) {
          e.preventDefault();
          router.push(item.href);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigation, router]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  const groups = (["navigate", "actions", "appearance"] as const)
    .map((group) => ({
      group,
      items: results.filter((c) => c.group === group),
    }))
    .filter((g) => g.items.length);
  const activeId = results[Math.min(index, results.length - 1)]?.id;

  return (
    <>
      <button
        type="button"
        className="palette-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span className="palette-prompt" aria-hidden="true">
          &gt;
        </span>
        <span className="palette-trigger-label">{t.openPalette}</span>
        <kbd>
          {mod} K
        </kbd>
      </button>
      {open && (
        <div className="palette-backdrop" onMouseDown={close}>
          <div
            ref={dialog}
            tabIndex={-1}
            className="palette"
            role="dialog"
            aria-modal="true"
            aria-label={t.paletteLabel}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                close();
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => (results.length ? (i + 1) % results.length : 0));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) =>
                  results.length ? (i - 1 + results.length) % results.length : 0,
                );
              } else if (e.key === "Enter") {
                e.preventDefault();
                runCommand(results.find((c) => c.id === activeId));
              } else if (e.key === "Tab") {
                e.preventDefault();
                input.current?.focus();
              }
            }}
          >
            <div className="palette-input">
              <span className="palette-prompt" aria-hidden="true">
                &gt;
              </span>
              <input
                ref={input}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                placeholder={t.palettePlaceholder}
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={activeId ? `cmd-${activeId}` : undefined}
                spellCheck={false}
                autoComplete="off"
              />
              <kbd>esc</kbd>
            </div>
            <div id="palette-list" className="palette-list" role="listbox">
              {groups.length === 0 && (
                <p className="palette-empty">{t.noResults}</p>
              )}
              {groups.map(({ group, items }) => (
                <div key={group} role="group" aria-label={t.groups[group]}>
                  <div className="palette-group">{t.groups[group]}</div>
                  {items.map((c) => (
                    <div
                      key={c.id}
                      id={`cmd-${c.id}`}
                      role="option"
                      aria-selected={c.id === activeId}
                      className={`palette-item ${c.id === activeId ? "active" : ""}`}
                      onMouseMove={() =>
                        setIndex(results.findIndex((r) => r.id === c.id))
                      }
                      onClick={() => runCommand(c)}
                    >
                      <span>{c.label}</span>
                      {c.hint && <kbd>{c.hint}</kbd>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="palette-footer" aria-hidden="true">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> {t.hints.navigate}
              </span>
              <span>
                <kbd>↵</kbd> {t.hints.run}
              </span>
              <span>
                <kbd>esc</kbd> {t.hints.close}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function subscribeSeconds(onChange: () => void) {
  const timer = setInterval(onChange, 1000);
  return () => clearInterval(timer);
}
function useClock() {
  const seconds = useSyncExternalStore(
    subscribeSeconds,
    () => Math.floor(Date.now() / 1000),
    () => null,
  );
  return seconds === null ? null : new Date(seconds * 1000);
}

/** Measures the app's own health endpoint; it never contacts the backend directly. */
function useHealth(initial: boolean) {
  const [state, setState] = useState<{ ok: boolean | null; ms: number | null }>(
    { ok: initial, ms: null },
  );
  useEffect(() => {
    let active = true;
    async function probe() {
      if (document.visibilityState !== "visible") return;
      const start = performance.now();
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (active)
          setState({ ok: res.ok, ms: Math.round(performance.now() - start) });
      } catch {
        if (active) setState({ ok: false, ms: null });
      }
    }
    void probe();
    const timer = setInterval(() => void probe(), 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  return state;
}

/** IDE-style status bar pinned to the bottom of the workspace. */
export function StatusBar({
  healthy,
  live,
  findings,
  snapshot,
}: {
  healthy: boolean;
  live: boolean;
  findings: number;
  snapshot: SecuritySnapshot | null;
}) {
  const t = useMessages(consoleChromeMessages).status;
  const now = useClock();
  const health = useHealth(healthy);
  const running = live
    ? (snapshot?.jobs.filter((j) => j.status === "running").length ?? 0)
    : 0;
  const backendState =
    health.ok === null ? t.checking : health.ok ? t.online : t.offline;
  return (
    <footer className="status-bar" aria-label={t.label}>
      <span className={`status-mode ${live ? "live" : "demo"}`}>
        {live ? "LIVE" : "DEMO"}
      </span>
      <span className={`status-item ${health.ok ? "ok" : "bad"}`}>
        <i aria-hidden="true" />
        {t.backend}: {backendState}
      </span>
      {health.ms !== null && (
        <span className="status-item status-hide-sm">
          {t.latency} {health.ms}ms
        </span>
      )}
      <span className="status-item status-hide-sm">
        {findings} {t.findings}
      </span>
      <span className={`status-item ${running ? "running" : ""}`}>
        {running ? `${running} ${t.jobs}` : t.idle}
      </span>
      <span className="status-spacer" />
      <span className="status-item status-hide-sm">oapys@workspace</span>
      <time
        className="status-item"
        dateTime={now?.toISOString()}
        suppressHydrationWarning
      >
        {now ? `${now.toISOString().slice(11, 19)} UTC` : "--:--:-- UTC"}
      </time>
    </footer>
  );
}

type LogLine = { id: string; at: string; level: LogLevel; tag: string; text: string };

function liveLines(snapshot: SecuritySnapshot | null): LogLine[] {
  if (!snapshot) return [];
  const lines: LogLine[] = [];
  for (const job of snapshot.jobs) {
    for (const [i, ev] of (job.events ?? []).entries()) {
      lines.push({
        id: `${job.id}-${i}`,
        at: ev.at,
        level: ev.status === "running" ? "run" : ev.status,
        tag: ev.phase,
        text: `${job.hostname} ${ev.label}${ev.detail ? ` — ${ev.detail}` : ""}`,
      });
    }
  }
  for (const [i, a] of snapshot.audit.entries()) {
    lines.push({
      id: `audit-${i}-${a.at}`,
      at: a.at,
      level: "info",
      tag: "audit",
      text: `${a.actor} ${a.action} ${a.resource}`,
    });
  }
  return lines.sort((a, b) => a.at.localeCompare(b.at)).slice(-40);
}

function stamp(at: string) {
  const d = new Date(at);
  return Number.isNaN(d.getTime()) ? "--:--:--" : d.toISOString().slice(11, 19);
}

/** Terminal-style activity stream. Demo mode replays a scripted, clearly labelled scan. */
export function ActivityLog({
  live,
  snapshot,
}: {
  live: boolean;
  snapshot: SecuritySnapshot | null;
}) {
  const t = useMessages(consoleChromeMessages);
  const total = t.demoLog.length;
  // Demo replay position; null until mounted so server and client markup match.
  const [demo, setDemo] = useState<{ start: number; count: number } | null>(
    null,
  );
  const [paused, setPaused] = useState(false);
  const body = useRef<HTMLOListElement>(null);
  const demoCount = demo?.count ?? 0;
  const demoStart = demo?.start ?? null;

  useEffect(() => {
    if (live || paused) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced && demoCount >= total) return;
    // Replay the scripted scan one line at a time, pause, then loop.
    const done = demoCount >= total;
    const delay =
      demoCount === 0 ? 0 : done ? 6000 : 900 + (demoCount % 3) * 350;
    const timer = setTimeout(() => {
      if (reduced) setDemo({ start: Date.now(), count: total });
      else if (demoCount === 0 || done) setDemo({ start: Date.now(), count: 1 });
      else setDemo((d) => d && { ...d, count: d.count + 1 });
    }, delay);
    return () => clearTimeout(timer);
  }, [live, paused, demoCount, total]);

  const lines: LogLine[] = live
    ? liveLines(snapshot)
    : t.demoLog.slice(0, demoCount).map(([level, tag, text], i) => ({
        id: `demo-${i}`,
        at: new Date((demoStart ?? 0) + i * 1100).toISOString(),
        level,
        tag,
        text,
      }));

  useEffect(() => {
    const el = body.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length]);

  return (
    <section className="activity-log" aria-labelledby="activity-log-title">
      <header className="activity-log-head">
        <div className="activity-log-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <h2 id="activity-log-title">{t.log.title}</h2>
        <span className="activity-log-note">
          {live ? t.log.liveNote : t.log.demoNote}
        </span>
        {!live && (
          <button
            type="button"
            className="text-button activity-log-toggle"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
          >
            {paused ? t.log.resume : t.log.pause}
          </button>
        )}
      </header>
      <ol ref={body} className="activity-log-body" aria-live="off">
        {lines.length === 0 && <li className="log-empty">{t.log.empty}</li>}
        {lines.map((line) => (
          <li key={line.id} className={`log-line ${line.level}`}>
            <time dateTime={line.at} suppressHydrationWarning>
              {demoStart || live ? stamp(line.at) : "--:--:--"}
            </time>
            <span className="log-level">{line.level.toUpperCase()}</span>
            <span className="log-tag">{line.tag}</span>
            <span className="log-text">{line.text}</span>
          </li>
        ))}
        <li className="log-cursor" aria-hidden="true">
          <span className="palette-prompt">$</span>
          <span className="cursor-block" />
        </li>
      </ol>
    </section>
  );
}
