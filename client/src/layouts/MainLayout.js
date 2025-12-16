import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function MainLayout({ children, onLogout }) {
  return (
    <>
      <Navbar onLogout={onLogout} />

      {/* Full height area below navbar */}
      <div className="d-flex" style={{ height: "calc(100vh - 56px)" }}>
        {/* Sidebar (desktop only) */}
        <div className="d-none d-md-block border-end bg-light" style={{ width: 260, overflowY: "auto" }}>
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-grow-1" style={{ overflowY: "auto" }}>
          <div className="container-fluid py-3">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
