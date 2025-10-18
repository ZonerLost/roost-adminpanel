import React from "react";

export default function SkeletonKpi() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="h-3 w-24 bg-white/10 rounded" />
      <div className="h-7 w-28 bg-white/10 rounded mt-2" />
      <div className="h-5 w-16 bg-white/10 rounded mt-2" />
      <div className="h-10 w-full bg-white/10 rounded mt-3" />
    </div>
  );
}
