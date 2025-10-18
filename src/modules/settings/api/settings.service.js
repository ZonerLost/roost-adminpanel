// Toggle mock with VITE_USE_MOCK=1; set VITE_API_URL for real backend.
import axios from "axios";

const USE_MOCK = import.meta?.env?.VITE_USE_MOCK === "1";

const api = axios.create({
  baseURL: import.meta?.env?.VITE_API_URL || "/api",
  withCredentials: true,
});

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ------- Defaults (for mock) -----------------------------------------------
const DEFAULT_ME = {
  id: "me_1",
  name: "Admin",
  email: "admin@loopin.app",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
  locale: "en",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

const DEFAULT_SETTINGS = {
  orgName: "Roost",
  brandColor: "#FE5E29",
  theme: "system", // light | dark | system
  allowRegistrations: true,
  enforce2FA: false,
  defaultLocale: "en",
  defaultTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    system: true,
    follows: true,
    messages: true,
    recommendations: true,
    marketing: false,
  },
  integrations: {
    googleOAuth: { enabled: true, clientId: "", clientSecret: "" },
    appleOAuth: { enabled: false, clientId: "", teamId: "", keyId: "" },
    stripe: { enabled: false, key: "" },
  },
  privacy: {
    profileVisibilityDefault: "public", // public | private
    dataRetentionDays: 365,
    gdprContact: "privacy@roost.app",
  },
};

function getMockStore() {
  const s = localStorage.getItem("__settings_store__");
  if (!s) {
    const seed = {
      me: DEFAULT_ME,
      settings: DEFAULT_SETTINGS,
    };
    localStorage.setItem("__settings_store__", JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(s);
  } catch {
    return { me: DEFAULT_ME, settings: DEFAULT_SETTINGS };
  }
}

function setMockStore(next) {
  localStorage.setItem("__settings_store__", JSON.stringify(next, null, 2));
}

// ------- Public API ---------------------------------------------------------
export async function getMe() {
  if (USE_MOCK) {
    await delay();
    return getMockStore().me;
  }
  const { data } = await api.get("/me");
  return data;
}

export async function updateMe(patch) {
  if (USE_MOCK) {
    await delay();
    const store = getMockStore();
    store.me = { ...store.me, ...patch };
    setMockStore(store);
    return store.me;
  }
  const { data } = await api.put("/me", patch);
  return data;
}

export async function changePassword({ currentPassword, newPassword }) {
  if (USE_MOCK) {
    await delay();
    if (!currentPassword || !newPassword) throw new Error("Missing fields");
    return { ok: true };
  }
  const { data } = await api.post("/me/password", {
    currentPassword,
    newPassword,
  });
  return data;
}

export async function getSettings() {
  if (USE_MOCK) {
    await delay();
    return getMockStore().settings;
  }
  const { data } = await api.get("/settings");
  return data;
}

export async function updateSettings(patch) {
  if (USE_MOCK) {
    await delay();
    const store = getMockStore();
    store.settings = { ...store.settings, ...patch };
    setMockStore(store);
    return store.settings;
  }
  const { data } = await api.put("/settings", patch);
  return data;
}

export async function testNotification(channel = "system") {
  if (USE_MOCK) {
    await delay();
    return { ok: true, channel, sentAt: new Date().toISOString() };
  }
  const { data } = await api.post("/settings/test-notification", { channel });
  return data;
}

export async function exportData() {
  if (USE_MOCK) {
    await delay();
    // Return a fake blob url-ish payload
    return { ok: true, url: "data:text/plain;base64,ZXhwb3J0LWR1bW15" };
  }
  const { data } = await api.post("/settings/export");
  return data;
}

export async function deleteAccount() {
  if (USE_MOCK) {
    await delay();
    const store = getMockStore();
    store.me = { ...store.me, deletedAt: new Date().toISOString() };
    setMockStore(store);
    return { ok: true };
  }
  const { data } = await api.delete("/me");
  return data;
}
