import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const linkClass = ({ isActive }) =>
    `list-group-item list-group-item-action ${isActive ? "active" : ""}`;

  return (
    <div className="p-3">
      <h6 className="text-uppercase text-muted mb-3">Quick Actions</h6>

      <div className="list-group list-group-flush">
        <NavLink to="/tasks" className={linkClass}>📋 Tasks</NavLink>
        <NavLink to="/clients" className={linkClass}>🧾 Clients</NavLink>
        <NavLink to="/organizations" className={linkClass}>🏢 Organizations</NavLink>
        {user?.role === "ADMIN" && (
          <NavLink to="/employees" className={linkClass}>👥 Employees</NavLink>
        )}
      </div>

      <hr />
    </div>
  );
}
