import React, { useEffect, useMemo, useState } from "react";
import {
  listRoosts,
  createRoost,
  updateRoost,
  deleteRoost,
} from "./api/roosts.service";
import RoostsTable from "./components/RoostsTable";
import RoostDrawer from "./components/RoostDrawer";
import DeleteConfirm from "./components/DeleteConfirm";
// Optional: reuse ThemeToggle if you want
// import ThemeToggle from "../users/components/ThemeToggle";

const LIMIT = 10;

export default function RoostsList() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("");
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const [lang, setLang] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [delOpen, setDelOpen] = useState(false);
  const [delItem, setDelItem] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params = useMemo(
    () => ({ page, limit: LIMIT, q, category, visibility, status, city, lang }),
    [page, q, category, visibility, status, city, lang]
  );

  async function fetchData() {
    setLoading(true);
    try {
      const res = await listRoosts(params);
      setRows(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, category, visibility, status, city, lang]);

  async function handleSubmit(model) {
    if (editing?._id) await updateRoost(editing._id, model);
    else {
      await createRoost(model);
      setPage(1);
    }
    await fetchData();
  }

  function askDelete(r) {
    setDelItem(r);
    setDelOpen(true);
  }
  async function confirmDelete() {
    if (!delItem) return;
    await deleteRoost(delItem._id);
    setDelOpen(false);
    setDelItem(null);
    const newCount = total - 1;
    const lastPage = Math.max(1, Math.ceil(newCount / LIMIT));
    if (page > lastPage) setPage(lastPage);
    await fetchData();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Roosts</h1>
          <button
            type="button"
            className="btn-ghost sm:hidden text-sm"
            onClick={() => setFiltersOpen((s) => !s)}
          >
            {filtersOpen ? "Hide filters" : "Filters"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn"
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          >
            Create Roost
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`${filtersOpen ? "block" : "hidden"} sm:block card p-4`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-8">
          <label className="block sm:col-span-2">
            <span className="text-sm text-muted">Search</span>
            <input
              className="input mt-1"
              placeholder="Name, slug, tag, description…"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted">Category</span>
            <select
              className="input mt-1"
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="general">general</option>
              <option value="sports">sports</option>
              <option value="lifestyle">lifestyle</option>
              <option value="hobbies">hobbies</option>
              <option value="language">language</option>
              <option value="teams">teams</option>
              <option value="neighborhood">neighborhood</option>
              <option value="work">work</option>
              <option value="education">education</option>
              <option value="politics">politics</option>
              <option value="music">music</option>
              <option value="gaming">gaming</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-muted">Visibility</span>
            <select
              className="input mt-1"
              value={visibility}
              onChange={(e) => {
                setPage(1);
                setVisibility(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="public">public</option>
              <option value="private">private</option>
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
              <option value="active">active</option>
              <option value="suspended">suspended</option>
              <option value="archived">archived</option>
            </select>
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
            <span className="text-sm text-muted">Language</span>
            <input
              className="input mt-1"
              placeholder="e.g., en"
              value={lang}
              onChange={(e) => {
                setPage(1);
                setLang(e.target.value.trim());
              }}
            />
          </label>
        </div>
      </div>

      {/* Table */}
      <RoostsTable
        loading={loading}
        items={rows}
        page={page}
        total={total}
        limit={LIMIT}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        onEdit={(r) => {
          setEditing(r);
          setDrawerOpen(true);
        }}
        onDelete={askDelete}
      />

      {/* Drawer / Modal */}
      <RoostDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <DeleteConfirm
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={confirmDelete}
        name={delItem?.name}
      />
    </div>
  );
}
