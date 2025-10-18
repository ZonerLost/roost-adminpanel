import React from "react";
import SkeletonRow from "./SkeletonRow";

function StatusBadge({ status }) {
  const map = {
    active: "bg-success/20 text-success border border-success/30",
    suspended: "bg-warning/20 text-warning border border-warning/30",
    deleted: "bg-danger/20 text-danger border border-danger/30",
  };
  return (
    <span className={`badge capitalize ${map[status] || ""}`}>{status}</span>
  );
}

function RoostsCell({ created = [], joined = [] }) {
  const topCreated = (created || [])
    .slice(0, 2)
    .map((r) => r.name)
    .filter(Boolean);
  const topJoined = (joined || [])
    .slice(0, 2)
    .map((r) => r.name)
    .filter(Boolean);
  const totalShown = topCreated.length + topJoined.length;
  const remaining = created.length + joined.length - totalShown;

  return (
    <div className="space-y-1">
      <div className="text-xs text-muted">
        <span className="badge">C: {created.length}</span>{" "}
        <span className="badge">J: {joined.length}</span>
      </div>
      {(topCreated.length > 0 || topJoined.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {topCreated.map((n) => (
            <span key={`c-${n}`} className="badge">
              {n}
            </span>
          ))}
          {topJoined.map((n) => (
            <span
              key={`j-${n}`}
              className="badge bg-border/30 border text-muted"
            >
              {n}
            </span>
          ))}
          {remaining > 0 && (
            <span className="badge bg-border/30 border text-muted">
              +{remaining}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function UsersTable({
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
      {/* Desktop / tablet table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr className="text-muted">
              <th className="px-4 py-3 font-medium">Avatar</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Age/Gender</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Languages</th>
              <th className="px-4 py-3 font-medium">Roosts</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading &&
              items.map((u) => {
                const age = u.dob
                  ? Math.max(
                      0,
                      Math.floor(
                        (Date.now() - new Date(u.dob)) /
                          (365.25 * 24 * 3600 * 1000)
                      )
                    )
                  : "—";
                return (
                  <tr key={u._id} className="border-top border-border/60">
                    <td className="px-4 py-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted">{u.email}</div>
                      <div className="text-xs text-muted mt-1 line-clamp-1">
                        {u.bio || "—"}
                      </div>
                      {u.interests?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {u.interests.slice(0, 4).map((t) => (
                            <span key={t} className="badge">
                              {t}
                            </span>
                          ))}
                          {u.interests.length > 4 && (
                            <span className="badge bg-border/30 text-muted border">
                              +{u.interests.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {age} / {u.gender}
                    </td>
                    <td className="px-4 py-3">
                      {u.location || "—"}
                      {u.distanceMiles != null && (
                        <span className="text-xs text-muted">
                          {" "}
                          • {u.distanceMiles}&nbsp;mi
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!u.languages?.length ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {u.languages.slice(0, 3).map((l) => (
                            <span key={l} className="badge">
                              {l}
                            </span>
                          ))}
                          {u.languages.length > 3 && (
                            <span className="badge bg-border/30 text-muted border">
                              +{u.languages.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RoostsCell
                        created={u.roostsCreated}
                        joined={u.roostsJoined}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.accountStatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button className="btn-ghost" onClick={() => onEdit(u)}>
                          Edit
                        </button>
                        <button
                          className="btn-ghost"
                          onClick={() => onDelete(u)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="sm:hidden space-y-3 p-3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} compact />
          ))}
        {!loading &&
          items.map((u) => (
            <div key={u._id} className="card p-3 touch-none">
              <div className="flex items-start gap-3">
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted">{u.email}</div>
                    </div>
                    <div className="text-xs text-muted text-right">
                      {u.location || "—"}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted break-words">
                    {u.bio || "—"}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-2">
                      <StatusBadge status={u.accountStatus} />
                    </div>
                    <div className="inline-flex gap-2">
                      <button className="btn-ghost" onClick={() => onEdit(u)}>
                        Edit
                      </button>
                      <button className="btn-ghost" onClick={() => onDelete(u)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

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
