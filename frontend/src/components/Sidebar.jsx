import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ReceiptText, Users, LogOut } from "lucide-react";
import { motion } from "framer-motion";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} />, roles: ["viewer", "analyst", "admin"] },
    { name: "Records", path: "/records", icon: <ReceiptText size={20} />, roles: ["analyst", "admin"] },
    { name: "Users", path: "/users", icon: <Users size={20} />, roles: ["admin"] },
  ];

  return (
    <div style={{ width: "260px", padding: "2rem 1.5rem", borderRight: "1px solid var(--panel-border)", background: "var(--panel-bg)" }}>
      <div style={{ marginBottom: "3rem" }}>
        <h1 className="heading-2 text-gradient">Zorvyn Finance</h1>
        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
          Logged in as: <span style={{ color: "var(--accent-color)", fontWeight: "600", textTransform: 'capitalize' }}>{user.role}</span>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", height: "calc(100% - 150px)" }}>
        {links.map((link) => {
          if (!link.roles.includes(user.role)) return null;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                color: isActive ? "white" : "var(--text-secondary)",
                background: isActive ? "rgba(59, 130, 246, 0.2)" : "transparent",
                fontWeight: isActive ? "600" : "500",
                transition: "all 0.2s ease"
              }}
            >
              {link.icon}
              {link.name}
            </Link>
          );
        })}
        
        <div style={{ marginTop: 'auto' }}>
          <button 
            onClick={logout} 
            className="btn-secondary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: "var(--danger-color)", borderColor: "rgba(239, 68, 68, 0.2)" }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
