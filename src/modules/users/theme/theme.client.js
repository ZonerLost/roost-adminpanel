const KEY = "__theme__";

export function getSavedTheme() {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return stored;
    // fallback to OS preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  } catch (e) {
    // If access to localStorage fails (e.g., privacy mode), default to light
    console.error("getSavedTheme error:", e);
    return "light";
  }
}

export function applyTheme(theme = "light") {
  try {
    // Determine the active color (light/dark) when 'system' is selected
    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    )?.matches;
    const active =
      theme === "system" ? (prefersDark ? "dark" : "light") : theme;

    document.documentElement.dataset.theme = active;
    if (active === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    // store the selected preference (may be 'system'|'light'|'dark')
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {
      // ignore storage errors but log for debugging
      console.error("applyTheme storage error:", e);
    }
  } catch (e) {
    // Log unexpected errors to aid debugging
    console.error("applyTheme error:", e);
  }
}
