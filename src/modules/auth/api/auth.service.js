// Lightweight auth service with mock fallback
import axios from "axios";

// Use mock when explicitly enabled or when no API URL is provided (developer convenience)
const USE_MOCK =
  import.meta?.env?.VITE_USE_MOCK === "1" || !import.meta?.env?.VITE_API_URL;

const API_URL = import.meta?.env?.VITE_API_URL || "/api";

const api = axios.create({ baseURL: API_URL, withCredentials: true });

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
  if (USE_MOCK) {
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

  const { data } = await api.post("/auth/login", { email, password, remember });
  if (!data?.ok) return data;
  setSession({
    user: data.user,
    token: data.token || data.accessToken || null,
    remember,
  });
  return data;
}

export async function forgotPassword({ email } = {}) {
  if (USE_MOCK) {
    await delay();
    if (!email) throw new Error("Enter your email");
    return { ok: true };
  }
  const { data } = await api.post("/auth/forgot", { email });
  return data;
}

export async function me() {
  if (USE_MOCK) {
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
