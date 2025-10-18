import React, { useEffect, useState } from "react";
import {
  changePassword,
  deleteAccount,
  exportData,
  getMe,
  getSettings,
  updateMe,
  updateSettings,
  testNotification,
  USE_MOCK,
} from "./api/settings.service";
import SectionCard from "./components/SectionCard";
import SkeletonBlock from "./components/SkeletonBlock";
import Toggle from "./components/Toggle";
import ThemeToggle from "../../components/common/ThemeToggle";

const TABS = [
  { key: "general", label: "General" },
  { key: "notifications", label: "Notifications" },
  { key: "privacy", label: "Privacy & Security" },
  { key: "integrations", label: "Integrations" },
  { key: "account", label: "My Account" },
  { key: "danger", label: "Danger Zone" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("general");

  // loading state
  const [loading, setLoading] = useState(true);

  // Org/app settings
  const [s, setS] = useState(null);

  // Me (admin)
  const [me, setMe] = useState(null);

  // ephemeral UI
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const runningMock = USE_MOCK;

  async function fetchAll() {
    setLoading(true);
    try {
      const [settings, meData] = await Promise.all([getSettings(), getMe()]);
      setS(settings);
      setMe(meData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function note(txt) {
    setMsg(txt);
    setTimeout(() => setMsg(""), 2500);
  }

  async function saveSettings(patch) {
    setSaving(true);
    try {
      const next = await updateSettings({ ...s, ...patch });
      setS(next);
      note("Saved");
    } finally {
      setSaving(false);
    }
  }

  async function saveMe(patch) {
    setSaving(true);
    try {
      const next = await updateMe({ ...me, ...patch });
      setMe(next);
      note("Saved");
    } finally {
      {
        runningMock && (
          <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
            Note: the app is running in <strong>mock mode</strong>. No backend
            is configured (VITE_API_URL is empty). To use a real API, set
            VITE_API_URL in your deployment environment.
          </div>
        );
      }
      setSaving(false);
    }
  }

  // ------------------- UI blocks -------------------------------------------

  function renderGeneral() {
    if (loading || !s) return <SkeletonBlock lines={5} />;
    return (
      <div className="space-y-5">
        <SectionCard
          title="Brand"
          desc="Name and primary brand color used across the product."
          actions={
            <button
              className="btn"
              onClick={() => saveSettings({})}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          }
        >
          <div className="grid md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-muted">Organization name</span>
              <input
                className="input mt-1"
                value={s.orgName || ""}
                onChange={(e) => setS({ ...s, orgName: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted">Brand color</span>
              <input
                type="color"
                className="input mt-1 h-10 p-1"
                value={s.brandColor || "#FE5E29"}
                onChange={(e) => setS({ ...s, brandColor: e.target.value })}
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard
          title="Theme"
          desc="Choose how Loopin looks by default."
          actions={
            <button
              className="btn-ghost text-sm"
              onClick={() => saveSettings({})}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          }
        >
          <ThemeToggle
            value={s.theme || "system"}
            onChange={(theme) => setS({ ...s, theme })}
          />
        </SectionCard>

        <SectionCard
          title="Defaults"
          desc="Localization and sign up rules."
          actions={
            <button
              className="btn-ghost text-sm"
              onClick={() => saveSettings({})}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          }
        >
          <div className="grid md:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm text-muted">Default locale</span>
              <select
                className="input mt-1"
                value={s.defaultLocale}
                onChange={(e) => setS({ ...s, defaultLocale: e.target.value })}
              >
                <option value="en">English</option>
                <option value="nl">Dutch</option>
                <option value="de">German</option>
                <option value="fr">French</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm text-muted">Default timezone</span>
              <input
                className="input mt-1"
                value={s.defaultTimezone || ""}
                onChange={(e) =>
                  setS({ ...s, defaultTimezone: e.target.value })
                }
                placeholder="Europe/Amsterdam"
              />
            </label>
          </div>

          <div className="mt-2">
            <Toggle
              checked={!!s.allowRegistrations}
              onChange={(v) => setS({ ...s, allowRegistrations: v })}
              label="Allow new user registrations"
              hint="If off, only invited accounts can sign in."
            />
          </div>
          <div className="mt-2">
            <Toggle
              checked={!!s.enforce2FA}
              onChange={(v) => setS({ ...s, enforce2FA: v })}
              label="Enforce 2FA for all admins"
              hint="Require two-factor authentication on next login."
            />
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderNotifications() {
    if (loading || !s) return <SkeletonBlock lines={6} />;
    const n = s.notifications || {};
    return (
      <div className="space-y-5">
        <SectionCard
          title="In-app & Push"
          desc="Choose which notifications are delivered to admins."
          actions={
            <button
              className="btn"
              onClick={() => saveSettings({})}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          }
        >
          <div className="space-y-3">
            <Toggle
              checked={!!n.system}
              onChange={(v) =>
                setS({ ...s, notifications: { ...n, system: v } })
              }
              label="System"
              hint="Outages, incidents, maintenance windows."
            />
            <Toggle
              checked={!!n.follows}
              onChange={(v) =>
                setS({ ...s, notifications: { ...n, follows: v } })
              }
              label="New follows"
              hint="When users follow or unfollow admins/brand accounts."
            />
            <Toggle
              checked={!!n.messages}
              onChange={(v) =>
                setS({ ...s, notifications: { ...n, messages: v } })
              }
              label="Messages"
              hint="Admin inbox and support messages."
            />
            <Toggle
              checked={!!n.recommendations}
              onChange={(v) =>
                setS({ ...s, notifications: { ...n, recommendations: v } })
              }
              label="Recommendations"
              hint="Weekly suggestions summaries."
            />
            <Toggle
              checked={!!n.marketing}
              onChange={(v) =>
                setS({ ...s, notifications: { ...n, marketing: v } })
              }
              label="Marketing"
              hint="Occasional product announcements."
            />
          </div>
          <div className="pt-3">
            <button
              className="btn-ghost"
              onClick={async () => {
                await testNotification("system");
                note("Test notification sent");
              }}
            >
              Send test notification
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderPrivacy() {
    if (loading || !s) return <SkeletonBlock lines={5} />;
    const p = s.privacy || {};
    return (
      <div className="space-y-5">
        <SectionCard
          title="Privacy defaults"
          desc="Applies to newly created user profiles (can be changed by users)."
          actions={
            <button
              className="btn"
              onClick={() => saveSettings({})}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          }
        >
          <div className="grid md:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm text-muted">
                Default profile visibility
              </span>
              <select
                className="input mt-1"
                value={p.profileVisibilityDefault || "public"}
                onChange={(e) =>
                  setS({
                    ...s,
                    privacy: { ...p, profileVisibilityDefault: e.target.value },
                  })
                }
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-muted">Data retention (days)</span>
              <input
                type="number"
                min="30"
                className="input mt-1"
                value={p.dataRetentionDays ?? 365}
                onChange={(e) =>
                  setS({
                    ...s,
                    privacy: {
                      ...p,
                      dataRetentionDays: +e.target.value || 365,
                    },
                  })
                }
              />
            </label>
            <label className="block md:col-span-1">
              <span className="text-sm text-muted">GDPR contact email</span>
              <input
                className="input mt-1"
                value={p.gdprContact || ""}
                onChange={(e) =>
                  setS({ ...s, privacy: { ...p, gdprContact: e.target.value } })
                }
              />
            </label>
          </div>
          <div className="mt-2">
            <Toggle
              checked={!!s.enforce2FA}
              onChange={(v) => setS({ ...s, enforce2FA: v })}
              label="Enforce 2FA for admins"
              hint="(same as General → Defaults)"
            />
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderIntegrations() {
    if (loading || !s) return <SkeletonBlock lines={6} />;
    const i = s.integrations || {};
    return (
      <div className="space-y-5">
        <SectionCard
          title="Google OAuth"
          desc="Enable Google sign-in for users."
        >
          <div className="space-y-3">
            <Toggle
              checked={!!i.googleOAuth?.enabled}
              onChange={(v) =>
                setS({
                  ...s,
                  integrations: {
                    ...i,
                    googleOAuth: { ...i.googleOAuth, enabled: v },
                  },
                })
              }
              label="Enabled"
            />
            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-muted">Client ID</span>
                <input
                  className="input mt-1"
                  value={i.googleOAuth?.clientId || ""}
                  onChange={(e) =>
                    setS({
                      ...s,
                      integrations: {
                        ...i,
                        googleOAuth: {
                          ...i.googleOAuth,
                          clientId: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="google-client-id"
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Client Secret</span>
                <input
                  className="input mt-1"
                  value={i.googleOAuth?.clientSecret || ""}
                  onChange={(e) =>
                    setS({
                      ...s,
                      integrations: {
                        ...i,
                        googleOAuth: {
                          ...i.googleOAuth,
                          clientSecret: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="••••••"
                />
              </label>
            </div>
          </div>
          <div className="pt-3">
            <button
              className="btn-ghost"
              onClick={() => saveSettings({})}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Apple OAuth" desc="Enable Apple sign-in for users.">
          <div className="space-y-3">
            <Toggle
              checked={!!i.appleOAuth?.enabled}
              onChange={(v) =>
                setS({
                  ...s,
                  integrations: {
                    ...i,
                    appleOAuth: { ...i.appleOAuth, enabled: v },
                  },
                })
              }
              label="Enabled"
            />
            <div className="grid md:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-sm text-muted">Client ID</span>
                <input
                  className="input mt-1"
                  value={i.appleOAuth?.clientId || ""}
                  onChange={(e) =>
                    setS({
                      ...s,
                      integrations: {
                        ...i,
                        appleOAuth: {
                          ...i.appleOAuth,
                          clientId: e.target.value,
                        },
                      },
                    })
                  }
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Team ID</span>
                <input
                  className="input mt-1"
                  value={i.appleOAuth?.teamId || ""}
                  onChange={(e) =>
                    setS({
                      ...s,
                      integrations: {
                        ...i,
                        appleOAuth: { ...i.appleOAuth, teamId: e.target.value },
                      },
                    })
                  }
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Key ID</span>
                <input
                  className="input mt-1"
                  value={i.appleOAuth?.keyId || ""}
                  onChange={(e) =>
                    setS({
                      ...s,
                      integrations: {
                        ...i,
                        appleOAuth: { ...i.appleOAuth, keyId: e.target.value },
                      },
                    })
                  }
                />
              </label>
            </div>
          </div>
          <div className="pt-3">
            <button
              className="btn-ghost"
              onClick={() => saveSettings({})}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title="Stripe"
          desc="Enable payments for premium features."
        >
          <div className="space-y-3">
            <Toggle
              checked={!!i.stripe?.enabled}
              onChange={(v) =>
                setS({
                  ...s,
                  integrations: { ...i, stripe: { ...i.stripe, enabled: v } },
                })
              }
              label="Enabled"
            />
            <label className="block">
              <span className="text-sm text-muted">Secret key</span>
              <input
                className="input mt-1"
                value={i.stripe?.key || ""}
                onChange={(e) =>
                  setS({
                    ...s,
                    integrations: {
                      ...i,
                      stripe: { ...i.stripe, key: e.target.value },
                    },
                  })
                }
                placeholder="sk_live_•••"
              />
            </label>
          </div>
          <div className="pt-3">
            <button
              className="btn-ghost"
              onClick={() => saveSettings({})}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderAccount() {
    if (loading || !me) return <SkeletonBlock lines={6} />;
    return (
      <div className="space-y-5">
        <SectionCard
          title="Profile"
          desc="These details are only visible to admins unless your profile is public."
          actions={
            <button
              className="btn"
              onClick={() => saveMe({})}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          }
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-muted">Name</span>
                <input
                  className="input mt-1"
                  value={me.name || ""}
                  onChange={(e) => setMe({ ...me, name: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Email</span>
                <input
                  className="input mt-1"
                  value={me.email || ""}
                  onChange={(e) => setMe({ ...me, email: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted">Locale</span>
                <select
                  className="input mt-1"
                  value={me.locale || "en"}
                  onChange={(e) => setMe({ ...me, locale: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="nl">Dutch</option>
                  <option value="de">German</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-muted">Timezone</span>
                <input
                  className="input mt-1"
                  value={me.timezone || ""}
                  onChange={(e) => setMe({ ...me, timezone: e.target.value })}
                  placeholder="Europe/Amsterdam"
                />
              </label>
            </div>
            <div className="flex flex-col items-center gap-3">
              <img
                src={me.avatar}
                alt="avatar"
                className="h-24 w-24 rounded-full object-cover border"
              />
              <label className="w-full">
                <span className="text-sm text-muted">Avatar URL</span>
                <input
                  className="input mt-1"
                  value={me.avatar || ""}
                  onChange={(e) => setMe({ ...me, avatar: e.target.value })}
                  placeholder="https://…"
                />
              </label>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Password" desc="Change your password.">
          <PasswordChanger onSaved={() => note("Password updated")} />
        </SectionCard>
      </div>
    );
  }

  function renderDanger() {
    return (
      <div className="space-y-5">
        <SectionCard
          title="Data export"
          desc="Download a copy of your data in a portable format."
        >
          <button
            className="btn"
            onClick={async () => {
              const res = await exportData();
              if (res?.url) window.open(res.url, "_blank");
              note("Export started");
            }}
          >
            Export my data
          </button>
        </SectionCard>

        <SectionCard
          title="Delete account"
          desc="This action is permanent and cannot be undone."
          actions={
            <button
              className="btn bg-danger/20 text-danger border border-danger/30"
              onClick={async () => {
                if (!confirm("Are you sure? This cannot be undone.")) return;
                await deleteAccount();
                note("Account deleted (mock)");
              }}
            >
              Delete my account
            </button>
          }
        >
          <p className="text-sm text-muted">
            Deleting your admin account will remove your access immediately.
            Organization settings are not deleted.
          </p>
        </SectionCard>
      </div>
    );
  }

  function Tabs() {
    return (
      <div className="w-full lg:w-60 shrink-0">
        {/* mobile horizontal tabs */}
        <div className="sm:hidden overflow-x-auto">
          <div className="flex gap-2 px-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                  tab === t.key ? "bg-primary/10 text-primary" : "bg-border/10"
                }`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {/* desktop vertical tabs */}
        <div className="hidden sm:block">
          <div className="card p-2 sticky top-20">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition
                  ${
                    tab === t.key
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-white/5"
                  }
                `}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Settings</h1>
        <div className="text-xs text-muted">{msg}</div>
      </div>

      <div className="flex flex-col-reverse lg:flex-row gap-5">
        <div className="flex-1 space-y-5 min-w-0">
          {/* main content first on mobile */}
          {tab === "general" && renderGeneral()}
          {tab === "notifications" && renderNotifications()}
          {tab === "privacy" && renderPrivacy()}
          {tab === "integrations" && renderIntegrations()}
          {tab === "account" && renderAccount()}
          {tab === "danger" && renderDanger()}
        </div>
        <Tabs />
      </div>
    </div>
  );
}

// ---------------- Password changer (inline component) -----------------------
function PasswordChanger({ onSaved }) {
  const [m, setM] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!m.currentPassword || !m.newPassword) {
      setError("Please fill all fields.");
      return;
    }
    if (m.newPassword !== m.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (m.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    try {
      await changePassword({
        currentPassword: m.currentPassword,
        newPassword: m.newPassword,
      });
      setM({ currentPassword: "", newPassword: "", confirm: "" });
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
    >
      <label className="block">
        <span className="text-sm text-muted">Current password</span>
        <input
          type="password"
          className="input mt-1"
          value={m.currentPassword}
          onChange={(e) => setM({ ...m, currentPassword: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-sm text-muted">New password</span>
        <input
          type="password"
          className="input mt-1"
          value={m.newPassword}
          onChange={(e) => setM({ ...m, newPassword: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-sm text-muted">Confirm new password</span>
        <input
          type="password"
          className="input mt-1"
          value={m.confirm}
          onChange={(e) => setM({ ...m, confirm: e.target.value })}
        />
      </label>

      {error && (
        <div className="md:col-span-3 text-danger text-xs">{error}</div>
      )}

      <div className="md:col-span-3 flex justify-end">
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}
