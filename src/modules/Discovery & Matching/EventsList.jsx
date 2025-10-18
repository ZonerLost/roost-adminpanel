import React, { useEffect, useMemo, useState } from "react";
import {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./api/events.service";
import EventsTable from "./components/EventsTable";
import EventDrawer from "./components/EventDrawer";
import DeleteConfirm from "./components/DeleteConfirm";
// Optional: reuse your existing theme toggle
// import ThemeToggle from "../users/components/ThemeToggle";

const LIMIT = 10;

export default function EventsList() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState("");
  const [roost, setRoost] = useState("");
  const [city, setCity] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [delOpen, setDelOpen] = useState(false);
  const [delItem, setDelItem] = useState(null);

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      q,
      type,
      status,
      mode,
      roost,
      city,
      from,
      to,
    }),
    [page, q, type, status, mode, roost, city, from, to]
  );

  async function fetchData() {
    setLoading(true);
    try {
      const res = await listEvents(params);
      setRows(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, type, status, mode, roost, city, from, to]);

  async function handleSubmit(model) {
    if (editing?._id) await updateEvent(editing._id, model);
    else {
      await createEvent(model);
      setPage(1);
    }
    await fetchData();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Events</h1>
        <div className="flex items-center gap-2">
          {/* <ThemeToggle /> */}
          <button
            className="btn"
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          >
            Create Event
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-9">
          <label className="block sm:col-span-2">
            <span className="text-sm text-muted">Search</span>
            <input
              className="input mt-1"
              placeholder="Title, description, venue…"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted">Type</span>
            <select
              className="input mt-1"
              value={type}
              onChange={(e) => {
                setPage(1);
                setType(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="meetup">meetup</option>
              <option value="watch-party">watch-party</option>
              <option value="online">online</option>
              <option value="community">community</option>
              <option value="workshop">workshop</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-muted">Status</span>
            <select
              className="input mt-1"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="scheduled">scheduled</option>
              <option value="cancelled">cancelled</option>
              <option value="completed">completed</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-muted">Mode</span>
            <select
              className="input mt-1"
              value={mode}
              onChange={(e) => {
                setPage(1);
                setMode(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="in-person">in-person</option>
              <option value="online">online</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-muted">Roost</span>
            <input
              className="input mt-1"
              placeholder="Roost name"
              value={roost}
              onChange={(e) => {
                setPage(1);
                setRoost(e.target.value);
              }}
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted">City</span>
            <input
              className="input mt-1"
              placeholder="e.g., Amsterdam"
              value={city}
              onChange={(e) => {
                setPage(1);
                setCity(e.target.value);
              }}
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted">From</span>
            <input
              type="date"
              className="input mt-1"
              value={from}
              onChange={(e) => {
                setPage(1);
                setFrom(e.target.value);
              }}
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted">To</span>
            <input
              type="date"
              className="input mt-1"
              value={to}
              onChange={(e) => {
                setPage(1);
                setTo(e.target.value);
              }}
            />
          </label>
        </div>
      </div>

      {/* Table */}
      <EventsTable
        loading={loading}
        items={rows}
        page={page}
        total={total}
        limit={LIMIT}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        onEdit={(ev) => {
          setEditing(ev);
          setDrawerOpen(true);
        }}
        onDelete={(ev) => {
          setDelItem(ev);
          setDelOpen(true);
        }}
      />

      {/* Drawer / Modal */}
      <EventDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <DeleteConfirm
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={async () => {
          if (!delItem) return;
          await deleteEvent(delItem._id);
          setDelOpen(false);
          setDelItem(null);
          const newCount = total - 1;
          const lastPage = Math.max(1, Math.ceil(newCount / LIMIT));
          if (page > lastPage) setPage(lastPage);
          await fetchData();
        }}
        title={delItem?.title}
      />
    </div>
  );
}
