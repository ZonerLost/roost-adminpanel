// Lightweight auth service with mock fallback
import axios from "axios";

// Helper: runtime mock flag can be enabled via env or localStorage override (useful in deployed builds)
const compileTimeMock =
  import.meta?.env?.VITE_USE_MOCK === "1" || !import.meta?.env?.VITE_API_URL;
const API_URL = import.meta?.env?.VITE_API_URL || "/api";
const api = axios.create({ baseURL: API_URL, withCredentials: true });

function isMockActive() {
  try {
    if (compileTimeMock) return true;
    // runtime override stored in localStorage so deployed builds can toggle mock behaviour
    return localStorage.getItem("__use_mock__") === "1";
  } catch {
    return compileTimeMock;
  }
}

export function setMockOverride(enabled) {
  try {
    if (enabled) localStorage.setItem("__use_mock__", "1");
    else localStorage.removeItem("__use_mock__");
  } catch {
    // ignore storage errors
  }
}

const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));
const KEY = "__roost_auth__";

function setSession({ user, token, remember }) {
  const payload = JSON.stringify({
    user,
    token: token || null,
    remember: !!remember,
    ts: Date.now(),
  });
  try {
    if (remember) {
      localStorage.setItem(KEY, payload);
      sessionStorage.removeItem(KEY);
    } else {
      sessionStorage.setItem(KEY, payload);
      localStorage.removeItem(KEY);
    }
  } catch (e) {
    // storage might be blocked (e.g., private mode) — swallow intentionally
    void e;
  }
}

export function getSession() {
  try {
    const raw = localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    void e;
    return null;
  }
}

export function isAuthed() {
  const s = getSession();
  return !!(s && (s.user || s.token));
}

export function signOut() {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  } catch (e) {
    void e;
  }
  return { ok: true };
}

// Attach Authorization automatically for real API
api.interceptors.request.use((config) => {
  const s = getSession();
  const token = s?.token;
  if (token)
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  return config;
});

export async function signIn({ email, password, remember } = {}) {
  const useMock = isMockActive();
  if (useMock) {
    await delay();
    if (!email || !password) throw new Error("Please enter email and password");
    const user = {
      id: "u_demo",
      email,
      name: (email.split("@")[0] || "Roost User").replace(/^\w/, (c) =>
        c.toUpperCase()
      ),
    };
    setSession({ user, token: null, remember });
    return { ok: true, user };
  }

  try {
    const { data } = await api.post("/auth/login", {
      email,
      password,
      remember,
    });
    if (!data?.ok) return data;
    setSession({
      user: data.user,
      token: data.token || data.accessToken || null,
      remember,
    });
    return data;
  } catch (err) {
    // Improve error message for deployment debugging
    if (err?.response) {
      const status = err.response.status;
      const body = err.response.data;
      const message = `Request to ${API_URL}/auth/login failed with status ${status}: ${JSON.stringify(
        body
      )}`;
      const e = new Error(message);
      e.cause = err;
      throw e;
    }
    // network or other error
    const e2 = new Error(
      `Network error while contacting ${API_URL}/auth/login: ${
        err?.message || err
      }`
    );
    e2.cause = err;
    throw e2;
  }
}

export async function forgotPassword({ email } = {}) {
  const useMock = isMockActive();
  if (useMock) {
    await delay();
    if (!email) throw new Error("Enter your email");
    return { ok: true };
  }
  const { data } = await api.post("/auth/forgot", { email });
  return data;
}

export async function me() {
  const useMock = isMockActive();
  if (useMock) {
    await delay(200);
    const s = getSession();
    return s?.user ? { ok: true, user: s.user } : { ok: false };
  }
  const { data } = await api.get("/auth/me");
  if (data?.user)
    setSession({
      user: data.user,
      token: getSession()?.token || null,
      remember: true,
    });
  return data;
}
