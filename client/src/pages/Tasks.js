import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const SERVICES = ["Accounting", "It-return", "GST", "Data-entry"];
const STATUSES = ["pending", "follow-up", "reverted of client", "completed", "in-progress"];

function statusBadgeClass(status) {
  switch (status) {
    case "pending": return "bg-warning text-dark";
    case "follow-up": return "bg-info text-dark";
    case "reverted of client": return "bg-secondary text-white";
    case "completed": return "bg-success text-white";
    case "in-progress": return "bg-primary text-white";
    default: return "bg-light text-dark";
  }
}

export default function Tasks() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [tasks, setTasks] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    q: "",
    status: "",
    service: "",
    organizationId: "",
    clientId: ""
  });

  const [form, setForm] = useState({
    organizationId: "",
    clientId: "",
    taskName: "",
    service: "Accounting",
    status: "pending"
  });

  const [editing, setEditing] = useState(null);

  // ✅ status edit UI state (per-row)
  const [statusEditId, setStatusEditId] = useState(null);
  const [statusDraft, setStatusDraft] = useState("pending");

  const load = async () => {
    setError("");
    const [tRes, oRes, cRes] = await Promise.all([
      api.get("/tasks", { params: { ...filters } }),
      api.get("/organizations"),
      api.get("/clients")
    ]);
    setTasks(tRes.data.tasks || []);
    setOrgs(oRes.data.organizations || []);
    setClients(cRes.data.clients || []);
  };

  useEffect(() => {
    load().catch(e => setError(e?.response?.data?.message || "Load failed"));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line
  }, [filters.q, filters.status, filters.service, filters.organizationId, filters.clientId]);

  const orgClientsFiltered = useMemo(() => {
    const org = orgs.find(o => String(o.id) === String(form.organizationId));
    if (!org) return [];
    const linkedIds = (org.Clients || []).map(c => c.id);
    return clients.filter(c => linkedIds.includes(c.id));
  }, [form.organizationId, orgs, clients]);

  useEffect(() => {
    setForm(prev => ({ ...prev, clientId: "" }));
  }, [form.organizationId]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await api.patch(`/tasks/${editing.id}`, {
          organizationId: Number(form.organizationId),
          clientId: Number(form.clientId),
          taskName: form.taskName,
          service: form.service,
          status: form.status
        });
        setEditing(null);
      } else {
        await api.post("/tasks", {
          organizationId: Number(form.organizationId),
          clientId: Number(form.clientId),
          taskName: form.taskName,
          service: form.service,
          status: form.status
        });
      }

      setForm({ organizationId: "", clientId: "", taskName: "", service: "Accounting", status: "pending" });
      await load();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Save failed");
    }
  };

  const startEdit = (t) => {
    setEditing(t);
    setForm({
      organizationId: String(t.organizationId),
      clientId: String(t.clientId),
      taskName: t.taskName || "",
      service: t.service || "Accounting",
      status: t.status || "pending"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ organizationId: "", clientId: "", taskName: "", service: "Accounting", status: "pending" });
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete task "${t.taskName}"?`)) return;
    setError("");
    try {
      await api.delete(`/tasks/${t.id}`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Delete failed");
    }
  };

  const assignSelf = async (id) => {
    try {
      await api.post(`/tasks/${id}/assign-self`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Assign failed");
    }
  };

  // ✅ open inline status editor
  const openStatusEditor = (task) => {
    setStatusEditId(task.id);
    setStatusDraft(task.status);
  };

  const cancelStatusEditor = () => {
    setStatusEditId(null);
    setStatusDraft("pending");
  };

  const saveStatus = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: statusDraft });
      setStatusEditId(null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Status update failed");
    }
  };

  return (
    <div className="container mt-4">
      <h4>Tasks</h4>
      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {/* Filters */}
      <div className="card mt-3">
        <div className="card-body">
          <h6 className="mb-3">Filters</h6>
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <input
                className="form-control"
                placeholder="Search task name..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
            </div>
            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={filters.service}
                onChange={(e) => setFilters({ ...filters, service: e.target.value })}
              >
                <option value="">All Services</option>
                {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={filters.organizationId}
                onChange={(e) => setFilters({ ...filters, organizationId: e.target.value })}
              >
                <option value="">All Orgs</option>
                {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select
                className="form-select"
                value={filters.clientId}
                onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
              >
                <option value="">All Clients</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit */}
      <div className="card mt-3">
        <div className="card-body">
          <h6 className="mb-3">{editing ? `Edit Task (#${editing.id})` : "Create Task"}</h6>

          <form onSubmit={submit} className="row g-2">
            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={form.organizationId}
                onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                required
              >
                <option value="">Select Organization *</option>
                {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>

            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                required
                disabled={!form.organizationId}
              >
                <option value="">{form.organizationId ? "Select Client *" : "Select Organization first"}</option>
                {orgClientsFiltered.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              {form.organizationId && orgClientsFiltered.length === 0 && (
                <div className="text-muted small mt-1">
                  No clients linked to this organization. Go to Organizations → Link Clients.
                </div>
              )}
            </div>

            <div className="col-12 col-md-4">
              <input
                className="form-control"
                placeholder="Task name *"
                value={form.taskName}
                onChange={(e) => setForm({ ...form, taskName: e.target.value })}
                required
              />
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
              >
                {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="col-12 d-flex gap-2">
              <button className="btn btn-primary">{editing ? "Update" : "Create"}</button>
              {editing && (
                <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="card mt-3">
        <div className="card-body table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Task</th>
                <th>Service</th>
                <th style={{ width: 220 }}>Status</th>
                <th>Client</th>
                <th>Org</th>
                <th>Assigned</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.taskName}</td>
                  <td>{t.service}</td>

                  {/* ✅ Clean Status section */}
                  <td>
                    {statusEditId === t.id ? (
                      <div className="d-flex gap-2 align-items-center">
                        <select
                          className="form-select form-select-sm"
                          value={statusDraft}
                          onChange={(e) => setStatusDraft(e.target.value)}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <button className="btn btn-success btn-sm" onClick={() => saveStatus(t.id)}>
                          Save
                        </button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={cancelStatusEditor}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex gap-2 align-items-center">
                        <span className={`badge rounded-pill px-3 ${statusBadgeClass(t.status)}`}>
                          {t.status}
                        </span>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => openStatusEditor(t)}>
                          Change
                        </button>
                      </div>
                    )}
                  </td>

                  <td>{t.Client?.name || "-"}</td>
                  <td>{t.Organization?.name || "-"}</td>
                  <td>
                    {t.assignedTo
                      ? `${t.assignedTo.firstName || ""} ${t.assignedTo.lastName || ""}`.trim() ||
                        t.assignedTo.email
                      : "-"}
                  </td>

                  {/* ✅ Actions section clean */}
                  <td className="d-flex flex-wrap gap-2">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => startEdit(t)}>
                      Edit
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => remove(t)}>
                      Delete
                    </button>
                    {user?.role === "EMPLOYEE" && (
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => assignSelf(t.id)}
                        disabled={t.assignedToUserId === user.id}
                      >
                        Assign to me
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {tasks.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-muted">No tasks found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
