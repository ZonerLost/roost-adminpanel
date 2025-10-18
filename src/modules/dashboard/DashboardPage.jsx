import React, { useEffect, useState } from "react";
import { getDashboard } from "./api/dashboard.service";
import KpiCard from "./components/KpiCard";
import SkeletonKpi from "./components/SkeletonKpi";
import DistributionBar from "./components/DistributionBar";
import { RecentUsers, UpcomingEvents } from "./components/RecentList";
import Sparkline from "./components/Sparkline";

const RANGES = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
];

export default function DashboardPage() {
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await getDashboard({ range });
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const kpis = data?.kpis || [];
  const trends = data?.trends || {};
  const distribution = data?.distribution || [];
  const recent = data?.recent || { users: [], events: [] };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="inline-flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.key}
              className={`px-3 h-9 rounded-lg border text-sm
                ${
                  range === r.key
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border"
                }
              `}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonKpi key={i} />)
          : kpis.map((k) => (
              <KpiCard
                key={k.key}
                label={k.label}
                value={k.value}
                deltaPct={k.deltaPct}
                trend={k.trend}
              />
            ))}
      </div>

      {/* Activity + Distribution + Lists */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activity trend */}
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Active Users (daily)</div>
            <div className="text-xs text-muted">{range.toUpperCase()}</div>
          </div>
          <div className="text-primary/80">
            {!loading ? (
              <Sparkline
                data={(trends.activeUsersDaily || []).map((d) => d.v)}
                width={800}
                height={160}
              />
            ) : (
              <div className="h-40 bg-white/10 animate-pulse rounded" />
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <DistributionBar data={distribution} />
      </div>

      {/* Recent activity lists */}
      <div className="grid gap-4 lg:grid-cols-3">
        <RecentUsers items={recent.users} />
        <UpcomingEvents items={recent.events} />
        <div className="card p-4">
          <div className="font-medium mb-2">System</div>
          <ul className="text-sm space-y-2">
            <li>
              <span className="badge">messages</span> in last 24h: <b>865</b>
            </li>
            <li>
              <span className="badge">reports</span> open: <b>7</b>
            </li>
            <li className="text-xs text-muted mt-2">
              * Numbers shown are mock unless API is configured.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
