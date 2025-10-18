import React, { useEffect } from "react";

/**
 * App wrapper applies saved theme ("light" | "dark" | "system")
 * and hosts global providers if you add them later.
 * Use in main.jsx to wrap <RouterProvider />.
 */
export default function App({ children }) {
  useEffect(() => {
    const stored = localStorage.getItem("__theme__") || "system";
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const apply = (mode) => {
      let active = mode;
      if (mode === "system") active = mq?.matches ? "dark" : "light";
      document.documentElement.classList.toggle("dark", active === "dark");
      // set dataset to the active color so CSS can scope by [data-theme]
      document.documentElement.dataset.theme = active;
    };
    apply(stored);
    // keep in sync with system changes if user chose "system"
    const handler = () => {
      if ((localStorage.getItem("__theme__") || "system") === "system") {
        apply("system");
      }
    };
    mq?.addEventListener?.("change", handler);
    return () => mq?.removeEventListener?.("change", handler);
  }, []);

  return <div className="app-shell">{children}</div>;
}
