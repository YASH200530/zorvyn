import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();

  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      toast.success(`Welcome back!`);
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: "100vh", background: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop') center/cover" }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)' }}></div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel" style={{ padding: "3rem", width: "100%", maxWidth: "420px", position: "relative", zIndex: 10 }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 className="heading-1 text-gradient" style={{ fontSize: "2rem" }}>Zorvyn Finance</h2>
          <p style={{ color: "var(--text-secondary)" }}>Enter your credentials to continue</p>
        </div>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger-color)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid rgba(239, 68, 68, 0.2)", fontSize: "0.875rem", textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>Username</label>
            <input
              type="text"
              className="input-base"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              required
            />
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>Password</label>
            <input
              type="password"
              className="input-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            <LogIn size={18} /> Sign In
          </button>
        </form>
        
        <div style={{ marginTop: "2rem", fontSize: "0.875rem", color: "var(--text-secondary)", textAlign: "center" }}>
          Default Admin: <strong>admin / admin</strong>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
