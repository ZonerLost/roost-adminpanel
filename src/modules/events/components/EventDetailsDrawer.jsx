import React, { useMemo, useState } from "react";
import { updateAttendeeStatus } from "../api/events.service";
import { MdAccessTime, MdPlace, MdLink, MdGroups } from "react-icons/md";

const STATUS_OPTS = ["invited", "going", "interested", "waitlist", "declined"];

function dtRange(startISO, endISO, tz) {
  if (!startISO) return "—";
  const s = new Date(startISO);
  const e = endISO ? new Date(endISO) : null;
  const opts = { dateStyle: "medium", timeStyle: "short" };
  const sTxt = new Intl.DateTimeFormat(undefined, opts).format(s);
  const eTxt = e ? new Intl.DateTimeFormat(undefined, opts).format(e) : null;
  return eTxt
    ? `${sTxt} → ${eTxt}${tz ? ` (${tz})` : ""}`
    : `${sTxt}${tz ? ` (${tz})` : ""}`;
}

export default function EventDetailsDrawer({
  open,
  onClose,
  event,
  onRefresh,
}) {
  const [saving, setSaving] = useState(false);
  const attendees = useMemo(() => event?.attendees || [], [event?.attendees]);

  const counts = useMemo(() => {
    const map = {
      invited: 0,
      going: 0,
      interested: 0,
      waitlist: 0,
      declined: 0,
    };
    attendees.forEach((a) => (map[a.status] = (map[a.status] || 0) + 1));
    return map;
  }, [attendees]);

  if (!open || !event) return null;

  async function changeStatus(email, status) {
    setSaving(true);
    try {
      await updateAttendeeStatus(event._id, email, status);
      await onRefresh?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-3xl glass p-5 overflow-y-auto">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <div className="text-sm text-muted">
              {event.type} • {event.visibility}
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Overview */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MdAccessTime className="text-muted" />
              <span>{dtRange(event.startAt, event.endAt, event.timezone)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {event.location?.mode === "online" ? (
                <MdLink className="text-muted" />
              ) : (
                <MdPlace className="text-muted" />
              )}
              <span className="truncate">
                {event.location?.mode === "online"
                  ? event.location?.label || event.location?.link || "Online"
                  : event.location?.label ||
                    event.location?.address ||
                    event.location?.city ||
                    "—"}
              </span>
            </div>
            {event.roost?.name && (
              <div className="text-xs">
                Roost:&nbsp;<span className="badge">{event.roost.name}</span>
              </div>
            )}
            {event.description && (
              <p className="text-sm text-muted mt-2">{event.description}</p>
            )}
          </div>

          <div className="card p-4">
            <div className="font-medium mb-2">Attendance</div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="badge">
                <MdGroups /> total {attendees.length}
                {event.capacity ? ` / ${event.capacity}` : ""}
              </span>
              <span className="badge bg-success/20 text-success border border-success/30">
                going {counts.going}
              </span>
              <span className="badge">interested {counts.interested}</span>
              <span className="badge">invited {counts.invited}</span>
              <span className="badge">waitlist {counts.waitlist}</span>
              <span className="badge bg-danger/20 text-danger border border-danger/30">
                declined {counts.declined}
              </span>
            </div>
          </div>
        </div>

        {/* Attendees */}
        <div className="card p-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Attendees</div>
            {saving && <div className="text-xs text-muted">Saving…</div>}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {attendees.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-6 text-center text-muted"
                    >
                      No attendees yet.
                    </td>
                  </tr>
                )}
                {attendees.map((a) => (
                  <tr key={a.email} className="border-top border-border/60">
                    <td className="px-3 py-2">{a.name || "—"}</td>
                    <td className="px-3 py-2">{a.email || "—"}</td>
                    <td className="px-3 py-2 capitalize">{a.status}</td>
                    <td className="px-3 py-2">
                      <select
                        className="input"
                        value={a.status}
                        onChange={(e) => changeStatus(a.email, e.target.value)}
                      >
                        {STATUS_OPTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </div>
  );
}
