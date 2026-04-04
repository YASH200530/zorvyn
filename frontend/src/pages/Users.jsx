import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Plus, Edit2, ShieldAlert, CheckCircle, XCircle } from "lucide-react";

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({ 
    username: "", 
    password: "", 
    role: "viewer", 
    status: "active" 
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentUser) {
        // Edit User (password cannot be edited, username cannot be edited, only role and status)
        await api.put(`/users/${currentUser.id}`, {
          role: formData.role,
          status: formData.status
        });
      } else {
        // Create User
        await api.post("/users", {
          username: formData.username,
          password: formData.password,
          role: formData.role
        });
        toast.success("User successfully created!");
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const openNewUser = () => {
    setCurrentUser(null);
    setFormData({ username: "", password: "", role: "viewer", status: "active" });
    setShowModal(true);
  };

  const openEditUser = (u) => {
    setCurrentUser(u);
    setFormData({ username: u.username, password: "", role: u.role, status: u.status });
    setShowModal(true);
  };

  if (user.role !== 'admin') {
    return (
      <div className="flex-center" style={{ height: "60vh", flexDirection: 'column', color: 'var(--danger-color)' }}>
        <ShieldAlert size={48} style={{ marginBottom: "1rem" }} />
        <h2 className="heading-2">Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-panel" style={{ height: '80px', width: '100%', animation: 'pulse 1.5s infinite' }} />
      <div className="glass-panel" style={{ height: '400px', width: '100%', animation: 'pulse 1.5s infinite' }} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="flex-between" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="heading-1" style={{ marginBottom: "0.25rem" }}>User Management</h1>
          <p style={{ color: "var(--text-secondary)" }}>Manage system access and roles.</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={openNewUser}>
          <Plus size={18} /> Add User
        </button>
      </header>

      <div className="glass-panel" style={{ padding: "1rem", overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <motion.tr key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <td style={{ fontWeight: '500' }}>{u.username}</td>
                <td style={{ textTransform: 'capitalize' }}>
                  <span style={{ 
                    color: u.role === 'admin' ? 'var(--danger-color)' : (u.role === 'analyst' ? 'var(--accent-color)' : 'var(--text-secondary)'),
                    fontWeight: '600'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: u.status === 'active' ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                    {u.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {u.status}
                  </span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={{ textAlign: "right" }}>
                   <button onClick={() => openEditUser(u)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                     <Edit2 size={16} />
                   </button>
                </td>
              </motion.tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem" }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
      {showModal && (
        <div className="flex-center" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 100 }}>
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="glass-panel" style={{ padding: "2rem", width: "100%", maxWidth: "450px" }}>
            <h2 className="heading-2" style={{ marginBottom: "1.5rem" }}>
              {currentUser ? "Edit User Properties" : "Create New User"}
            </h2>
            <form onSubmit={handleSave}>
              {!currentUser && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Username</label>
                    <input type="text" required className="input-base" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password</label>
                    <input type="password" required className="input-base" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                </>
              )}
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Role</label>
                <select className="input-base" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  <option value="viewer">Viewer</option>
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {currentUser && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Status</label>
                  <select className="input-base" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save User</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Users;
