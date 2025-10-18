import React from "react";

export default function SkeletonBlock({ lines = 3 }) {
  return (
    <div className="card p-4 animate-pulse">
      <div className="h-4 w-40 bg-white/10 rounded mb-2" />
      <div className="h-3 w-64 bg-white/10 rounded mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-10 w-full bg-white/10 rounded mb-2" />
      ))}
      <div className="h-9 w-28 bg-white/10 rounded ml-auto" />
    </div>
  );
}
