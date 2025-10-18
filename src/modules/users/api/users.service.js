// Toggle mock via VITE_USE_MOCK=1; set VITE_API_URL for real backend.
import axios from "axios";

const ENV_USE_MOCK = import.meta?.env?.VITE_USE_MOCK === "1";
const API_URL = import.meta?.env?.VITE_API_URL;
// Use mock when explicitly requested or when no API URL is configured
const USE_MOCK = ENV_USE_MOCK || !API_URL;

const api = axios.create({
  baseURL: API_URL || "/api",
  withCredentials: true,
});

const normalizeRoosts = (v) => {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => {
      if (!x) return null;
      if (typeof x === "string") return { name: x };
      if (typeof x === "object" && (x.name || x.id))
        return { id: x.id, name: x.name || "" };
      return null;
    })
    .filter(Boolean);
};

// normalize (Roost fields)
const mapUser = (u) => ({
  _id: u._id || u.id,
  name: u.name || "",
  email: u.email || "",
  gender: u.gender || "unspecified", // male | female | non-binary | unspecified
  dob: u.dob || null,
  location: u.location || "",
  distanceMiles: Number.isFinite(+u.distanceMiles) ? +u.distanceMiles : null,
  bio: u.bio || "",
  languages: Array.isArray(u.languages) ? u.languages : [],
  interests: Array.isArray(u.interests) ? u.interests : [],
  lifestyle: Array.isArray(u.lifestyle) ? u.lifestyle : [],
  workEduPolitics: Array.isArray(u.workEduPolitics) ? u.workEduPolitics : [],
  orientation: u.orientation || null,
  relationshipStatus: u.relationshipStatus || null,
  connectionGoals: Array.isArray(u.connectionGoals) ? u.connectionGoals : [],
  visibility: u.visibility || "public", // public | private
  accountStatus: u.accountStatus || "active", // active | suspended | deleted
  createdAt: u.createdAt || new Date().toISOString(),
  avatar:
    u.avatar ||
    `https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=256&auto=format&fit=crop`,
  // NEW
  roostsCreated: normalizeRoosts(u.roostsCreated || []),
  roostsJoined: normalizeRoosts(u.roostsJoined || []),
});

// ---------------- MOCK ----------------
let MOCK = [
  {
    _id: "u1",
    name: "Jack Morgan",
    email: "jack@roost.app",
    gender: "male",
    dob: "1996-05-10",
    location: "Amsterdam, NL",
    distanceMiles: 2.1,
    bio: "Sports & live music. Always down for 5-a-side ⚽.",
    languages: ["en", "nl"],
    interests: ["football", "live-music", "gaming"],
    lifestyle: ["fitness", "travel"],
    workEduPolitics: ["software-engineer", "bachelor"],
    orientation: "straight",
    relationshipStatus: "single",
    connectionGoals: ["friends", "networking"],
    visibility: "public",
    accountStatus: "active",
    createdAt: "2025-10-10T10:00:00.000Z",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=256&auto=format&fit=crop",
    roostsCreated: [
      { id: "r1", name: "Ajax Ultras" },
      { id: "r2", name: "Amsterdam Runners" },
    ],
    roostsJoined: [
      { id: "r3", name: "Live Music NL" },
      { id: "r4", name: "Weekend Gamers" },
    ],
  },
  {
    _id: "u2",
    name: "Zoë van Dijk",
    email: "zoe@example.com",
    gender: "female",
    dob: "1999-12-22",
    location: "Rotterdam, NL",
    distanceMiles: 7.8,
    bio: "Reader, foodie, and traveler. 🌍",
    languages: ["nl", "en", "de"],
    interests: ["reading", "food", "travel"],
    lifestyle: ["vegetarian"],
    workEduPolitics: ["marketing", "master"],
    relationshipStatus: "in-relationship",
    connectionGoals: ["friends"],
    visibility: "public",
    accountStatus: "active",
    createdAt: "2025-10-12T12:00:00.000Z",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=256&auto=format&fit=crop",
    roostsCreated: [{ id: "r5", name: "Rotterdam Foodies" }],
    roostsJoined: [
      { id: "r6", name: "Bookworms EU" },
      { id: "r7", name: "Travel Buddies" },
    ],
  },
  {
    _id: "u3",
    name: "Omar Ali",
    email: "omar@roost.app",
    gender: "male",
    dob: "1992-04-03",
    location: "Manchester, UK",
    distanceMiles: 1.2,
    bio: "Casual runner, weekend photographer.",
    languages: ["en", "ar"],
    interests: ["running", "photography"],
    lifestyle: ["fitness"],
    workEduPolitics: ["product-manager", "bachelor"],
    orientation: "straight",
    relationshipStatus: "single",
    connectionGoals: ["dating", "friends"],
    visibility: "private",
    accountStatus: "suspended",
    createdAt: "2025-10-05T09:00:00.000Z",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
    roostsCreated: [],
    roostsJoined: [{ id: "r8", name: "Street Photogs UK" }],
  },
];

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

function mockFilter(data, { q, gender, status, lang, roost }) {
  return data.filter((u) => {
    const qn = (q || "").toLowerCase();
    const hitQ =
      !qn ||
      u.name.toLowerCase().includes(qn) ||
      u.email.toLowerCase().includes(qn) ||
      u.bio.toLowerCase().includes(qn) ||
      u.interests.some((t) => t.toLowerCase().includes(qn)) ||
      (u.roostsCreated || []).some((r) =>
        (r.name || "").toLowerCase().includes(qn)
      ) ||
      (u.roostsJoined || []).some((r) =>
        (r.name || "").toLowerCase().includes(qn)
      );
    const hitGender = !gender || u.gender === gender;
    const hitStatus = !status || u.accountStatus === status;
    const hitLang = !lang || (u.languages || []).includes(lang);
    const rn = (roost || "").toLowerCase();
    const hitRoost =
      !rn ||
      (u.roostsCreated || []).some((r) =>
        (r.name || "").toLowerCase().includes(rn)
      ) ||
      (u.roostsJoined || []).some((r) =>
        (r.name || "").toLowerCase().includes(rn)
      );
    return hitQ && hitGender && hitStatus && hitLang && hitRoost;
  });
}

// ---------------- API ----------------
export async function listUsers({
  page = 1,
  limit = 10,
  q = "",
  gender = "",
  status = "",
  lang = "",
  roost = "",
} = {}) {
  if (USE_MOCK) {
    await delay();
    const filtered = mockFilter(MOCK, { q, gender, status, lang, roost });
    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit).map(mapUser);
    return { items, total, page, limit };
  }
  const res = await api.get("/users", {
    params: { page, limit, q, gender, status, lang, roost },
  });
  const items = (res.data?.items || []).map(mapUser);
  return {
    items,
    total: res.data?.total || items.length,
    page: res.data?.page || page,
    limit: res.data?.limit || limit,
  };
}

export async function createUser(payload) {
  const clean = mapUser(payload);
  if (USE_MOCK) {
    await delay();
    const _id = crypto.randomUUID();
    const user = { ...clean, _id, createdAt: new Date().toISOString() };
    MOCK.unshift(user);
    return user;
  }
  const res = await api.post("/users", clean);
  return mapUser(res.data);
}

export async function updateUser(id, payload) {
  const clean = mapUser({ _id: id, ...payload });
  if (USE_MOCK) {
    await delay();
    const i = MOCK.findIndex((x) => x._id === id);
    if (i >= 0) {
      MOCK[i] = { ...MOCK[i], ...clean };
      return mapUser(MOCK[i]);
    }
    throw new Error("User not found");
  }
  const res = await api.put(`/users/${id}`, clean);
  return mapUser(res.data);
}

export async function deleteUser(id) {
  if (USE_MOCK) {
    await delay();
    MOCK = MOCK.filter((x) => x._id !== id);
    return { ok: true };
  }
  await api.delete(`/users/${id}`);
  return { ok: true };
}
