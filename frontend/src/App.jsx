import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";
import Users from "./pages/Users";
import Sidebar from "./components/Sidebar";
import { Toaster } from "react-hot-toast";
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{ height: "100vh" }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "2rem" }}>{children}</div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#222', color: '#fff', borderRadius: '8px' } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/records"
          element={
            <PrivateRoute roles={["analyst", "admin"]}>
              <Records />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute roles={["admin"]}>
              <Users />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
