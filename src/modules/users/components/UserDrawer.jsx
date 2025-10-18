import React, { useEffect, useState } from "react";

const GENDERS = ["male", "female", "non-binary", "unspecified"];
const STATUSES = ["active", "suspended", "deleted"];

function parseCSV(v) {
  return (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function UserDrawer({
  open,
  onClose,
  initial = null,
  onSubmit,
}) {
  const isEdit = !!(initial && initial._id);
  const [m, setM] = useState({
    name: "",
    email: "",
    gender: "unspecified",
    dob: "",
    location: "",
    distanceMiles: "",
    bio: "",
    languages: [],
    interests: [],
    lifestyle: [],
    workEduPolitics: [],
    orientation: "",
    relationshipStatus: "",
    connectionGoals: [],
    visibility: "public",
    accountStatus: "active",
    avatar: "",
    // NEW
    roostsCreated: [],
    roostsJoined: [],
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setM({
      name: initial?.name || "",
      email: initial?.email || "",
      gender: initial?.gender || "unspecified",
      dob: initial?.dob ? new Date(initial.dob).toISOString().slice(0, 10) : "",
      location: initial?.location || "",
      distanceMiles: initial?.distanceMiles ?? "",
      bio: initial?.bio || "",
      languages: initial?.languages || [],
      interests: initial?.interests || [],
      lifestyle: initial?.lifestyle || [],
      workEduPolitics: initial?.workEduPolitics || [],
      orientation: initial?.orientation || "",
      relationshipStatus: initial?.relationshipStatus || "",
      connectionGoals: initial?.connectionGoals || [],
      visibility: initial?.visibility || "public",
      accountStatus: initial?.accountStatus || "active",
      avatar: initial?.avatar || "",
      roostsCreated: initial?.roostsCreated || [],
      roostsJoined: initial?.roostsJoined || [],
    });
    setErrors({});
  }, [initial, open]);

  if (!open) return null;

  function validate(x) {
    const e = {};
    if (!x.name.trim()) e.name = "Name is required";
    if (!x.email.trim()) e.email = "Email is required";
    if (x.email && !/^\S+@\S+\.\S+$/.test(x.email)) e.email = "Invalid email";
    return e;
  }

  async function submit(e) {
    e?.preventDefault?.();

    const languages = Array.isArray(m.languages)
      ? m.languages
      : parseCSV(m.languages);
    const interests = Array.isArray(m.interests)
      ? m.interests
      : parseCSV(m.interests);
    const lifestyle = Array.isArray(m.lifestyle)
      ? m.lifestyle
      : parseCSV(m.lifestyle);
    const wep = Array.isArray(m.workEduPolitics)
      ? m.workEduPolitics
      : parseCSV(m.workEduPolitics);
    const goals = Array.isArray(m.connectionGoals)
      ? m.connectionGoals
      : parseCSV(m.connectionGoals);

    // roosts CSV -> [{ name }]
    const rc = Array.isArray(m.roostsCreated)
      ? m.roostsCreated
      : parseCSV(m.roostsCreated).map((name) => ({ name }));
    const rj = Array.isArray(m.roostsJoined)
      ? m.roostsJoined
      : parseCSV(m.roostsJoined).map((name) => ({ name }));

    const payload = {
      ...m,
      distanceMiles: m.distanceMiles === "" ? null : Number(m.distanceMiles),
      languages,
      interests,
      lifestyle,
      workEduPolitics: wep,
      connectionGoals: goals,
      dob: m.dob ? new Date(m.dob).toISOString() : null,
      roostsCreated: rc.map((x) =>
        typeof x === "string" ? { name: x } : { id: x.id, name: x.name }
      ),
      roostsJoined: rj.map((x) =>
        typeof x === "string" ? { name: x } : { id: x.id, name: x.name }
      ),
    };

    const eMap = validate(payload);
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

  // helper: treat arrays and comma-strings uniformly
  const asList = (v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === "string") return parseCSV(v);
    return [];
  };

  const languagesText = asList(m.languages).join(", ");
  const interestsText = asList(m.interests).join(", ");
  const lifestyleText = asList(m.lifestyle).join(", ");
  const wepText = asList(m.workEduPolitics).join(", ");
  const goalsText = asList(m.connectionGoals).join(", ");
  const roostsCreatedText = asList(m.roostsCreated)
    .map((r) => (typeof r === "string" ? r : r?.name || ""))
    .filter(Boolean)
    .join(", ");
  const roostsJoinedText = asList(m.roostsJoined)
    .map((r) => (typeof r === "string" ? r : r?.name || ""))
    .filter(Boolean)
    .join(", ");

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/*
        On small screens: use bottom-sheet style full-height panel
        On sm+ screens: keep right-side drawer with a max width
      */}
      <aside className="absolute inset-0 sm:inset-auto sm:right-0 sm:top-0 h-full sm:h-full w-full sm:w-auto max-w-none sm:max-w-2xl glass p-5 overflow-y-auto sm:rounded-l-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Edit User" : "Add User"}
          </h3>
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {/* Identity */}
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
                <span className="text-sm text-muted">Email</span>
                <input
                  className="input mt-1"
                  value={m.email}
                  onChange={(e) => setM({ ...m, email: e.target.value })}
                />
                {errors.email && (
                  <div className="text-danger text-xs mt-1">{errors.email}</div>
                )}
              </label>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-sm text-muted">Gender</span>
                <select
                  className="input mt-1"
                  value={m.gender}
                  onChange={(e) => setM({ ...m, gender: e.target.value })}
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-muted">Date of birth</span>
                <input
                  type="date"
                  className="input mt-1"
                  value={m.dob}
                  onChange={(e) => setM({ ...m, dob: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Avatar URL</span>
                <input
                  className="input mt-1"
                  value={m.avatar}
                  onChange={(e) => setM({ ...m, avatar: e.target.value })}
                  placeholder="https://…"
                />
              </label>
            </div>
            {m.avatar && (
              <img
                src={m.avatar}
                alt="preview"
                className="h-16 w-16 rounded-full object-cover"
              />
            )}
          </div>

          {/* Location */}
          <div className="card p-4 space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
              <label className="block md:col-span-2">
                <span className="text-sm text-muted">Location</span>
                <input
                  className="input mt-1"
                  value={m.location}
                  onChange={(e) => setM({ ...m, location: e.target.value })}
                  placeholder="City, Country"
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Distance (mi)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="input mt-1"
                  value={m.distanceMiles ?? ""}
                  onChange={(e) =>
                    setM({ ...m, distanceMiles: e.target.value })
                  }
                  placeholder="e.g., 2.5"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm text-muted">Bio</span>
              <textarea
                className="input mt-1 min-h-[88px]"
                value={m.bio}
                onChange={(e) => setM({ ...m, bio: e.target.value })}
                placeholder="Tell people about yourself…"
              />
            </label>
          </div>

          {/* Tags */}
          <div className="card p-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-muted">
                  Languages (comma separated)
                </span>
                <input
                  className="input mt-1"
                  value={languagesText}
                  onChange={(e) => setM({ ...m, languages: e.target.value })}
                  placeholder="en, nl, de"
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Interests</span>
                <input
                  className="input mt-1"
                  value={interestsText}
                  onChange={(e) => setM({ ...m, interests: e.target.value })}
                  placeholder="football, cooking"
                />
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-muted">Lifestyle</span>
                <input
                  className="input mt-1"
                  value={lifestyleText}
                  onChange={(e) => setM({ ...m, lifestyle: e.target.value })}
                  placeholder="fitness, travel, vegetarian"
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Work/Edu/Politics</span>
                <input
                  className="input mt-1"
                  value={wepText}
                  onChange={(e) =>
                    setM({ ...m, workEduPolitics: e.target.value })
                  }
                  placeholder="software-engineer, bachelor"
                />
              </label>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-sm text-muted">
                  Orientation (optional)
                </span>
                <input
                  className="input mt-1"
                  value={m.orientation}
                  onChange={(e) => setM({ ...m, orientation: e.target.value })}
                  placeholder="straight / gay / bi / …"
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">
                  Relationship (optional)
                </span>
                <input
                  className="input mt-1"
                  value={m.relationshipStatus}
                  onChange={(e) =>
                    setM({ ...m, relationshipStatus: e.target.value })
                  }
                  placeholder="single / in-relationship / …"
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Goals</span>
                <input
                  className="input mt-1"
                  value={goalsText}
                  onChange={(e) =>
                    setM({ ...m, connectionGoals: e.target.value })
                  }
                  placeholder="dating, friends, networking"
                />
              </label>
            </div>
          </div>

          {/* NEW: Roosts */}
          <div className="card p-4 space-y-3">
            <div className="font-medium">Roosts</div>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-muted">
                  Roosts Created (comma separated)
                </span>
                <input
                  className="input mt-1"
                  value={roostsCreatedText}
                  onChange={(e) =>
                    setM({ ...m, roostsCreated: e.target.value })
                  }
                  placeholder="Ajax Ultras, Amsterdam Runners"
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">
                  Roosts Joined (comma separated)
                </span>
                <input
                  className="input mt-1"
                  value={roostsJoinedText}
                  onChange={(e) => setM({ ...m, roostsJoined: e.target.value })}
                  placeholder="Live Music NL, Travel Buddies"
                />
              </label>
            </div>
            <div className="text-xs text-muted">
              Tip: Replace CSV with an autocomplete picker backed by your Roosts
              API when ready.
            </div>
          </div>

          {/* Privacy & Moderation */}
          <div className="card p-4 space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
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
                <span className="text-sm text-muted">Account status</span>
                <select
                  className="input mt-1"
                  value={m.accountStatus}
                  onChange={(e) =>
                    setM({ ...m, accountStatus: e.target.value })
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create user"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
