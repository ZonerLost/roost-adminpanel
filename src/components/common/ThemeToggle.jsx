import React, { useEffect, useState } from "react";

const KEY = "__theme__";

function applyMode(mode) {
  try {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    let active = mode;
    if (mode === "system") active = mq?.matches ? "dark" : "light";
    document.documentElement.classList.toggle("dark", active === "dark");
    // expose the active color so CSS selectors can target [data-theme="dark"]
    document.documentElement.dataset.theme = active;
    localStorage.setItem(KEY, mode);
  } catch (e) {
    // Log unexpected errors when applying theme to aid debugging
    // (avoid leaving the catch block empty to satisfy linting rules)
    console.error(e);
  }
}

export default function ThemeToggle({ value, onChange, className = "" }) {
  const [mode, setMode] = useState(() => localStorage.getItem(KEY) || "system");

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  useEffect(() => {
    if (!value) return;
    // If incoming value is 'system' but user already has an explicit saved
    // preference in localStorage (light/dark), don't override it when
    // opening the settings page. This avoids flipping themes unexpectedly.
    try {
      const stored = localStorage.getItem(KEY);
      if (value === "system" && stored && stored !== "system") return;
    } catch {
      // ignore storage errors
    }
    if (value !== mode) setMode(value);
  }, [value, mode]);

  function toggleSimple() {
    const next =
      mode === "dark" ? "light" : mode === "light" ? "system" : "dark";
    setMode(next);
    onChange?.(next);
  }

  if (onChange || value) {
    return (
      <div className={`inline-flex gap-2 ${className}`}>
        <button
          className={`px-3 h-9 rounded-lg ${
            mode === "light" ? "bg-primary/10" : ""
          }`}
          onClick={() => {
            setMode("light");
            onChange?.("light");
          }}
        >
          Light
        </button>
        <button
          className={`px-3 h-9 rounded-lg ${
            mode === "dark" ? "bg-primary/10" : ""
          }`}
          onClick={() => {
            setMode("dark");
            onChange?.("dark");
          }}
        >
          Dark
        </button>
        <button
          className={`px-3 h-9 rounded-lg ${
            mode === "system" ? "bg-primary/10" : ""
          }`}
          onClick={() => {
            setMode("system");
            onChange?.("system");
          }}
        >
          System
        </button>
      </div>
    );
  }

  return (
    <button
      className={`btn-ghost h-9 px-3 rounded-xl ${className}`}
      onClick={toggleSimple}
      title={`Theme: ${mode}`}
    >
      {mode === "dark" ? "🌞 Light" : "🌙 Dark"}
    </button>
  );
}
