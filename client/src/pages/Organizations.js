import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Organizations() {
  const [orgs, setOrgs] = useState([]);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [editingOrgId, setEditingOrgId] = useState(null);

  const [mappingOrgId, setMappingOrgId] = useState(null);
  const [selectedClientIds, setSelectedClientIds] = useState([]);

  const load = async () => {
    setError("");
    const [orgRes, clientRes] = await Promise.all([
      api.get("/organizations"),
      api.get("/clients")
    ]);
    setOrgs(orgRes.data.organizations || []);
    setClients(clientRes.data.clients || []);
  };

  useEffect(() => { load().catch(e => setError(e?.response?.data?.message || "Load failed")); }, []);

  const submitOrg = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingOrgId) {
        await api.patch(`/organizations/${editingOrgId}`, { name });
      } else {
        await api.post("/organizations", { name });
      }
      setName("");
      setEditingOrgId(null);
      await load();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Save failed");
    }
  };

  const editOrg = (org) => {
    setEditingOrgId(org.id);
    setName(org.name);
  };

  const cancelEdit = () => {
    setEditingOrgId(null);
    setName("");
  };

  const removeOrg = async (id) => {
    if (!window.confirm("Delete this organization?")) return;
    setError("");
    try {
      await api.delete(`/organizations/${id}`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Delete failed");
    }
  };

  const openMapping = (org) => {
    setMappingOrgId(org.id);
    const existing = (org.Clients || []).map(c => c.id);
    setSelectedClientIds(existing);
  };

  const toggleClient = (clientId) => {
    setSelectedClientIds(prev =>
      prev.includes(clientId) ? prev.filter(x => x !== clientId) : [...prev, clientId]
    );
  };

  const saveMapping = async () => {
    setError("");
    try {
      await api.put(`/organizations/${mappingOrgId}/clients`, { clientIds: selectedClientIds });
      setMappingOrgId(null);
      setSelectedClientIds([]);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Mapping save failed");
    }
  };

  return (
    <div className="container mt-4">
      <h4>Organizations</h4>
      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <div className="card mt-3">
        <div className="card-body">
          <h6 className="mb-3">{editingOrgId ? "Edit Organization" : "Create Organization"}</h6>

          <form onSubmit={submitOrg} className="row g-2">
            <div className="col-12 col-md-8">
              <input className="form-control" placeholder="Organization name *"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="col-12 col-md-2 d-grid">
              <button className="btn btn-primary">{editingOrgId ? "Update" : "Create"}</button>
            </div>
            {editingOrgId && (
              <div className="col-12 col-md-2 d-grid">
                <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>Cancel</button>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-body table-responsive">
          <h6 className="mb-3">Organization List</h6>

          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Linked Clients</th>
                <th style={{ width: 260 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map(org => (
                <tr key={org.id}>
                  <td><strong>{org.name}</strong></td>
                  <td>
                    {(org.Clients || []).length
                      ? org.Clients.map(c => c.name).join(", ")
                      : <span className="text-muted">None</span>}
                  </td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => editOrg(org)}>Edit</button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => openMapping(org)}>Link Clients</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => removeOrg(org.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {orgs.length === 0 && (
                <tr><td colSpan="3" className="text-muted">No organizations yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple mapping panel */}
      {mappingOrgId && (
        <div className="card mt-3">
          <div className="card-body">
            <h6 className="mb-2">Select Clients for Organization</h6>
            <div className="row">
              {clients.map(c => (
                <div className="col-12 col-md-6" key={c.id}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`c_${c.id}`}
                      checked={selectedClientIds.includes(c.id)}
                      onChange={() => toggleClient(c.id)}
                    />
                    <label className="form-check-label" htmlFor={`c_${c.id}`}>
                      {c.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-primary" onClick={saveMapping}>Save</button>
              <button className="btn btn-outline-secondary" onClick={() => { setMappingOrgId(null); setSelectedClientIds([]); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
