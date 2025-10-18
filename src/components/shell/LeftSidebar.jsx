import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdOutlineGroups,
  MdEvent,
  MdSettings,
  MdLogout,
  MdClose,
} from "react-icons/md";
import { PATHS } from "../../routes/paths";
// Optional: if you wired signOut, uncomment next line
// import { signOut } from "../../modules/auth/api/auth.service";

const NAV = [
  { icon: MdDashboard, label: "Dashboard", to: PATHS.DASHBOARD },
  { icon: MdPeople, label: "Users", to: PATHS.USERS },
  { icon: MdOutlineGroups, label: "Roosts", to: PATHS.ROOSTS },
  { icon: MdEvent, label: "Events", to: PATHS.EVENTS },
  { icon: MdSettings, label: "Settings", to: PATHS.SETTINGS },
];

export default function LeftSidebar({
  open = false,
  onClose,
  logoSrc = "/logo.png",
}) {
  async function handleLogout() {
    try {
      // await signOut();
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = PATHS.AUTH.LOGIN;
    }
  }

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 max-w-full sm:w-72 border-r bg-[var(--surface)] transform transition-transform duration-200 ease-in-out
          ${
            open ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 flex flex-col`}
        style={{ borderColor: "var(--border)" }}
      >
        {/* Brand */}
        <div
          className="h-16 px-4 flex items-center justify-between border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <Link to={PATHS.DASHBOARD} className="flex items-center gap-2">
            <img src={logoSrc} alt="Logo" className="h-8 w-8 rounded" />
            <span className="font-semibold">Admin</span>
          </Link>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === PATHS.DASHBOARD}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2 rounded-xl transition
                    ${
                      isActive
                        ? "text-white"
                        : "text-[var(--muted)] hover:text-[var(--text)]"
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? {
                          background:
                            "color-mix(in oklab, var(--primary) 18%, transparent)",
                          border:
                            "1px solid color-mix(in oklab, var(--primary) 35%, var(--border))",
                        }
                      : { border: "1px solid transparent" }
                  }
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      // icon tint on hover/active
                      "group-[.active]:text-white"
                    }`}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer actions */}
        <div className="mt-auto">
          <div
            className="px-4 py-3 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5"
            >
              <MdLogout className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
