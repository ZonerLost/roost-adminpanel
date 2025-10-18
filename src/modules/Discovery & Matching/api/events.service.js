// Toggle mock via VITE_USE_MOCK=1; set VITE_API_URL for real backend.
import axios from "axios";

const USE_MOCK = import.meta?.env?.VITE_USE_MOCK === "1";

const api = axios.create({
  baseURL: import.meta?.env?.VITE_API_URL || "/api",
  withCredentials: true,
});

// ---- Normalizers ------------------------------------------------------------
const mapRoost = (r) =>
  !r
    ? null
    : typeof r === "string"
    ? { name: r }
    : { id: r.id, name: r.name || "" };

const mapLocation = (loc) => {
  const def = {
    mode: "in-person", // 'in-person' | 'online'
    label: "",
    address: "",
    city: "",
    country: "",
    link: "",
    lat: null,
    lng: null,
  };
  if (!loc || typeof loc !== "object") return def;
  return {
    ...def,
    ...loc,
    mode: loc.mode === "online" ? "online" : "in-person",
  };
};

const mapAttendee = (a) => {
  if (!a) return null;
  if (typeof a === "string") {
    // treat as email
    return { email: a, name: a.split("@")[0], status: "invited" };
  }
  const s = ["invited", "going", "interested", "waitlist", "declined"].includes(
    a.status
  )
    ? a.status
    : "invited";
  return {
    id: a.id,
    name: a.name || (a.email ? a.email.split("@")[0] : ""),
    email: a.email || "",
    status: s,
    avatar: a.avatar,
  };
};

const mapEvent = (e) => ({
  _id: e._id || e.id,
  title: e.title || "",
  description: e.description || "",
  type: e.type || "meetup", // meetup | watch-party | online | community | workshop
  roost: mapRoost(e.roost),
  startAt: e.startAt ? new Date(e.startAt).toISOString() : null,
  endAt: e.endAt ? new Date(e.endAt).toISOString() : null,
  timezone: e.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  location: mapLocation(e.location),
  capacity: Number.isFinite(+e.capacity) ? +e.capacity : null,
  attendees: Array.isArray(e.attendees)
    ? e.attendees.map(mapAttendee).filter(Boolean)
    : [],
  visibility: e.visibility === "private" ? "private" : "public",
  status: ["scheduled", "cancelled", "completed"].includes(e.status)
    ? e.status
    : "scheduled",
  createdAt: e.createdAt || new Date().toISOString(),
});

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ---- MOCK -------------------------------------------------------------------
const now = new Date();
const addDays = (n) => new Date(now.getTime() + n * 86400000);
let MOCK = [
  mapEvent({
    id: "ev1",
    title: "Amsterdam Watch Party: Ajax vs PSV",
    description: "Join the big-screen watch with snacks. Family friendly.",
    type: "watch-party",
    roost: { id: "r1", name: "Ajax Ultras" },
    startAt: addDays(2).setHours(19, 0, 0, 0),
    endAt: addDays(2).setHours(21, 0, 0, 0),
    timezone: "Europe/Amsterdam",
    location: {
      mode: "in-person",
      label: "Roost Bar • Centrum",
      address: "Damrak 5",
      city: "Amsterdam",
      country: "NL",
      lat: 52.374,
      lng: 4.9,
    },
    capacity: 50,
    attendees: [
      { name: "Jack Morgan", email: "jack@roost.app", status: "going" },
      { name: "Zoë", email: "zoe@example.com", status: "interested" },
    ],
    visibility: "public",
    status: "scheduled",
  }),
  mapEvent({
    id: "ev2",
    title: "Online Community Intro",
    description: "Meet the Roost team. Q&A and roadmap.",
    type: "online",
    roost: { id: "r5", name: "Rotterdam Foodies" },
    startAt: addDays(1).setHours(17, 30, 0, 0),
    endAt: addDays(1).setHours(18, 30, 0, 0),
    timezone: "Europe/Amsterdam",
    location: {
      mode: "online",
      label: "Google Meet",
      link: "https://meet.example/roost",
    },
    capacity: 200,
    attendees: [{ email: "omar@loopin.app", status: "going" }],
    visibility: "public",
    status: "scheduled",
  }),
  mapEvent({
    id: "ev3",
    title: "Park Meetup: Sunday Run",
    description: "5k easy pace. All levels welcome.",
    type: "meetup",
    roost: { id: "r2", name: "Amsterdam Runners" },
    startAt: addDays(-3).setHours(9, 0, 0, 0),
    endAt: addDays(-3).setHours(10, 0, 0, 0),
    timezone: "Europe/Amsterdam",
    location: {
      mode: "in-person",
      label: "Vondelpark Gate",
      city: "Amsterdam",
      country: "NL",
    },
    capacity: 30,
    attendees: [{ email: "jack@loopin.app", status: "going" }],
    visibility: "public",
    status: "completed",
  }),
];

// ---- Helpers ----------------------------------------------------------------
function inRange(dISO, fromISO, toISO) {
  if (!dISO) return false;
  const t = +new Date(dISO);
  if (fromISO && t < +new Date(fromISO)) return false;
  if (toISO && t > +new Date(toISO)) return false;
  return true;
}

function mockFilter(list, { q, type, status, roost, mode, from, to, city }) {
  const Q = (q || "").toLowerCase();
  const R = (roost || "").toLowerCase();
  const C = (city || "").toLowerCase();
  return list.filter((e) => {
    const hitQ =
      !Q ||
      e.title.toLowerCase().includes(Q) ||
      (e.description || "").toLowerCase().includes(Q) ||
      (e.location?.label || "").toLowerCase().includes(Q);
    const hitType = !type || e.type === type;
    const hitStatus = !status || e.status === status;
    const hitRoost = !R || (e.roost?.name || "").toLowerCase().includes(R);
    const hitMode = !mode || e.location?.mode === mode;
    const hitCity = !C || (e.location?.city || "").toLowerCase().includes(C);
    const hitRange = (!from && !to) || inRange(e.startAt, from, to);
    return (
      hitQ && hitType && hitStatus && hitRoost && hitMode && hitCity && hitRange
    );
  });
}

// ---- Public API -------------------------------------------------------------
export async function listEvents({
  page = 1,
  limit = 10,
  q = "",
  type = "",
  status = "",
  roost = "",
  mode = "",
  from = "",
  to = "",
  city = "",
} = {}) {
  if (USE_MOCK) {
    await delay();
    const filtered = mockFilter(MOCK, {
      q,
      type,
      status,
      roost,
      mode,
      from,
      to,
      city,
    });
    filtered.sort(
      (a, b) => +new Date(b.startAt || 0) - +new Date(a.startAt || 0)
    );
    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);
    return { items, total, page, limit };
  }
  const res = await api.get("/events", {
    params: { page, limit, q, type, status, roost, mode, from, to, city },
  });
  return {
    items: (res.data?.items || []).map(mapEvent),
    total: res.data?.total ?? 0,
    page: res.data?.page ?? page,
    limit: res.data?.limit ?? limit,
  };
}

export async function createEvent(payload) {
  const clean = mapEvent(payload);
  if (USE_MOCK) {
    await delay();
    const _id = crypto.randomUUID();
    const ev = { ...clean, _id, createdAt: new Date().toISOString() };
    MOCK.unshift(ev);
    return ev;
  }
  const res = await api.post("/events", clean);
  return mapEvent(res.data);
}

export async function updateEvent(id, payload) {
  const clean = mapEvent({ _id: id, ...payload });
  if (USE_MOCK) {
    await delay();
    const i = MOCK.findIndex((x) => x._id === id);
    if (i >= 0) {
      MOCK[i] = { ...MOCK[i], ...clean };
      return mapEvent(MOCK[i]);
    }
    throw new Error("Event not found");
  }
  const res = await api.put(`/events/${id}`, clean);
  return mapEvent(res.data);
}

export async function deleteEvent(id) {
  if (USE_MOCK) {
    await delay();
    MOCK = MOCK.filter((x) => x._id !== id);
    return { ok: true };
  }
  await api.delete(`/events/${id}`);
  return { ok: true };
}
