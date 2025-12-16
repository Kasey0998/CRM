import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Employees() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    address: "",
    phone: ""
  };

  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null); // employee object or null

  const loadEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/users/employees");
      setEmployees(data.employees || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") loadEmployees();
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const startEdit = (emp) => {
    setEditing(emp);
    setForm({
      email: emp.email || "",
      password: "", // keep blank; only changes if you enter new password
      firstName: emp.firstName || "",
      lastName: emp.lastName || "",
      address: emp.address || "",
      phone: emp.phone || ""
    });
  };

  const cancel = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editing) {
        // update employee
        await api.patch(`/users/employees/${editing.id}`, {
          email: form.email,
          password: form.password || undefined, // only set if provided
          firstName: form.firstName,
          lastName: form.lastName,
          address: form.address,
          phone: form.phone
        });
      } else {
        // create employee
        await api.post("/users/employees", form);
      }

      setForm(emptyForm);
      setEditing(null);
      loadEmployees();
    } catch (err) {
      setError(err?.response?.data?.message || "Save failed");
    }
  };

  const remove = async (emp) => {
    if (!window.confirm(`Delete employee ${emp.email}?`)) return;
    setError("");
    try {
      await api.delete(`/users/employees/${emp.id}`);
      loadEmployees();
    } catch (err) {
      setError(err?.response?.data?.message || "Delete failed");
    }
  };

  if (user?.role !== "ADMIN") {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">Only Admin can access Employees.</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-between">
        <h4 className="mb-0">Employees</h4>
        <button className="btn btn-outline-primary btn-sm" onClick={startCreate}>
          + New Employee
        </button>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {/* Create/Edit Form */}
      <div className="card mt-3">
        <div className="card-body">
          <h6 className="mb-3">
            {editing ? `Edit Employee (Code: ${editing.employeeCode})` : "Create Employee"}
          </h6>

          <form onSubmit={submit} className="row g-2">
            <div className="col-12 col-md-6">
              <label className="form-label small mb-1">Email *</label>
              <input
                className="form-control"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small mb-1">
                {editing ? "New Password (optional)" : "Password *"}
              </label>
              <input
                className="form-control"
                type="password"
                placeholder={editing ? "Leave blank to keep same password" : "Password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editing}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small mb-1">First Name</label>
              <input
                className="form-control"
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small mb-1">Last Name</label>
              <input
                className="form-control"
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>

            <div className="col-12 col-md-8">
              <label className="form-label small mb-1">Address</label>
              <input
                className="form-control"
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small mb-1">Phone</label>
              <input
                className="form-control"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="col-12 d-flex gap-2 mt-2">
              <button className="btn btn-primary">
                {editing ? "Update" : "Create"}
              </button>

              {editing && (
                <button type="button" className="btn btn-outline-secondary" onClick={cancel}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Employee Table */}
      <div className="card mt-3">
        <div className="card-body table-responsive">
          <h6 className="mb-3">Employee List</h6>

          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : (
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Emp Code</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th style={{ width: 180 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td><strong>{emp.employeeCode}</strong></td>
                    <td>{emp.email}</td>
                    <td>{`${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "-"}</td>
                    <td>{emp.phone || "-"}</td>
                    <td>{emp.address || "-"}</td>
                    <td className="d-flex gap-2">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => startEdit(emp)}>
                        Edit
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => remove(emp)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {employees.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-muted">No employees yet</td>
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
