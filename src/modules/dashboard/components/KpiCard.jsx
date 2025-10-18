import React from "react";
import Sparkline from "./Sparkline";

export default function KpiCard({ label, value, deltaPct = 0, trend = [] }) {
  const up = deltaPct >= 0;
  return (
    <div className="card p-4 flex items-center justify-between gap-3">
      <div>
        <div className="text-sm text-muted">{label}</div>
        <div className="text-2xl font-semibold mt-1">
          {Intl.NumberFormat().format(value)}
        </div>
        <div
          className={`inline-flex items-center gap-1 text-xs mt-1 px-2 py-1 rounded-lg border
            ${
              up
                ? "text-success border-success/30 bg-success/10"
                : "text-danger border-danger/30 bg-danger/10"
            }
          `}
        >
          {up ? "▲" : "▼"} {Math.abs(deltaPct).toFixed(1)}%
        </div>
      </div>
      <div className="text-primary/80">
        <Sparkline data={trend} width={140} height={42} />
      </div>
    </div>
  );
}
