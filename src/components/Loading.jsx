import React from "react";

// Simple Loading fallback used by Suspense in router
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      <div className="ml-4 text-muted">Loading…</div>
    </div>
  );
}
