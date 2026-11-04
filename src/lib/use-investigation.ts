"use client";

import { useEffect, useRef, useState } from "react";
import { securityRequest } from "@/lib/security-request";
import type { AIStatus, Investigation } from "@/lib/investigation-types";
import { useMessages } from "@/components/locale-provider";
import { investigationMessages } from "@/i18n/investigation-workspace";

export function useInvestigation(
  live: boolean,
  selectedAsset?: { id: string; name: string },
) {
  const t = useMessages(investigationMessages);
  const sessionVersion = useRef(0);
  const [info, setInfo] = useState<AIStatus | null>(null);
  const [history, setHistory] = useState<Investigation[]>([]);
  const [run, setRun] = useState<Investigation | null>(null);
  const [question, setQuestion] = useState(t.questions[0]);
  const [shareData, setShareData] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [openedEvidence, setOpenedEvidence] = useState<string | null>(null);
  const running = run?.status === "running";
  const runID = run?.id;
  const runStatus = run?.status;
  useEffect(() => {
    if (!live) return;
    const version = sessionVersion.current;
    let active = true;
    Promise.all([
      securityRequest<AIStatus>("ai/status"),
      securityRequest<{ investigations: Investigation[] }>("investigations"),
    ])
      .then(([status, records]) => {
        if (active && version === sessionVersion.current) {
          setInfo(status);
          setHistory(records.investigations);
        }
      })
      .catch((e) => {
        if (active && version === sessionVersion.current) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [live]);
  useEffect(() => {
    if (!live || !runID || runStatus !== "running") return;
    const version = sessionVersion.current;
    let active = true,
      pending = false;
    const timer = setInterval(async () => {
      if (pending) return;
      pending = true;
      try {
        const current = await securityRequest<Investigation>(
          `investigations/${runID}`,
        );
        if (active && version === sessionVersion.current) {
          setRun(current);
        }
      } catch (e) {
        if (active && version === sessionVersion.current)
          setError(e instanceof Error ? e.message : t.errors.status);
      } finally {
        pending = false;
      }
    }, 2000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [live, runID, runStatus, t]);
  useEffect(() => {
    if (!live || !runID || runStatus === "running") return;
    const version = sessionVersion.current;
    let active = true;
    securityRequest<{ investigations: Investigation[] }>("investigations")
      .then((records) => {
        if (active && version === sessionVersion.current)
          setHistory(records.investigations);
      })
      .catch((e) => {
        if (active && version === sessionVersion.current)
          setError(e instanceof Error ? e.message : t.errors.history);
      });
    return () => {
      active = false;
    };
  }, [live, runID, runStatus, t]);
  async function start() {
    const version = sessionVersion.current;
    setBusy(true);
    setError("");
    setOpenedEvidence(null);
    try {
      const current = await securityRequest<Investigation>(
        "investigations",
        "POST",
        { question, assetId: selectedAsset?.id ?? "", shareData },
      );
      if (version !== sessionVersion.current) return;
      setRun(current);
      setShareData(false);
    } catch (e) {
      if (version !== sessionVersion.current) return;
      setError(e instanceof Error ? e.message : t.errors.start);
    } finally {
      if (version === sessionVersion.current) setBusy(false);
    }
  }
  async function load(id: string) {
    const version = sessionVersion.current;
    setBusy(true);
    setError("");
    setOpenedEvidence(null);
    try {
      const current = await securityRequest<Investigation>(
        `investigations/${id}`,
      );
      if (version === sessionVersion.current) setRun(current);
    } catch (e) {
      if (version !== sessionVersion.current) return;
      setError(e instanceof Error ? e.message : t.errors.load);
    } finally {
      if (version === sessionVersion.current) setBusy(false);
    }
  }
  async function cancel() {
    if (!run) return;
    const version = sessionVersion.current;
    setBusy(true);
    try {
      await securityRequest(`investigations/${run.id}/cancel`, "POST", {});
      if (version !== sessionVersion.current) return;
      const current = await securityRequest<Investigation>(
        `investigations/${run.id}`,
      );
      if (version === sessionVersion.current) setRun(current);
    } catch (e) {
      if (version !== sessionVersion.current) return;
      setError(e instanceof Error ? e.message : t.errors.cancel);
    } finally {
      if (version === sessionVersion.current) setBusy(false);
    }
  }
  function evidenceAssets(ids: string[]) {
    return [
      ...new Set(
        run?.evidence
          .filter((e) => ids.includes(e.id))
          .flatMap((e) => e.assetIds) ?? [],
      ),
    ];
  }
  const selectedEvidence = run?.evidence.find((e) => e.id === openedEvidence);
  function reset() {
    sessionVersion.current += 1;
    setBusy(false);
    setInfo(null);
    setHistory([]);
    setRun(null);
    setShareData(false);
    setError("");
    setOpenedEvidence(null);
  }
  return {
    info,
    history,
    run,
    question,
    setQuestion,
    shareData,
    setShareData,
    busy,
    error,
    setOpenedEvidence,
    running,
    start,
    load,
    cancel,
    evidenceAssets,
    selectedEvidence,
    reset,
  };
}
