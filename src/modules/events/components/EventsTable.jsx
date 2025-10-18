import React from "react";
import SkeletonRow from "./SkeletonRow";
import {
  MdAccessTime,
  MdPlace,
  MdLink,
  MdGroups,
  MdPublic,
  MdLock,
  MdVisibility,
} from "react-icons/md";

function dtRange(startISO, endISO, tz) {
  if (!startISO) return "—";
  const s = new Date(startISO);
  const e = endISO ? new Date(endISO) : null;
  const opts = { dateStyle: "medium", timeStyle: "short" };
  const sTxt = new Intl.DateTimeFormat(undefined, opts).format(s);
  const eTxt = e ? new Intl.DateTimeFormat(undefined, opts).format(e) : null;
  return eTxt
    ? `${sTxt} → ${eTxt} ${tz ? `(${tz})` : ""}`
    : `${sTxt} ${tz ? `(${tz})` : ""}`;
}

function StatusBadge({ status }) {
  const map = {
    scheduled: "bg-primary/15 text-primary border border-primary/30",
    cancelled: "bg-danger/20 text-danger border border-danger/30",
    completed: "bg-success/20 text-success border border-success/30",
  };
  return (
    <span className={`badge capitalize ${map[status] || ""}`}>{status}</span>
  );
}

export default function EventsTable({
  loading,
  items,
  page,
  total,
  limit,
  onPrev,
  onNext,
  onView,
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
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Attendees</th>
              <th className="px-4 py-3 font-medium">Visibility</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading &&
              items.map((ev) => {
                const going = (ev.attendees || []).filter(
                  (a) => a.status === "going"
                ).length;
                const totalA = ev.attendees?.length || 0;
                return (
                  <tr
                    key={ev._id}
                    className="border-top border-border/60 align-top"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{ev.title}</div>
                      <div className="text-xs text-muted line-clamp-1">
                        {ev.description || "—"}
                      </div>
                      {ev.roost?.name && (
                        <div className="text-[11px] mt-1">
                          Roost: <span className="badge">{ev.roost.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize">{ev.type}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <MdAccessTime className="text-muted" />{" "}
                        {dtRange(ev.startAt, ev.endAt, ev.timezone)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {ev.location?.mode === "online" ? (
                        <div className="flex items-center gap-1">
                          <MdLink className="text-muted" />
                          <span className="truncate max-w-[220px] inline-block align-middle">
                            {ev.location?.label ||
                              ev.location?.link ||
                              "Online"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <MdPlace className="text-muted" />
                          <span className="truncate max-w-[220px] inline-block align-middle">
                            {ev.location?.label ||
                              ev.location?.address ||
                              ev.location?.city ||
                              "—"}
                          </span>
                        </div>
                      )}
                      {ev.location?.city && (
                        <div className="text-[11px] text-muted mt-0.5">
                          {ev.location.city}
                          {ev.location.country
                            ? `, ${ev.location.country}`
                            : ""}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <MdGroups className="text-muted" />
                        <span>{going} going</span>
                        <span className="text-muted">•</span>
                        <span>
                          {totalA}
                          {ev.capacity ? `/${ev.capacity}` : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {ev.visibility === "public" ? (
                        <span className="inline-flex items-center gap-1">
                          <MdPublic /> public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <MdLock /> private
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          className="btn-ghost"
                          onClick={() => onView(ev)}
                          title="View details"
                        >
                          <MdVisibility />
                        </button>
                        <button
                          className="btn-ghost"
                          onClick={() => onEdit(ev)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-ghost"
                          onClick={() => onDelete(ev)}
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
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
