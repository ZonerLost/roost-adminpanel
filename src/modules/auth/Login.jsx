import React, { useState } from "react";
import {
  AnimatePresence,
  motion as Motion,
} from "../../libs/framer-motion-shim";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { signIn, setMockOverride } from "./api/auth.service";
import { MdMail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import ThemeToggle from "../../components/common/ThemeToggle";

function IconInput({
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  name,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <label className="block">
      <div className="relative">
        {Icon && (
          <div
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted ${
              focused ? "text-primary" : ""
            }"`}
          >
            <Icon size={18} />
          </div>
        )}
        <input
          className={`input ${Icon ? "pl-10" : "pl-4"}`}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </label>
  );
}

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [mocking, setMocking] = useState(false);

  async function submit(e) {
    e?.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await signIn({ email: email.trim(), password, remember: false });
      nav(PATHS.DASHBOARD);
    } catch (e) {
      setErr(e?.message || "Invalid credentials");
    } finally {
      setBusy(false);
    }
  }

  function toggleMock() {
    const next = !mocking;
    try {
      setMockOverride(next);
      setMocking(next);
      // reload to pick up change in environments relying on compile-time flags
      window.location.reload();
    } catch {
      setMocking(next);
    }
  }

  const left = {
    hidden: { opacity: 0, x: -30 },
    enter: { opacity: 1, x: 0, transition: { duration: 0.8 } },
  };
  const card = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45 } },
  };

  return (
    <div className="min-h-screen flex items-stretch bg-[var(--bg)]">
      <Motion.div
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12"
        initial="hidden"
        animate="enter"
        variants={left}
      >
        <div className="max-w-md text-left space-y-6">
          <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs">
            Welcome
          </div>
          <h1 className="text-3xl font-extrabold">Manage your workspace</h1>
          <p className="text-muted">
            Fast, beautiful admin tools with delightful animations.
          </p>
        </div>
      </Motion.div>

      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence>
          <Motion.div
            initial="hidden"
            animate="enter"
            variants={card}
            className="w-full max-w-md"
          >
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-semibold">Roost Admin</div>
                    <div className="text-xs text-muted">
                      Sign in to continue
                    </div>
                  </div>
                </div>
                <ThemeToggle />
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="text-xs text-muted flex items-center justify-between">
                  <div>
                    API:{" "}
                    <code className="text-xxs">
                      {import.meta?.env?.VITE_API_URL || "/api"}
                    </code>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="text-sm text-muted"
                      onClick={toggleMock}
                    >
                      {mocking ? "Disable mock" : "Force mock"}
                    </button>
                  </div>
                </div>
                {err && <div className="text-danger text-sm">{err}</div>}

                <IconInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="username"
                  name="email"
                />

                <div>
                  <label className="block">
                    <div className="relative">
                      <input
                        className="input pr-10 pl-4"
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted"
                        onClick={() => setShowPw((v) => !v)}
                        aria-label="Toggle password visibility"
                      >
                        {showPw ? (
                          <MdVisibilityOff size={18} />
                        ) : (
                          <MdVisibility size={18} />
                        )}
                      </button>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-[var(--primary)]"
                    />{" "}
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="text-sm text-muted"
                    onClick={() => alert("Reset flow (mock)")}
                  >
                    Forgot?
                  </button>
                </div>

                <div>
                  <button className="btn w-full justify-center" disabled={busy}>
                    {busy ? "Signing in…" : "Sign In"}
                  </button>
                </div>

                <div className="text-center text-xs text-muted">
                  or continue with
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-ghost flex-1"
                    onClick={async () => {
                      setBusy(true);
                      await new Promise((r) => setTimeout(r, 700));
                      nav(PATHS.DASHBOARD);
                    }}
                  >
                    Continue (mock)
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={async () => {
                      setBusy(true);
                      await new Promise((r) => setTimeout(r, 300));
                      nav(PATHS.DASHBOARD);
                    }}
                  >
                    Guest
                  </button>
                </div>
              </form>

              <div className="text-center text-sm text-muted">
                Don't have access?{" "}
                <button
                  className="text-primary hover:underline"
                  onClick={() => alert("Request access")}
                >
                  Request access
                </button>
              </div>
            </div>
            <div className="mt-4 text-center text-xs text-muted">
              By signing in you agree to terms.
            </div>
          </Motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
