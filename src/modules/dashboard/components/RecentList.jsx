import React from "react";

export function RecentUsers({ items = [] }) {
  return (
    <div className="card p-4">
      <div className="font-medium mb-2">Recent Users</div>
      <ul className="divide-y divide-border/60">
        {items.length === 0 && (
          <li className="py-4 text-sm text-muted">No recent users.</li>
        )}
        {items.map((u) => (
          <li
            key={u.id}
            className="py-3 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{u.name}</div>
              <div className="text-xs text-muted truncate">{u.email}</div>
            </div>
            <div className="text-xs text-muted text-right">
              <div>{u.city || "—"}</div>
              <div>Joined {u.joinedAt}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function UpcomingEvents({ items = [] }) {
  return (
    <div className="card p-4">
      <div className="font-medium mb-2">Upcoming Events</div>
      <ul className="divide-y divide-border/60">
        {items.length === 0 && (
          <li className="py-4 text-sm text-muted">No upcoming events.</li>
        )}
        {items.map((e) => (
          <li key={e.id} className="py-3">
            <div className="text-sm font-medium">{e.title}</div>
            <div className="text-xs text-muted">
              {e.when} • {e.mode} {e.city && `• ${e.city}`}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
