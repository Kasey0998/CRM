import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ name: "", address: "" });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/clients");
      setClients(data.clients || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.patch(`/clients/${editingId}`, form);
      } else {
        await api.post("/clients", form);
      }
      setForm({ name: "", address: "" });
      setEditingId(null);
      load();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Save failed");
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name || "", address: c.address || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", address: "" });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this client?")) return;
    setError("");
    try {
      await api.delete(`/clients/${id}`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="container mt-4">
      <h4>Clients</h4>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <div className="card mt-3">
        <div className="card-body">
          <h6 className="mb-3">{editingId ? "Edit Client" : "Create Client"}</h6>

          <form onSubmit={submit} className="row g-2">
            <div className="col-12 col-md-5">
              <input
                className="form-control"
                placeholder="Client name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-5">
              <input
                className="form-control"
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="col-12 col-md-2 d-grid">
              <button className="btn btn-primary">
                {editingId ? "Update" : "Create"}
              </button>
            </div>

            {editingId && (
              <div className="col-12 col-md-2 d-grid">
                <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-body table-responsive">
          <h6 className="mb-3">Client List</h6>

          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : (
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th style={{ width: 200 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.address || "-"}</td>
                    <td className="d-flex gap-2">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => startEdit(c)}>
                        Edit
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => remove(c.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {clients.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-muted">No clients yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
