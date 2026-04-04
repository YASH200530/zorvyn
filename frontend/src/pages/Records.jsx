import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Plus, Edit2, Trash2, Download } from "lucide-react";

const Records = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const [formData, setFormData] = useState({ amount: "", type: "expense", category: "", date: new Date().toISOString().split("T")[0], notes: "" });

  const [filters, setFilters] = useState({ type: "", category: "", startDate: "", endDate: "" });

  const fetchRecords = async () => {
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await api.get("/records", { params });
      setRecords(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const handleExportCSV = async () => {
    try {
      const res = await api.get("/records/export", { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'finance_records.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Export successful!");
    } catch (err) {
      console.error("Export failed", err);
      toast.error("Failed to export records.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        await api.delete(`/records/${id}`);
        toast.success("Record deleted");
        fetchRecords();
      } catch (err) {
        toast.error("Could not delete record");
        console.error(err);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...formData, amount: parseFloat(formData.amount), date: new Date(formData.date).toISOString() };
    try {
      if (currentRecord) {
        await api.put(`/records/${currentRecord.id}`, payload);
        toast.success("Record updated");
      } else {
        await api.post("/records", payload);
        toast.success("Record created");
      }
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      toast.error("Error saving: " + (err.response?.data?.error || err.message));
    }
  };

  const openNewRecord = () => {
    setCurrentRecord(null);
    setFormData({ amount: "", type: "expense", category: "", date: new Date().toISOString().split("T")[0], notes: "" });
    setShowModal(true);
  };

  const openEditRecord = (record) => {
    setCurrentRecord(record);
    setFormData({ ...record, date: record.date.split("T")[0] });
    setShowModal(true);
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
       <div className="glass-panel" style={{ height: '60px', width: '100%', animation: 'pulse 1.5s infinite' }} />
       <div className="glass-panel" style={{ height: '400px', width: '100%', animation: 'pulse 1.5s infinite' }} />
    </div>
  );
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="flex-between" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="heading-1" style={{ marginBottom: "0.25rem" }}>Financial Records</h1>
          <p style={{ color: "var(--text-secondary)" }}>Manage all incoming and outgoing transitions.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleExportCSV}>
            <Download size={18} /> Export CSV
          </button>
          {user.role === 'admin' && (
            <button className="btn-primary" style={{ width: 'auto' }} onClick={openNewRecord}>
              <Plus size={18} /> Add Record
            </button>
          )}
        </div>
      </header>

      <div className="glass-panel" style={{ padding: "1rem", marginBottom: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 150px" }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: "var(--text-secondary)" }}>Type</label>
          <select className="input-base" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div style={{ flex: "1 1 150px" }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: "var(--text-secondary)" }}>Category</label>
          <input type="text" className="input-base" placeholder="Filter by category..." value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} />
        </div>
        <div style={{ flex: "1 1 150px" }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: "var(--text-secondary)" }}>Start Date</label>
          <input type="date" className="input-base" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
        </div>
        <div style={{ flex: "1 1 150px" }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: "var(--text-secondary)" }}>End Date</label>
          <input type="date" className="input-base" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
        </div>
        <button className="btn-secondary" style={{ width: 'auto' }} onClick={() => setFilters({ type: "", category: "", startDate: "", endDate: "" })}>
          Clear Filters
        </button>
      </div>

      <div className="glass-panel" style={{ padding: "1rem", overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Notes</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              {user.role === 'admin' && <th style={{ textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <motion.tr key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td style={{ fontWeight: '500' }}>{r.category}</td>
                <td>
                  <span className={`badge ${r.type === 'income' ? 'badge-income' : 'badge-expense'}`} style={{ textTransform: 'capitalize' }}>
                    {r.type}
                  </span>
                </td>
                <td style={{ color: "var(--text-secondary)" }}>{r.notes || "-"}</td>
                <td style={{ textAlign: "right", fontWeight: '600' }}>{formatter.format(r.amount)}</td>
                {user.role === 'admin' && (
                  <td style={{ textAlign: "right" }}>
                     <button onClick={() => openEditRecord(r)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginRight: '0.75rem' }}><Edit2 size={16} /></button>
                     <button onClick={() => handleDelete(r.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </td>
                )}
              </motion.tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem" }}>No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
      {showModal && (
        <div className="flex-center" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 100 }}>
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="glass-panel" style={{ padding: "2rem", width: "100%", maxWidth: "500px" }}>
            <h2 className="heading-2" style={{ marginBottom: "1.5rem" }}>
              {currentRecord ? "Edit Record" : "New Record"}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ display: "flex", gap: "1rem" }}>
                 <div style={{ flex: 1 }}>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Type</label>
                   <select className="input-base" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                     <option value="expense">Expense</option>
                     <option value="income">Income</option>
                   </select>
                 </div>
                 <div style={{ flex: 1 }}>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Amount</label>
                   <input type="number" step="0.01" min="0" required className="input-base" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                 </div>
              </div>
              
              <div style={{ display: "flex", gap: "1rem" }}>
                 <div style={{ flex: 1 }}>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category</label>
                   <input type="text" required className="input-base" placeholder="e.g. Utilities" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                 </div>
                 <div style={{ flex: 1 }}>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Date</label>
                   <input type="date" required className="input-base" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                 </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Notes</label>
                <input type="text" className="input-base" placeholder="Optional description..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Record</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Records;
