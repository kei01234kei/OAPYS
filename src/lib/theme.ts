export type Theme = "system" | "light" | "dark";

const storageKey = "oapys-theme";
const changeEvent = "oapys-theme-change";

function isTheme(value: unknown): value is Theme {
  return value === "system" || value === "light" || value === "dark";
}

// Run before first paint; CSS handles OS changes while the system mode is selected.
export const themeInitScript = `(() => {
  let theme = "system";
  try {
    const saved = localStorage.getItem("${storageKey}");
    if (saved === "light" || saved === "dark") theme = saved;
  } catch {}
  document.documentElement.dataset.theme = theme;
})();`;

export function getTheme(): Theme {
  const theme = document.documentElement.dataset.theme;
  return isTheme(theme) ? theme : "system";
}

export function getServerTheme(): Theme {
  return "system";
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Keep the selection usable when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function subscribeToTheme(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key !== storageKey && event.key !== null) return;
    document.documentElement.dataset.theme = isTheme(event.newValue)
      ? event.newValue
      : "system";
    onChange();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, onChange);
  };
}
