// src/routes/router.jsx
import React, { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import { PATHS } from "./paths";
import Loading from "../components/Loading";

// Lazy pages
const DashboardPage = lazy(() =>
  import("../modules/dashboard/DashboardPage.jsx")
);
const UsersList = lazy(() => import("../modules/users/UsersList.jsx"));
const RoostsList = lazy(() => import("../modules/roosts/RoostsList.jsx"));
const EventsList = lazy(() => import("../modules/events/EventsList.jsx"));
const SettingsPage = lazy(() => import("../modules/settings/SettingsPage.jsx"));
const LoginPage = lazy(() => import("../modules/auth/Login.jsx")); // if you added the animated login

const withSuspense = (node) => (
  <Suspense fallback={<Loading />}>{node}</Suspense>
);

const router = createBrowserRouter([
  // Auth (outside the AdminLayout shell)
  {
    path: PATHS.AUTH.LOGIN,
    element: withSuspense(<LoginPage />),
  },

  // Admin shell + nested routes
  {
    path: PATHS.ROOT,
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: withSuspense(<DashboardPage />),
      },

      // Users
      {
        path: PATHS.USERS.slice(1),
        element: withSuspense(<UsersList />),
      },
      // Optional detail deep-link → render same list (open drawer by :id if desired)
      {
        path: PATHS.USER_DETAIL.slice(1),
        element: withSuspense(<UsersList />),
      },

      // Roosts (Roots)
      {
        path: PATHS.ROOSTS.slice(1),
        element: withSuspense(<RoostsList />),
      },
      {
        path: PATHS.ROOST_DETAIL.slice(1),
        element: withSuspense(<RoostsList />),
      },

      // Events
      {
        path: PATHS.EVENTS.slice(1),
        element: withSuspense(<EventsList />),
      },
      {
        path: PATHS.EVENT_DETAIL.slice(1),
        element: withSuspense(<EventsList />),
      },

      // Settings
      {
        path: PATHS.SETTINGS.slice(1),
        element: withSuspense(<SettingsPage />),
      },
    ],
  },

  // Fallback
  {
    path: PATHS.NOT_FOUND,
    element: <div className="card p-8">Not Found</div>,
  },
]);

export default router;
