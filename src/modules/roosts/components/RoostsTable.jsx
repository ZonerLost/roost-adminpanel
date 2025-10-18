import React from "react";
import SkeletonRow from "./SkeletonRow";

function Badge({ children, tone = "default" }) {
  const map = {
    default: "badge",
    success: "badge bg-success/20 text-success border border-success/30",
    warning: "badge bg-warning/20 text-warning border border-warning/30",
    danger: "badge bg-danger/20 text-danger border border-danger/30",
  };
  return <span className={map[tone] || map.default}>{children}</span>;
}

function StatusBadge({ status }) {
  const tone =
    status === "active"
      ? "success"
      : status === "suspended"
      ? "warning"
      : "danger";
  return <Badge tone={tone}>{status}</Badge>;
}

export default function RoostsTable({
  loading,
  items,
  page,
  total,
  limit,
  onPrev,
  onNext,
  onEdit,
  onDelete,
}) {
  const hasPrev = page > 1;
  const hasNext = page * limit < total;

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr className="text-muted">
              <th className="px-4 py-3 font-medium">Cover</th>
              <th className="px-4 py-3 font-medium">Roost</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium">Members</th>
              <th className="px-4 py-3 font-medium">Visibility</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading &&
              items.map((r) => (
                <tr
                  key={r._id}
                  className="border-top border-border/60 align-top"
                >
                  <td className="px-4 py-3">
                    <img
                      src={r.cover}
                      alt={r.name}
                      className="h-10 w-16 rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted">/{r.slug || "—"}</div>
                    {r.owner?.name && (
                      <div className="text-[11px] mt-1">
                        Owner: <span className="badge">{r.owner.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize">{r.category}</td>
                  <td className="px-4 py-3">
                    {r.location?.city || r.location?.label || "—"}
                    {r.location?.country && (
                      <span className="text-xs text-muted">
                        , {r.location.country}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!r.tags?.length ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {r.tags.slice(0, 3).map((t) => (
                          <span key={t} className="badge">
                            {t}
                          </span>
                        ))}
                        {r.tags.length > 3 && (
                          <span className="badge bg-border/30 border text-muted">
                            +{r.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">{r.membersCount}</td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={r.visibility === "public" ? "success" : "warning"}
                    >
                      {r.visibility}
                    </Badge>
                    <span className="text-xs text-muted ml-1">
                      ({r.joinPolicy})
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button className="btn-ghost" onClick={() => onEdit(r)}>
                        Edit
                      </button>
                      <button className="btn-ghost" onClick={() => onDelete(r)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted">
                  No roosts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="sm:hidden p-3 space-y-3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} compact />
          ))}
        {!loading &&
          items.map((r) => (
            <div key={r._id} className="card p-3">
              <div className="flex items-start gap-3">
                <img
                  src={r.cover}
                  alt={r.name}
                  className="h-12 w-20 rounded object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted">/{r.slug || "—"}</div>
                    </div>
                    <div className="text-xs text-muted">{r.membersCount}</div>
                  </div>
                  <div className="mt-2 text-xs text-muted break-words">
                    {r.description || "—"}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                      <Badge
                        tone={r.visibility === "public" ? "success" : "warning"}
                      >
                        {r.visibility}
                      </Badge>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="inline-flex gap-2">
                      <button className="btn-ghost" onClick={() => onEdit(r)}>
                        Edit
                      </button>
                      <button className="btn-ghost" onClick={() => onDelete(r)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-xs text-muted">
          Page <span className="text-text">{page}</span> of{" "}
          <span className="text-text">
            {Math.max(1, Math.ceil(total / (limit || 1)))}
          </span>{" "}
          — {total} total
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" disabled={!hasPrev} onClick={onPrev}>
            Prev
          </button>
          <button className="btn-ghost" disabled={!hasNext} onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
