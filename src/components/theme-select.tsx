"use client";

import { useSyncExternalStore } from "react";
import {
  getServerTheme,
  getTheme,
  setTheme,
  subscribeToTheme,
  type Theme,
} from "@/lib/theme";

export default function ThemeSelect() {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme);

  return (
    <label className="theme-select">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" />
      </svg>
      <span className="sr-only">表示モード</span>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value as Theme)}
      >
        <option value="system">OS に合わせる</option>
        <option value="light">ライト</option>
        <option value="dark">ダーク</option>
      </select>
    </label>
  );
}
