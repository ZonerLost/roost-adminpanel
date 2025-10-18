import React, { useEffect, useState } from "react";

const CATS = [
  "general",
  "sports",
  "lifestyle",
  "hobbies",
  "language",
  "teams",
  "neighborhood",
  "work",
  "education",
  "politics",
  "music",
  "gaming",
];
const VIS = ["public", "private"];
const POLICIES = ["open", "request", "invite"];
const STATUSES = ["active", "suspended", "archived"];

function parseCSV(v) {
  return (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function asList(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string") return parseCSV(v);
  try {
    // handle iterable types like Set
    if (typeof v[Symbol.iterator] === "function")
      return Array.from(v).map(String).filter(Boolean);
  } catch {
    // ignore non-iterable
  }
  // fallback: if it's an object with values, try to extract stringy values
  if (typeof v === "object")
    return Object.values(v)
      .map((x) => (typeof x === "string" ? x : x?.name || x?.tag || String(x)))
      .filter(Boolean);
  return [];
}

export default function RoostDrawer({
  open,
  onClose,
  initial = null,
  onSubmit,
}) {
  const isEdit = !!(initial && initial._id);

  const [m, setM] = useState({
    name: "",
    slug: "",
    description: "",
    category: "general",
    tags: [],
    languages: [],
    visibility: "public",
    joinPolicy: "open",
    status: "active",
    cover: "",
    locationLabel: "",
    city: "",
    country: "",
    ownerName: "",
    ownerEmail: "",
    moderators: "", // CSV emails
    membersCount: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initial) {
      setM((s) => ({ ...s }));
      setErrors({});
      return;
    }
    setM({
      name: initial.name || "",
      slug: initial.slug || "",
      description: initial.description || "",
      category: initial.category || "general",
      tags: initial.tags || [],
      languages: initial.languages || [],
      visibility: initial.visibility || "public",
      joinPolicy: initial.joinPolicy || "open",
      status: initial.status || "active",
      cover: initial.cover || "",
      locationLabel: initial.location?.label || "",
      city: initial.location?.city || "",
      country: initial.location?.country || "",
      ownerName: initial.owner?.name || "",
      ownerEmail: initial.owner?.email || "",
      moderators: (initial.moderators || [])
        .map((m) => m.email || m.name)
        .filter(Boolean)
        .join(", "),
      membersCount: initial.membersCount ?? "",
    });
    setErrors({});
  }, [initial, open]);

  if (!open) return null;

  function validate(x) {
    const e = {};
    if (!x.name.trim()) e.name = "Name is required";
    if (x.slug && !/^[a-z0-9-]{2,}$/.test(x.slug))
      e.slug = "Slug must be lowercase letters, digits or hyphens";
    if (x.ownerEmail && !/^\S+@\S+\.\S+$/.test(x.ownerEmail))
      e.ownerEmail = "Invalid email";
    return e;
  }

  async function submit(e) {
    e?.preventDefault?.();

    const payload = {
      name: m.name,
      slug: m.slug,
      description: m.description,
      category: m.category,
      tags: Array.isArray(m.tags) ? m.tags : parseCSV(m.tags),
      languages: Array.isArray(m.languages)
        ? m.languages
        : parseCSV(m.languages),
      visibility: m.visibility,
      joinPolicy: m.joinPolicy,
      status: m.status,
      cover: m.cover || undefined,
      location: { label: m.locationLabel, city: m.city, country: m.country },
      owner:
        m.ownerName || m.ownerEmail
          ? { name: m.ownerName, email: m.ownerEmail }
          : null,
      moderators: parseCSV(m.moderators).map((email) => ({ email })),
      membersCount: m.membersCount === "" ? 0 : Number(m.membersCount),
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

  const tagsText = asList(m.tags).join(", ");
  const langsText = asList(m.languages).join(", ");

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute inset-0 sm:inset-auto sm:right-0 sm:top-0 h-full w-full sm:w-auto max-w-none sm:max-w-2xl glass p-5 overflow-y-auto sm:rounded-l-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Edit Roost" : "Create Roost"}
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
                <span className="text-sm text-muted">Name</span>
                <input
                  className="input mt-1"
                  value={m.name}
                  onChange={(e) => setM({ ...m, name: e.target.value })}
                />
                {errors.name && (
                  <div className="text-danger text-xs mt-1">{errors.name}</div>
                )}
              </label>
              <label className="block">
                <span className="text-sm text-muted">Slug (optional)</span>
                <input
                  className="input mt-1"
                  value={m.slug}
                  onChange={(e) => setM({ ...m, slug: e.target.value })}
                  placeholder="ajax-ultras"
                />
                {errors.slug && (
                  <div className="text-danger text-xs mt-1">{errors.slug}</div>
                )}
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-muted">Description</span>
              <textarea
                className="input mt-1 min-h-[88px]"
                value={m.description}
                onChange={(e) => setM({ ...m, description: e.target.value })}
                placeholder="What this roost is about…"
              />
            </label>

            <div className="grid md:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-sm text-muted">Category</span>
                <select
                  className="input mt-1"
                  value={m.category}
                  onChange={(e) => setM({ ...m, category: e.target.value })}
                >
                  {CATS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-muted">Visibility</span>
                <select
                  className="input mt-1"
                  value={m.visibility}
                  onChange={(e) => setM({ ...m, visibility: e.target.value })}
                >
                  {VIS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-muted">Join policy</span>
                <select
                  className="input mt-1"
                  value={m.joinPolicy}
                  onChange={(e) => setM({ ...m, joinPolicy: e.target.value })}
                >
                  {POLICIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-muted">
                  Tags (comma separated)
                </span>
                <input
                  className="input mt-1"
                  value={tagsText}
                  onChange={(e) => setM({ ...m, tags: e.target.value })}
                  placeholder="football, ajax, meetups"
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">
                  Languages (comma separated)
                </span>
                <input
                  className="input mt-1"
                  value={langsText}
                  onChange={(e) => setM({ ...m, languages: e.target.value })}
                  placeholder="en, nl"
                />
              </label>
            </div>
          </div>

          {/* Media */}
          <div className="card p-4 space-y-3">
            <label className="block">
              <span className="text-sm text-muted">Cover image URL</span>
              <input
                className="input mt-1"
                value={m.cover}
                onChange={(e) => setM({ ...m, cover: e.target.value })}
                placeholder="https://…"
              />
            </label>
            {m.cover && (
              <img
                src={m.cover}
                alt="cover"
                className="h-24 w-full object-cover rounded-lg"
              />
            )}
          </div>

          {/* Location */}
          <div className="card p-4 space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
              <label className="block md:col-span-2">
                <span className="text-sm text-muted">Location label</span>
                <input
                  className="input mt-1"
                  value={m.locationLabel}
                  onChange={(e) =>
                    setM({ ...m, locationLabel: e.target.value })
                  }
                  placeholder="Roost Bar • Centrum"
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
          </div>

          {/* Ownership & Moderation */}
          <div className="card p-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-muted">Owner name</span>
                <input
                  className="input mt-1"
                  value={m.ownerName}
                  onChange={(e) => setM({ ...m, ownerName: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Owner email</span>
                <input
                  className="input mt-1"
                  value={m.ownerEmail}
                  onChange={(e) => setM({ ...m, ownerEmail: e.target.value })}
                  placeholder="owner@mail.com"
                />
                {errors.ownerEmail && (
                  <div className="text-danger text-xs mt-1">
                    {errors.ownerEmail}
                  </div>
                )}
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-muted">
                Moderators (emails, comma separated)
              </span>
              <input
                className="input mt-1"
                value={m.moderators}
                onChange={(e) => setM({ ...m, moderators: e.target.value })}
                placeholder="alice@mail.com, bob@mail.com"
              />
            </label>

            <div className="grid md:grid-cols-2 gap-3">
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
              <label className="block">
                <span className="text-sm text-muted">
                  Members (display only)
                </span>
                <input
                  type="number"
                  className="input mt-1"
                  value={m.membersCount}
                  onChange={(e) => setM({ ...m, membersCount: e.target.value })}
                  placeholder="e.g., 128"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create roost"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
