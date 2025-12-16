import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Clients from "./pages/Clients";
import Organizations from "./pages/Organizations";
import Employees from "./pages/Employees";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

export default function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    setIsAuth(!!localStorage.getItem("token"));
  }, []);

  const handleLogin = () => {
    setIsAuth(true);
  };

  const handleLogout = () => {
    setIsAuth(false);
  };

  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            isAuth ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
          }
        />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout onLogout={handleLogout}>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Tasks */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <MainLayout onLogout={handleLogout}>
                <Tasks />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Clients */}
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <MainLayout onLogout={handleLogout}>
                <Clients />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Organizations */}
        <Route
          path="/organizations"
          element={
            <ProtectedRoute>
              <MainLayout onLogout={handleLogout}>
                <Organizations />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Employees (Admin only handled inside page) */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <MainLayout onLogout={handleLogout}>
                <Employees />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
