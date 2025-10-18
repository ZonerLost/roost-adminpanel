import React, { useEffect, useMemo, useState } from "react";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from "./api/users.service";
import UsersTable from "./components/UserTable";
import UserDrawer from "./components/UserDrawer";
import DeleteConfirm from "./components/DeleteConfirm";
import ThemeToggle from "../../components/common/ThemeToggle";

const LIMIT = 10;

export default function UsersList() {
  const [q, setQ] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");
  const [lang, setLang] = useState("");
  // NEW
  const [roost, setRoost] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [delOpen, setDelOpen] = useState(false);
  const [delItem, setDelItem] = useState(null);
  // UI: toggle filters on small screens
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params = useMemo(
    () => ({ page, limit: LIMIT, q, gender, status, lang, roost }),
    [page, q, gender, status, lang, roost]
  );

  async function fetchData() {
    setLoading(true);
    try {
      const res = await listUsers(params);
      setRows(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, gender, status, lang, roost]);

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }
  function openEdit(u) {
    setEditing(u);
    setDrawerOpen(true);
  }

  async function handleSubmit(model) {
    if (editing?._id) await updateUser(editing._id, model);
    else {
      await createUser(model);
      setPage(1);
    }
    await fetchData();
  }

  function askDelete(u) {
    setDelItem(u);
    setDelOpen(true);
  }
  async function confirmDelete() {
    if (!delItem) return;
    await deleteUser(delItem._id);
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
          <h1 className="text-lg font-semibold">Users</h1>
          {/* mobile-only filter toggle */}
          <button
            type="button"
            className="btn-ghost sm:hidden text-sm"
            onClick={() => setFiltersOpen((s) => !s)}
          >
            {filtersOpen ? "Hide filters" : "Filters"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="btn" onClick={openCreate}>
            Add User
          </button>
        </div>
      </div>

      {/* Filters: collapsible on small screens */}
      <div className={`${filtersOpen ? "block" : "hidden"} sm:block card p-4`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          <label className="block sm:col-span-2">
            <span className="text-sm text-muted">Search</span>
            <input
              className="input mt-1"
              placeholder="Name, email, bio, interest…"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted">Gender</span>
            <select
              className="input mt-1"
              value={gender}
              onChange={(e) => {
                setPage(1);
                setGender(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="male">male</option>
              <option value="female">female</option>
              <option value="non-binary">non-binary</option>
              <option value="unspecified">unspecified</option>
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
              <option value="deleted">deleted</option>
            </select>
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

          {/* NEW */}
          <label className="block">
            <span className="text-sm text-muted">Roost filter</span>
            <input
              className="input mt-1"
              placeholder="Match any roost name"
              value={roost}
              onChange={(e) => {
                setPage(1);
                setRoost(e.target.value);
              }}
            />
          </label>
        </div>
      </div>

      {/* Table */}
      <UsersTable
        loading={loading}
        items={rows}
        page={page}
        total={total}
        limit={LIMIT}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        onEdit={openEdit}
        onDelete={askDelete}
      />

      {/* Drawer / Modal */}
      <UserDrawer
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
