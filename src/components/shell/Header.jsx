import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdMenu,
  MdSearch,
  MdNotificationsNone,
  MdSettings,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";
import { PATHS } from "../../routes/paths";

function useThemeMode() {
  const [mode, setMode] = useState(
    () => localStorage.getItem("__theme__") || "system"
  );
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const apply = (m) => {
      let active = m;
      if (m === "system") active = mq?.matches ? "dark" : "light";
      document.documentElement.classList.toggle("dark", active === "dark");
      document.documentElement.dataset.theme = active;
      localStorage.setItem("__theme__", m);
    };
    apply(mode);
    const onChange = () => mode === "system" && apply("system");
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, [mode]);
  return [mode, setMode];
}

export default function Header({
  avatarSrc = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop",
  notifications = 0,
  notificationItems = null,
  onMenuClick,
  onSearch,
}) {
  const [q, setQ] = useState("");
  const [mode, setMode] = useThemeMode();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const notifWrapRef = useRef(null);
  const navigate = useNavigate();

  const items = useMemo(() => {
    if (Array.isArray(notificationItems)) return notificationItems;
    const count = Number(notifications) || 0;
    if (count <= 0) return [];
    return Array.from({ length: Math.min(count, 8) }).map((_, i) => ({
      id: `n-${i}`,
      title: `New activity #${i + 1}`,
      time: i === 0 ? "Just now" : `${i * 5}m ago`,
    }));
  }, [notificationItems, notifications]);

  useEffect(() => {
    function onDocClick(e) {
      if (!openNotif) return;
      if (notifWrapRef.current && !notifWrapRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setOpenNotif(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openNotif]);

  function submit(e) {
    e.preventDefault();
    onSearch?.(q.trim());
  }

  const unreadCount = items.length;

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur"
      style={{ background: "rgba(0,0,0,0.08)" }}
    >
      <div className="h-16 w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        {/* Left: Burger + brand */}
        <button
          className="lg:hidden -ml-1 p-2 rounded-lg hover:bg-white/10"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <MdMenu size={20} />
        </button>
        <Link
          to={PATHS.DASHBOARD}
          className="flex items-center gap-2 shrink-0"
          aria-label="Home"
        >
          <span className="sr-only">Home</span>
        </Link>

        {/* Mobile search button (toggles overlay search) */}
        <button
          className="sm:hidden p-2 rounded-lg hover:bg-white/10"
          onClick={() => setShowMobileSearch((v) => !v)}
          aria-label="Open search"
        >
          <MdSearch size={18} />
        </button>

        {/* Search */}
        <form
          onSubmit={submit}
          className="hidden sm:flex items-center flex-1 min-w-0"
        >
          <div
            className="flex items-center w-full max-w-7.5xl border rounded-xl bg-[var(--surface)]"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="px-3 text-muted">
              <MdSearch size={18} />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users, roosts, events…"
              className="input !border-0 !bg-transparent !shadow-none focus:!ring-0"
            />
            <button className="btn m-1">Search</button>
          </div>
        </form>

        {/* Mobile search overlay */}
        {showMobileSearch && (
          <div
            className="sm:hidden absolute inset-x-0 top-16 z-50 p-3 bg-[var(--card)] border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <form
              onSubmit={(e) => {
                submit(e);
                setShowMobileSearch(false);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search users, roosts, events…"
                className="input flex-1"
              />
              <button className="btn">Search</button>
              <button
                type="button"
                className="p-2"
                onClick={() => setShowMobileSearch(false)}
              >
                Close
              </button>
            </form>
          </div>
        )}

        {/* Right: actions */}
        <div className="ml-auto flex items-center gap-1">
          {/* Theme toggle */}
          <button
            type="button"
            className="p-2.5 rounded-lg hover:bg-white/10"
            aria-label="Toggle theme"
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            title={`Theme: ${mode}`}
          >
            {mode === "dark" ? <MdDarkMode /> : <MdLightMode />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifWrapRef}>
            <button
              type="button"
              onClick={() => setOpenNotif((v) => !v)}
              className="relative p-2.5 rounded-lg hover:bg-white/10"
              aria-haspopup="menu"
              aria-expanded={openNotif}
              aria-label="Notifications"
            >
              <MdNotificationsNone size={20} className="text-muted" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--danger)] text-white text-[10px] px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {openNotif && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-80 bg-[var(--card)] border rounded-2xl overflow-hidden"
                style={{
                  borderColor: "var(--border)",
                  boxShadow: "var(--shadow-1)",
                }}
              >
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="text-sm font-semibold">Notifications</div>
                  <div className="text-xs text-muted">
                    {items.length > 0
                      ? `You have ${unreadCount} new`
                      : "You're all caught up"}
                  </div>
                </div>
                <ul className="max-h-80 overflow-auto">
                  {items.length === 0 && (
                    <li className="px-4 py-6 text-sm text-muted">
                      No new notifications
                    </li>
                  )}
                  {items.map((n) => (
                    <li
                      key={n.id}
                      className="px-4 py-3 hover:bg-white/5 transition"
                    >
                      <div className="text-sm">{n.title}</div>
                      {n.time && (
                        <div className="text-xs text-muted">{n.time}</div>
                      )}
                    </li>
                  ))}
                </ul>
                <div
                  className="px-4 py-2 border-t bg-white/5 text-right"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    className="text-xs font-medium text-muted hover:text-text"
                    onClick={() => setOpenNotif(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            type="button"
            className="p-2.5 rounded-lg hover:bg-white/10"
            aria-label="Settings"
            onClick={() => navigate(PATHS.SETTINGS)}
          >
            <MdSettings size={20} className="text-muted" />
          </button>

          {/* Avatar */}
          <img
            src={avatarSrc}
            alt="User avatar"
            className="h-9 w-9 rounded-full object-cover border"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
      </div>
    </header>
  );
}
