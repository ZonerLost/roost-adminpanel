// Toggle mock via VITE_USE_MOCK=1; set VITE_API_URL for real backend.
import axios from "axios";

// Use MOCK when explicitly enabled or when no API URL is provided (developer convenience)
const USE_MOCK =
  import.meta?.env?.VITE_USE_MOCK === "1" || !import.meta?.env?.VITE_API_URL;

const api = axios.create({
  baseURL: import.meta?.env?.VITE_API_URL || "/api",
  withCredentials: true,
});

const normalizeTags = (v) =>
  Array.isArray(v)
    ? v
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean)
    : String(v || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

const mapOwner = (o) => {
  if (!o) return null;
  if (typeof o === "string") return { id: undefined, name: o, email: "" };
  return { id: o.id, name: o.name || "", email: o.email || "" };
};

const mapModerators = (list) =>
  Array.isArray(list)
    ? list
        .map((m) =>
          typeof m === "string"
            ? { id: undefined, name: m.split("@")[0], email: m }
            : {
                id: m.id,
                name: m.name || m.email?.split("@")[0] || "",
                email: m.email || "",
              }
        )
        .filter(Boolean)
    : [];

const mapRoost = (r) => ({
  _id: r._id || r.id,
  name: r.name || "",
  slug: r.slug || "",
  description: r.description || "",
  category: r.category || "general",
  tags: normalizeTags(r.tags || []),
  languages: normalizeTags(r.languages || []),
  visibility: r.visibility === "private" ? "private" : "public",
  joinPolicy: ["open", "request", "invite"].includes(r.joinPolicy)
    ? r.joinPolicy
    : "open",
  status: ["active", "suspended", "archived"].includes(r.status)
    ? r.status
    : "active",
  cover:
    r.cover ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  location: {
    label: r.location?.label || "",
    city: r.location?.city || "",
    country: r.location?.country || "",
  },
  owner: mapOwner(r.owner),
  moderators: mapModerators(r.moderators || []),
  membersCount: Number.isFinite(+r.membersCount) ? +r.membersCount : 0,
  createdAt: r.createdAt || new Date().toISOString(),
});

// ---------------- MOCK ----------------
let MOCK = [
  mapRoost({
    id: "r1",
    name: "Ajax Ultras",
    slug: "ajax-ultras",
    description: "Matchday watch parties, away days & community news.",
    category: "sports",
    tags: ["football", "ajax", "watch-party"],
    languages: ["en", "nl"],
    visibility: "public",
    joinPolicy: "open",
    status: "active",
    cover:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200&auto=format&fit=crop",
    location: { label: "Roost Bar", city: "Amsterdam", country: "NL" },
    owner: { name: "Jack Morgan", email: "jack@roost.app" },
    moderators: [{ name: "Zoë", email: "zoe@example.com" }],
    membersCount: 524,
    createdAt: "2025-10-08T10:00:00.000Z",
  }),
  mapRoost({
    id: "r2",
    name: "Amsterdam Runners",
    slug: "ams-runners",
    description: "Weekly 5k/10k community run + coffee ☕",
    category: "lifestyle",
    tags: ["running", "fitness"],
    languages: ["en", "nl"],
    visibility: "public",
    joinPolicy: "request",
    status: "active",
    cover:
      "https://images.unsplash.com/photo-1502810190503-8303352d3a36?q=80&w=1200&auto=format&fit=crop",
    location: { label: "Vondelpark", city: "Amsterdam", country: "NL" },
    owner: { name: "Omar Ali", email: "omar@roost.app" },
    moderators: [],
    membersCount: 143,
    createdAt: "2025-09-29T09:00:00.000Z",
  }),
  mapRoost({
    id: "r5",
    name: "Rotterdam Foodies",
    slug: "rdam-foodies",
    description: "Pop-ups, hidden gems, and weekend tastings.",
    category: "hobbies",
    tags: ["food", "restaurants", "meetups"],
    languages: ["nl", "en"],
    visibility: "private",
    joinPolicy: "invite",
    status: "active",
    location: { city: "Rotterdam", country: "NL" },
    owner: { name: "Zoë", email: "zoe@example.com" },
    moderators: [],
    membersCount: 62,
    createdAt: "2025-10-11T12:00:00.000Z",
  }),
];

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

function mockFilter(data, { q, category, visibility, status, city, lang }) {
  const Q = (q || "").toLowerCase();
  const C = (city || "").toLowerCase();
  const L = (lang || "").toLowerCase();
  return data.filter((r) => {
    const hitQ =
      !Q ||
      r.name.toLowerCase().includes(Q) ||
      r.slug.toLowerCase().includes(Q) ||
      (r.description || "").toLowerCase().includes(Q) ||
      r.tags.some((t) => t.toLowerCase().includes(Q));
    const hitCat = !category || r.category === category;
    const hitVis = !visibility || r.visibility === visibility;
    const hitStatus = !status || r.status === status;
    const hitCity = !C || (r.location.city || "").toLowerCase().includes(C);
    const hitLang =
      !L || (r.languages || []).map((x) => x.toLowerCase()).includes(L);
    return hitQ && hitCat && hitVis && hitStatus && hitCity && hitLang;
  });
}

// ---------------- API ----------------
export async function listRoosts({
  page = 1,
  limit = 10,
  q = "",
  category = "",
  visibility = "",
  status = "",
  city = "",
  lang = "",
} = {}) {
  if (USE_MOCK) {
    await delay();
    const filtered = mockFilter(MOCK, {
      q,
      category,
      visibility,
      status,
      city,
      lang,
    });
    filtered.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);
    return { items, total, page, limit };
  }
  const res = await api.get("/roosts", {
    params: { page, limit, q, category, visibility, status, city, lang },
  });
  return {
    items: (res.data?.items || []).map(mapRoost),
    total: res.data?.total ?? 0,
    page: res.data?.page ?? page,
    limit: res.data?.limit ?? limit,
  };
}

export async function createRoost(payload) {
  const clean = mapRoost(payload);
  if (USE_MOCK) {
    await delay();
    const _id = crypto.randomUUID();
    const item = { ...clean, _id, createdAt: new Date().toISOString() };
    MOCK.unshift(item);
    return item;
  }
  const res = await api.post("/roosts", clean);
  return mapRoost(res.data);
}

export async function updateRoost(id, payload) {
  const clean = mapRoost({ _id: id, ...payload });
  if (USE_MOCK) {
    await delay();
    const i = MOCK.findIndex((x) => x._id === id);
    if (i >= 0) {
      MOCK[i] = { ...MOCK[i], ...clean };
      return mapRoost(MOCK[i]);
    }
    throw new Error("Roost not found");
  }
  const res = await api.put(`/roosts/${id}`, clean);
  return mapRoost(res.data);
}

export async function deleteRoost(id) {
  if (USE_MOCK) {
    await delay();
    MOCK = MOCK.filter((x) => x._id !== id);
    return { ok: true };
  }
  await api.delete(`/roosts/${id}`);
  return { ok: true };
}
