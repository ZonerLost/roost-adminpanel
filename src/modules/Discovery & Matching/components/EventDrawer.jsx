import React, { useEffect, useState } from "react";

const TYPES = ["meetup", "watch-party", "online", "community", "workshop"];
const STATUSES = ["scheduled", "cancelled", "completed"];
const MODES = ["in-person", "online"];

function parseCSV(v) {
  return (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function combineDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  // Construct a local Date from date & time and store as ISO.
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(dateStr);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
}

export default function EventDrawer({
  open,
  onClose,
  initial = null,
  onSubmit,
}) {
  const isEdit = !!(initial && initial._id);
  const defaultTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [m, setM] = useState({
    title: "",
    description: "",
    type: "meetup",
    roostName: "",
    roostId: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    timezone: defaultTZ,
    mode: "in-person",
    locationLabel: "",
    address: "",
    city: "",
    country: "",
    link: "",
    capacity: "",
    invitees: "",
    visibility: "public",
    status: "scheduled",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initial) {
      setM((s) => ({ ...s, timezone: defaultTZ }));
      setErrors({});
      return;
    }
    const start = initial.startAt ? new Date(initial.startAt) : null;
    const end = initial.endAt ? new Date(initial.endAt) : null;
    setM({
      title: initial.title || "",
      description: initial.description || "",
      type: initial.type || "meetup",
      roostName: initial.roost?.name || "",
      roostId: initial.roost?.id || "",
      startDate: start ? start.toISOString().slice(0, 10) : "",
      startTime: start ? start.toISOString().slice(11, 16) : "",
      endDate: end ? end.toISOString().slice(0, 10) : "",
      endTime: end ? end.toISOString().slice(11, 16) : "",
      timezone: initial.timezone || defaultTZ,
      mode: initial.location?.mode || "in-person",
      locationLabel: initial.location?.label || "",
      address: initial.location?.address || "",
      city: initial.location?.city || "",
      country: initial.location?.country || "",
      link: initial.location?.link || "",
      capacity: initial.capacity ?? "",
      invitees: (initial.attendees || [])
        .map((a) => a.email || a.name)
        .filter(Boolean)
        .join(", "),
      visibility: initial.visibility || "public",
      status: initial.status || "scheduled",
    });
    setErrors({});
  }, [initial, open, defaultTZ]);

  if (!open) return null;

  function validate(x) {
    const e = {};
    if (!x.title.trim()) e.title = "Title is required";
    if (!x.type) e.type = "Type is required";
    if (!x.startDate || !x.startTime)
      e.start = "Start date & time are required";
    if (!x.timezone) e.timezone = "Timezone is required";
    if (x.mode === "online") {
      if (!x.link.trim()) e.link = "Meeting/link is required";
    } else {
      if (!x.locationLabel.trim() && !x.address.trim() && !x.city.trim())
        e.locationLabel = "Location details required";
    }
    if (x.endDate && x.endTime) {
      const s = combineDateTime(x.startDate, x.startTime, x.timezone);
      const ed = combineDateTime(x.endDate, x.endTime, x.timezone);
      if (s && ed && +new Date(ed) <= +new Date(s)) {
        e.end = "End must be after start";
      }
    }
    return e;
  }

  async function submit(e) {
    e?.preventDefault?.();

    const startAt = combineDateTime(m.startDate, m.startTime, m.timezone);
    const endAt = combineDateTime(m.endDate, m.endTime, m.timezone);

    const payload = {
      title: m.title,
      description: m.description,
      type: m.type,
      roost: m.roostName
        ? { id: m.roostId || undefined, name: m.roostName }
        : null,
      startAt,
      endAt,
      timezone: m.timezone,
      location: {
        mode: m.mode,
        label: m.locationLabel,
        address: m.address,
        city: m.city,
        country: m.country,
        link: m.link,
      },
      capacity: m.capacity === "" ? null : Number(m.capacity),
      attendees: parseCSV(m.invitees).map((x) => ({
        email: x,
        status: "invited",
      })),
      visibility: m.visibility,
      status: m.status,
    };

    const eMap = validate(m);
    setErrors(eMap);
    if (Object.keys(eMap).length) return;

    setSaving(true);
    try {
      await onSubmit(payload);
      onClose?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-2xl glass p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Edit Event" : "Create Event"}
          </h3>
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {/* Basics */}
          <div className="card p-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-muted">Title</span>
                <input
                  className="input mt-1"
                  value={m.title}
                  onChange={(e) => setM({ ...m, title: e.target.value })}
                />
                {errors.title && (
                  <div className="text-danger text-xs mt-1">{errors.title}</div>
                )}
              </label>
              <label className="block">
                <span className="text-sm text-muted">Type</span>
                <select
                  className="input mt-1"
                  value={m.type}
                  onChange={(e) => setM({ ...m, type: e.target.value })}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <div className="text-danger text-xs mt-1">{errors.type}</div>
                )}
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-muted">Roost (name)</span>
                <input
                  className="input mt-1"
                  value={m.roostName}
                  onChange={(e) => setM({ ...m, roostName: e.target.value })}
                  placeholder="e.g., Amsterdam Runners"
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Roost ID (optional)</span>
                <input
                  className="input mt-1"
                  value={m.roostId}
                  onChange={(e) => setM({ ...m, roostId: e.target.value })}
                  placeholder="r_123"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-muted">Description</span>
              <textarea
                className="input mt-1 min-h-[88px]"
                value={m.description}
                onChange={(e) => setM({ ...m, description: e.target.value })}
                placeholder="What to expect…"
              />
            </label>
          </div>

          {/* Time */}
          <div className="card p-4 space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-sm text-muted">Start date</span>
                <input
                  type="date"
                  className="input mt-1"
                  value={m.startDate}
                  onChange={(e) => setM({ ...m, startDate: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Start time</span>
                <input
                  type="time"
                  className="input mt-1"
                  value={m.startTime}
                  onChange={(e) => setM({ ...m, startTime: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Timezone</span>
                <input
                  className="input mt-1"
                  value={m.timezone}
                  onChange={(e) => setM({ ...m, timezone: e.target.value })}
                  placeholder="Europe/Amsterdam"
                />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-muted">End date (optional)</span>
                <input
                  type="date"
                  className="input mt-1"
                  value={m.endDate}
                  onChange={(e) => setM({ ...m, endDate: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">End time (optional)</span>
                <input
                  type="time"
                  className="input mt-1"
                  value={m.endTime}
                  onChange={(e) => setM({ ...m, endTime: e.target.value })}
                />
              </label>
            </div>
            {(errors.start || errors.end || errors.timezone) && (
              <div className="text-danger text-xs">
                {errors.start || errors.end || errors.timezone}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="card p-4 space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-sm text-muted">Mode</span>
                <select
                  className="input mt-1"
                  value={m.mode}
                  onChange={(e) => setM({ ...m, mode: e.target.value })}
                >
                  {MODES.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm text-muted">Location label</span>
                <input
                  className="input mt-1"
                  value={m.locationLabel}
                  onChange={(e) =>
                    setM({ ...m, locationLabel: e.target.value })
                  }
                  placeholder="Roost Bar • Centrum / Google Meet"
                />
                {errors.locationLabel && (
                  <div className="text-danger text-xs mt-1">
                    {errors.locationLabel}
                  </div>
                )}
              </label>
            </div>

            {m.mode === "online" ? (
              <label className="block">
                <span className="text-sm text-muted">Meeting link</span>
                <input
                  className="input mt-1"
                  value={m.link}
                  onChange={(e) => setM({ ...m, link: e.target.value })}
                  placeholder="https://…"
                />
                {errors.link && (
                  <div className="text-danger text-xs mt-1">{errors.link}</div>
                )}
              </label>
            ) : (
              <div className="grid md:grid-cols-3 gap-3">
                <label className="block md:col-span-2">
                  <span className="text-sm text-muted">Address</span>
                  <input
                    className="input mt-1"
                    value={m.address}
                    onChange={(e) => setM({ ...m, address: e.target.value })}
                    placeholder="Street, number"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-muted">City</span>
                  <input
                    className="input mt-1"
                    value={m.city}
                    onChange={(e) => setM({ ...m, city: e.target.value })}
                    placeholder="Amsterdam"
                  />
                </label>
                <label className="block md:col-span-3">
                  <span className="text-sm text-muted">Country</span>
                  <input
                    className="input mt-1"
                    value={m.country}
                    onChange={(e) => setM({ ...m, country: e.target.value })}
                    placeholder="NL"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Attendance & visibility */}
          <div className="card p-4 space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-sm text-muted">Capacity</span>
                <input
                  type="number"
                  min="1"
                  className="input mt-1"
                  value={m.capacity}
                  onChange={(e) => setM({ ...m, capacity: e.target.value })}
                  placeholder="e.g., 50"
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Visibility</span>
                <select
                  className="input mt-1"
                  value={m.visibility}
                  onChange={(e) => setM({ ...m, visibility: e.target.value })}
                >
                  <option value="public">public</option>
                  <option value="private">private</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-muted">Status</span>
                <select
                  className="input mt-1"
                  value={m.status}
                  onChange={(e) => setM({ ...m, status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-muted">
                Invitees (emails, comma separated)
              </span>
              <input
                className="input mt-1"
                value={m.invitees}
                onChange={(e) => setM({ ...m, invitees: e.target.value })}
                placeholder="alice@mail.com, bob@mail.com"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create event"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
