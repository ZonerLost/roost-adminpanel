import React from "react";

// Minimal shim for framer-motion's AnimatePresence used in this project.
// This renders children directly without animation so the UI works without
// the external framer-motion library. Replace with real framer-motion if
// you add the dependency later.
export function AnimatePresence({ children }) {
  return <>{children}</>;
}

export default { AnimatePresence };
