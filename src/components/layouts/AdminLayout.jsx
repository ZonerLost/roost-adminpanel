import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header, LeftSidebar } from "../shell";

export default function AdminLayout() {
  const [open, setOpen] = useState(false); // mobile sidebar
  const loc = useLocation();
  const isAuth = loc.pathname.startsWith("/auth"); // login/forgot/etc.

  // Close mobile sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  // Optional hotkey: Ctrl/Cmd + M (never during typing, and not on auth routes)
  useEffect(() => {
    if (isAuth) return; // no hotkeys on auth screens
    const onKey = (e) => {
      // Ignore when user is typing in inputs/textareas/contenteditable
      const tag = (e.target?.tagName || "").toLowerCase();
      const typing =
        tag === "input" || tag === "textarea" || e.target?.isContentEditable;
      if (typing) return;

      const key = e.key?.toLowerCase();
      const hasMod = e.ctrlKey || e.metaKey; // require Ctrl/Cmd
      if (key === "m" && hasMod) setOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAuth]);

  return (
    <div className="min-h-screen flex">
      {/* Left rail (hidden on /auth routes) */}
      {!isAuth && (
        <LeftSidebar
          open={open}
          onClose={() => setOpen(false)}
          logoSrc="/logo.png"
        />
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0">
        {!isAuth && (
          <Header
            title="Roost Admin"
            logoSrc="/logo.png"
            avatarSrc="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop"
            notifications={3}
            onMenuClick={() => setOpen(true)}
            onSearch={(q) => {
              if (q) console.log("search:", q);
            }}
          />
        )}

        <main className="page">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
