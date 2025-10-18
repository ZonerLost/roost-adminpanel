// src/routes/paths.js

export const PATHS = {
  // Core
  ROOT: "/",
  DASHBOARD: "/",

  // Auth
  AUTH: {
    ROOT: "/auth",
    LOGIN: "/auth/login",
  },

  // Users
  USERS: "/users",
  USER_DETAIL: "/users/:id",
  userDetail: (id) => `/users/${id}`,

  // Roosts (aka Roots)
  ROOSTS: "/roosts",
  ROOST_DETAIL: "/roosts/:id",
  roostDetail: (id) => `/roosts/${id}`,

  // Events
  EVENTS: "/events",
  EVENT_DETAIL: "/events/:id",
  eventDetail: (id) => `/events/${id}`,

  // Settings
  SETTINGS: "/settings",

  // Fallback
  NOT_FOUND: "*",
};
