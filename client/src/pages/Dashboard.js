import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const STATUSES = ["pending", "follow-up", "reverted of client", "completed", "in-progress"];
const SERVICES = ["Accounting", "It-return", "GST", "Data-entry"];

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

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [error, setError] = useState("");
  const [stats, setStats] = useState({ total: 0, byStatus: {}, byService: {} });
  const [recentTasks, setRecentTasks] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(null);

  const load = async () => {
    setError("");
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.get("/tasks/meta/stats"),
        api.get("/tasks")
      ]);

      setStats(statsRes.data || { total: 0, byStatus: {}, byService: {} });

      const tasks = tasksRes.data.tasks || [];
      setRecentTasks(tasks.slice(0, 8));

      if (user?.role === "ADMIN") {
        const empRes = await api.get("/users/employees");
        setEmployeeCount((empRes.data.employees || []).length);
      } else {
        setEmployeeCount(null);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load dashboard");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const computed = useMemo(() => {
    const allTasksFromStatsTotal = stats.total || 0;

    const unassigned = (user?.role === "ADMIN")
      ? (recentTasks.filter(t => !t.assignedToUserId).length)
      : null;

    const myAssigned = (user?.role === "EMPLOYEE")
      ? recentTasks.filter(t => t.assignedToUserId === user.id).length
      : null;

    const myCreated = (user?.role === "EMPLOYEE")
      ? recentTasks.filter(t => t.createdByUserId === user.id).length
      : null;

    return { allTasksFromStatsTotal, unassigned, myAssigned, myCreated };
  }, [recentTasks, stats.total, user]);

  // ✅ Chart colors
  const statusColors = useMemo(() => ([
    "rgba(255, 193, 7, 0.85)",   // pending - warning
    "rgba(13, 202, 240, 0.85)",  // follow-up - info
    "rgba(108, 117, 125, 0.85)", // reverted - secondary
    "rgba(25, 135, 84, 0.85)",   // completed - success
    "rgba(13, 110, 253, 0.85)"   // in-progress - primary
  ]), []);

  const serviceColors = useMemo(() => ([
    "rgba(13, 110, 253, 0.75)",
    "rgba(25, 135, 84, 0.75)",
    "rgba(255, 193, 7, 0.75)",
    "rgba(220, 53, 69, 0.75)",
  ]), []);

  const doughnutData = useMemo(() => ({
    labels: STATUSES,
    datasets: [
      {
        label: "Tasks",
        data: STATUSES.map(s => stats.byStatus?.[s] || 0),
        backgroundColor: statusColors,
        borderColor: statusColors.map(c => c.replace("0.85", "1")),
        borderWidth: 1,
      }
    ]
  }), [stats, statusColors]);

  const barData = useMemo(() => ({
    labels: SERVICES,
    datasets: [
      {
        label: "Tasks",
        data: SERVICES.map(s => stats.byService?.[s] || 0),
        backgroundColor: serviceColors,
        borderColor: serviceColors.map(c => c.replace("0.75", "1")),
        borderWidth: 1,
      }
    ]
  }), [stats, serviceColors]);

  // ✅ Chart options: stop huge stretching
  const doughnutOptions = useMemo(() => ({
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true }
    }
  }), []);

  const barOptions = useMemo(() => ({
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }), []);

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h4 className="mb-0">Dashboard</h4>
          <div className="text-muted small">
            {user?.role === "ADMIN" ? "Admin overview" : "Your task overview"}
          </div>
        </div>

        <button className="btn btn-outline-secondary btn-sm" onClick={load}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {/* KPI cards */}
      <div className="row g-3 mt-1">
        <div className="col-12 col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Total Tasks</div>
              <div className="fs-3 fw-bold">{computed.allTasksFromStatsTotal}</div>
            </div>
          </div>
        </div>

        {user?.role === "ADMIN" && (
          <>
            <div className="col-12 col-md-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted small">Employees</div>
                  <div className="fs-3 fw-bold">{employeeCount ?? "-"}</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted small">Unassigned (recent)</div>
                  <div className="fs-3 fw-bold">{computed.unassigned ?? "-"}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {user?.role === "EMPLOYEE" && (
          <>
            <div className="col-12 col-md-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted small">Assigned to you (recent)</div>
                  <div className="fs-3 fw-bold">{computed.myAssigned ?? "-"}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted small">Created by you (recent)</div>
                  <div className="fs-3 fw-bold">{computed.myCreated ?? "-"}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts + recent tasks */}
      <div className="row g-3 mt-3">
        <div className="col-12 col-lg-5">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">Tasks by Status</h6>

              {/* ✅ fixed height so it never becomes huge */}
              <div style={{ height: 300 }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>

              <div className="text-muted small mt-3">
                Status counts are role-scoped automatically.
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">Tasks by Service</h6>

              {/* ✅ fixed height */}
              <div style={{ height: 300 }}>
                <Bar data={barData} options={barOptions} />
              </div>

              <div className="text-muted small mt-3">
                Useful to see which service is busiest.
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <h6 className="mb-0">Recent Tasks</h6>
                <a className="btn btn-sm btn-outline-primary" href="/tasks">Open Tasks</a>
              </div>

              <div className="mt-3">
                {recentTasks.length === 0 ? (
                  <div className="text-muted">No tasks yet.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Task</th>
                          <th>Service</th>
                          <th>Status</th>
                          <th>Client</th>
                          <th>Org</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTasks.map(t => (
                          <tr key={t.id}>
                            <td>{t.id}</td>
                            <td>{t.taskName}</td>
                            <td>{t.service}</td>
                            <td>
                              <span className={`badge rounded-pill px-3 ${statusBadgeClass(t.status)}`}>
                                {t.status}
                              </span>
                            </td>
                            <td>{t.Client?.name || "-"}</td>
                            <td>{t.Organization?.name || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
