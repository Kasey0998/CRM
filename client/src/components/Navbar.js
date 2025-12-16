import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout?.();
    navigate("/login");
  };

  const roleBadgeClass = user?.role === "ADMIN" ? "bg-danger" : "bg-secondary";
  const activeClass = ({ isActive }) => `nav-link ${isActive ? "active fw-semibold" : ""}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-semibold" to="/">TaskManager</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" className={activeClass} end>Dashboard</NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/tasks" className={activeClass}>Tasks</NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/clients" className={activeClass}>Clients</NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/organizations" className={activeClass}>Organizations</NavLink>
            </li>

            {user?.role === "ADMIN" && (
              <li className="nav-item">
                <NavLink to="/employees" className={activeClass}>Employees</NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user && (
              <>
                <span className={`badge ${roleBadgeClass}`}>{user.role}</span>
                <span className="text-light small d-none d-lg-inline">{user.email}</span>
              </>
            )}
            <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
