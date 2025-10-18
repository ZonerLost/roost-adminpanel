// Works with VITE_USE_MOCK=1 (localStorage) or your real API at VITE_API_URL
import axios from "axios";

const ENV_USE_MOCK = import.meta?.env?.VITE_USE_MOCK === "1";
const API_URL = import.meta?.env?.VITE_API_URL;
// Use mock data when explicitly requested or when no API URL is configured
const USE_MOCK = ENV_USE_MOCK || !API_URL;

const api = axios.create({
  baseURL: API_URL || "/api",
  withCredentials: true,
});

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

/** ---------- MOCK DATA ---------- **/
const seed = (() => {
  // static-ish numbers so dashboard doesn't jump too much each refresh
  const base = {
    usersTotal: 4235,
    usersActive7d: 1180,
    roostsTotal: 312,
    eventsUpcoming: 24,
    messages24h: 865,
    reportsOpen: 7,
  };

  // 90d arrays (so we can slice to 7/30/90)
  function range(n, fn) {
    return Array.from({ length: n }, (_, i) => fn(i));
  }
  const today = new Date();
  function dateShift(d, i) {
    const x = new Date(d);
    x.setDate(x.getDate() - (89 - i));
    x.setHours(0, 0, 0, 0);
    return x.toISOString().slice(0, 10);
  }

  const activeUsersDaily = range(90, (i) => {
    const baseVal = 800 + Math.round(300 * Math.sin(i / 6));
    const noise = Math.round((Math.random() - 0.5) * 120);
    return { d: dateShift(today, i), v: Math.max(200, baseVal + noise) };
  });

  const newUsersDaily = range(90, (i) => {
    const baseVal = 40 + Math.round(15 * Math.cos(i / 9));
    const noise = Math.round((Math.random() - 0.5) * 8);
    return { d: dateShift(today, i), v: Math.max(5, baseVal + noise) };
  });

  const eventsWeekly = range(13, (i) => {
    const baseVal = 12 + Math.round(6 * Math.sin(i / 2.2));
    const noise = Math.round((Math.random() - 0.5) * 3);
    return { w: i, v: Math.max(2, baseVal + noise) };
  });

  const categories = [
    { key: "sports", label: "Sports", pct: 28 },
    { key: "lifestyle", label: "Lifestyle", pct: 22 },
    { key: "hobbies", label: "Hobbies", pct: 19 },
    { key: "language", label: "Language", pct: 11 },
    { key: "teams", label: "Teams", pct: 9 },
    { key: "other", label: "Other", pct: 11 },
  ];

  const recentUsers = [
    {
      id: "u_1",
      name: "Alex Chen",
      email: "alex@roost.app",
      city: "Amsterdam",
      joinedAt: "2025-10-14",
    },
    {
      id: "u_2",
      name: "Zoë",
      email: "zoe@example.com",
      city: "Rotterdam",
      joinedAt: "2025-10-13",
    },
    {
      id: "u_3",
      name: "Omar Ali",
      email: "omar@roost.app",
      city: "Utrecht",
      joinedAt: "2025-10-12",
    },
    {
      id: "u_4",
      name: "Marta",
      email: "marta@roost.app",
      city: "Haarlem",
      joinedAt: "2025-10-12",
    },
  ];

  const upcomingEvents = [
    {
      id: "ev1",
      title: "Ajax vs PSV Watch",
      when: "2025-10-19 19:00",
      city: "Amsterdam",
      mode: "in-person",
    },
    {
      id: "ev2",
      title: "Community AMA",
      when: "2025-10-18 17:30",
      city: "—",
      mode: "online",
    },
    {
      id: "ev3",
      title: "Sunday 5k Run",
      when: "2025-10-20 09:00",
      city: "Amsterdam",
      mode: "in-person",
    },
  ];

  return {
    base,
    activeUsersDaily,
    newUsersDaily,
    eventsWeekly,
    categories,
    recentUsers,
    upcomingEvents,
  };
})();

function sliceByRange(arr, range) {
  if (!Array.isArray(arr)) return [];
  if (range === "7d") return arr.slice(-7);
  if (range === "30d") return arr.slice(-30);
  return arr.slice(-90);
}

/** ---------- PUBLIC API ---------- **/
export async function getDashboard({ range = "30d" } = {}) {
  if (USE_MOCK) {
    await delay();
    const active = sliceByRange(seed.activeUsersDaily, range);
    const newUsers = sliceByRange(seed.newUsersDaily, range);

    // deltas vs previous equal window
    const prevActive = sliceByRange(
      seed.activeUsersDaily,
      range === "7d" ? "14d" : range
    ).slice(0, active.length);
    const sum = (a) => a.reduce((n, x) => n + (x.v || 0), 0);
    const pct = (now, prev) => (prev ? ((now - prev) / prev) * 100 : 0);

    const activeSum = sum(active);
    const prevActiveSum = sum(prevActive);
    const activeDeltaPct = pct(activeSum, prevActiveSum);

    const kpis = [
      {
        key: "usersTotal",
        label: "Total Users",
        value: seed.base.usersTotal,
        deltaPct: +((newUsers.at(-1)?.v || 0) / 100).toFixed(2), // synthetic daily delta
        trend: newUsers.map((x) => x.v),
      },
      {
        key: "usersActive",
        label: "Active Users",
        value: seed.base.usersActive7d,
        deltaPct: +activeDeltaPct.toFixed(2),
        trend: active.map((x) => x.v),
      },
      {
        key: "roosts",
        label: "Roosts",
        value: seed.base.roostsTotal,
        deltaPct: 1.8,
        trend: sliceByRange(seed.newUsersDaily, range).map((x) =>
          Math.max(5, Math.round(x.v / 3))
        ),
      },
      {
        key: "eventsUpcoming",
        label: "Upcoming Events",
        value: seed.base.eventsUpcoming,
        deltaPct: -3.2,
        trend: sliceByRange(seed.newUsersDaily, range).map((x) =>
          Math.max(3, Math.round(x.v / 4))
        ),
      },
    ];

    const distribution = seed.categories; // % stack

    const recent = {
      users: seed.recentUsers,
      events: seed.upcomingEvents,
    };

    return {
      kpis,
      trends: {
        activeUsersDaily: active,
        newUsersDaily: newUsers,
        eventsWeekly: seed.eventsWeekly,
      },
      distribution,
      recent,
      meta: { range },
    };
  }

  // Real API shape suggestion:
  // GET /dashboard?range=7d|30d|90d -> { kpis, trends, distribution, recent, meta }
  const { data } = await api.get("/dashboard", { params: { range } });
  return data;
}
