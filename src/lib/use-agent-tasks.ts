"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { securityRequest } from "@/lib/security-request";
import {
  isActiveStatus,
  type AgentTask,
  type AgentTaskSummary,
} from "@/lib/agent-types";
import type { AIStatus } from "@/lib/investigation-types";
import { useMessages } from "@/components/locale-provider";
import { agentTasksMessages } from "@/i18n/agent-tasks";

/** Owns task list, selected task polling, and operator actions. */
export function useAgentTasks(live: boolean) {
  const t = useMessages(agentTasksMessages);
  const sessionVersion = useRef(0);
  const [info, setInfo] = useState<AIStatus | null>(null);
  const [tasks, setTasks] = useState<AgentTaskSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [task, setTask] = useState<AgentTask | null>(null);
  const [busy, setBusy] = useState(false);
  const [deciding, setDeciding] = useState<string | null>(null);
  const [error, setError] = useState("");

  const refreshList = useCallback(async () => {
    const version = sessionVersion.current;
    try {
      const data = await securityRequest<{ tasks: AgentTaskSummary[] }>(
        "agent/tasks",
      );
      if (version === sessionVersion.current) setTasks(data.tasks);
    } catch (e) {
      if (version === sessionVersion.current)
        setError(e instanceof Error ? e.message : t.errors.load);
    }
  }, [t]);

  // Initial load of AI status and the task list.
  useEffect(() => {
    if (!live) return;
    const version = sessionVersion.current;
    let active = true;
    Promise.all([
      securityRequest<AIStatus>("ai/status"),
      securityRequest<{ tasks: AgentTaskSummary[] }>("agent/tasks"),
    ])
      .then(([status, data]) => {
        if (active && version === sessionVersion.current) {
          setInfo(status);
          setTasks(data.tasks);
        }
      })
      .catch((e) => {
        if (active && version === sessionVersion.current)
          setError(e instanceof Error ? e.message : t.errors.load);
      });
    return () => {
      active = false;
    };
  }, [live, t]);

  // Load the selected task's detail once when the selection changes.
  useEffect(() => {
    if (!live || !selectedId) return;
    const version = sessionVersion.current;
    let active = true;
    securityRequest<AgentTask>(`agent/tasks/${selectedId}`)
      .then((data) => {
        if (active && version === sessionVersion.current) setTask(data);
      })
      .catch((e) => {
        if (active && version === sessionVersion.current)
          setError(e instanceof Error ? e.message : t.errors.detail);
      });
    return () => {
      active = false;
    };
  }, [live, selectedId, t]);

  // Poll the selected task every two seconds while it can still act.
  const activeTask = task && isActiveStatus(task.status);
  useEffect(() => {
    if (!live || !selectedId || !activeTask) return;
    const version = sessionVersion.current;
    let active = true,
      pending = false;
    const timer = setInterval(async () => {
      if (pending) return;
      pending = true;
      try {
        const [detail, list] = await Promise.all([
          securityRequest<AgentTask>(`agent/tasks/${selectedId}`),
          securityRequest<{ tasks: AgentTaskSummary[] }>("agent/tasks"),
        ]);
        if (active && version === sessionVersion.current) {
          setTask(detail);
          setTasks(list.tasks);
        }
      } catch (e) {
        if (active && version === sessionVersion.current)
          setError(e instanceof Error ? e.message : t.errors.detail);
      } finally {
        pending = false;
      }
    }, 2000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [live, selectedId, activeTask, t]);

  async function start(body: {
    goal: string;
    targetId: string;
    workers: number;
    deadlineMinutes: number;
  }) {
    const version = sessionVersion.current;
    setBusy(true);
    setError("");
    try {
      const created = await securityRequest<AgentTask>("agent/tasks", "POST", {
        ...body,
        authorized: true,
      });
      if (version !== sessionVersion.current) return;
      setTask(created);
      setSelectedId(created.id);
      void refreshList();
      return true;
    } catch (e) {
      if (version !== sessionVersion.current) return;
      setError(e instanceof Error ? e.message : t.errors.start);
      return false;
    } finally {
      if (version === sessionVersion.current) setBusy(false);
    }
  }

  async function control(action: "cancel" | "pause" | "resume") {
    if (!task) return;
    const version = sessionVersion.current;
    setBusy(true);
    try {
      await securityRequest(`agent/tasks/${task.id}/${action}`, "POST", {});
      if (version !== sessionVersion.current) return;
      const detail = await securityRequest<AgentTask>(`agent/tasks/${task.id}`);
      if (version === sessionVersion.current) {
        setTask(detail);
        void refreshList();
      }
    } catch (e) {
      if (version !== sessionVersion.current) return;
      setError(e instanceof Error ? e.message : t.errors.control);
    } finally {
      if (version === sessionVersion.current) setBusy(false);
    }
  }

  async function decide(approvalId: string, decision: "approve" | "deny") {
    if (!task) return;
    const version = sessionVersion.current;
    setDeciding(approvalId);
    setError("");
    try {
      await securityRequest(
        `agent/tasks/${task.id}/approvals/${approvalId}`,
        "POST",
        { decision },
      );
      if (version !== sessionVersion.current) return;
      const detail = await securityRequest<AgentTask>(`agent/tasks/${task.id}`);
      if (version === sessionVersion.current) setTask(detail);
    } catch (e) {
      if (version !== sessionVersion.current) return;
      setError(e instanceof Error ? e.message : t.errors.decide);
    } finally {
      if (version === sessionVersion.current) setDeciding(null);
    }
  }

  const runningCount = tasks.filter((x) => isActiveStatus(x.status)).length;

  return {
    info,
    tasks,
    selectedId,
    setSelectedId,
    task,
    busy,
    deciding,
    error,
    runningCount,
    start,
    control,
    decide,
  };
}
