import React, { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import "./App.css";

import App from "./App.jsx";
import router from "./routes/router.jsx";

export const Fallback = () => (
  <div className="container-xl page">
    <div className="card p-8 fade-in text-muted">Loading…</div>
  </div>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App>
      <Suspense fallback={<Fallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </App>
  </StrictMode>
);
