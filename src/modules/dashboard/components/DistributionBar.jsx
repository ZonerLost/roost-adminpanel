import React from "react";

/**
 * Stacked percentage bar for categories
 * data: [{label, pct}]
 */
export default function DistributionBar({ data = [] }) {
  const total = data.reduce((n, x) => n + (x.pct || 0), 0) || 1;
  return (
    <div className="card p-4">
      <div className="font-medium mb-2">Interest Categories</div>
      <div className="h-3 w-full rounded-full overflow-hidden bg-border/60">
        <div className="w-full h-full flex">
          {data.map((d, i) => (
            <div
              key={d.label}
              className="h-full"
              style={{
                width: `${(d.pct / total) * 100}%`,
                background: `linear-gradient(90deg, hsl(${
                  (i * 47) % 360
                } 60% 40%), hsl(${(i * 47 + 30) % 360} 60% 50%))`,
                minWidth: 6,
              }}
              title={`${d.label}: ${d.pct}%`}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {data.map((d, i) => (
          <span
            key={d.label}
            className="badge"
            style={{
              background: `hsl(${(i * 47) % 360} 70% 8%)`,
              borderColor: `hsl(${(i * 47) % 360} 70% 12%)`,
              color: `hsl(${(i * 47) % 360} 40% 80%)`,
            }}
          >
            {d.label} • {d.pct}%
          </span>
        ))}
      </div>
    </div>
  );
}
