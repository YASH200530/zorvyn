import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from "../api";
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart2 } from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/dashboard/summary");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
       <div className="glass-panel" style={{ height: '150px', width: '100%', animation: 'pulse 1.5s infinite' }} />
       <div className="glass-panel" style={{ height: '300px', width: '100%', animation: 'pulse 1.5s infinite' }} />
       <div className="glass-panel" style={{ height: '400px', width: '100%', animation: 'pulse 1.5s infinite' }} />
    </div>
  );

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 className="heading-1">Dashboard Overview</h1>
        <p style={{ color: "var(--text-secondary)" }}>Welcome to your financial summary</p>
      </header>

      {data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
             <motion.div className="glass-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
               <div className="flex-between" style={{ marginBottom: "1rem" }}>
                 <h3 style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Total Income</h3>
                 <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "0.5rem", borderRadius: "8px", color: "var(--success-color)" }}>
                   <TrendingUp size={20} />
                 </div>
               </div>
               <div style={{ fontSize: "2rem", fontWeight: "700" }}>{formatter.format(data.totalIncome)}</div>
             </motion.div>

             <motion.div className="glass-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
               <div className="flex-between" style={{ marginBottom: "1rem" }}>
                 <h3 style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Total Expenses</h3>
                 <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "0.5rem", borderRadius: "8px", color: "var(--danger-color)" }}>
                   <TrendingDown size={20} />
                 </div>
               </div>
               <div style={{ fontSize: "2rem", fontWeight: "700" }}>{formatter.format(data.totalExpenses)}</div>
             </motion.div>

             <motion.div className="glass-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.05))', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
               <div className="flex-between" style={{ marginBottom: "1rem" }}>
                 <h3 style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Net Balance</h3>
                 <div style={{ background: "rgba(59, 130, 246, 0.2)", padding: "0.5rem", borderRadius: "8px", color: "var(--accent-color)" }}>
                   <DollarSign size={20} />
                 </div>
               </div>
               <div style={{ fontSize: "2rem", fontWeight: "700" }}>{formatter.format(data.netBalance)}</div>
             </motion.div>
          </div>

          <motion.div className="glass-panel" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h3 className="heading-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <BarChart2 size={20} /> Monthly Trends
            </h3>
            {data.trends && data.trends.length > 0 ? (
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={
                    // Transform trends data for stacked formatting
                    Object.values(data.trends.reduce((acc, curr) => {
                      if (!acc[curr.month]) acc[curr.month] = { month: curr.month, income: 0, expense: 0 };
                      acc[curr.month][curr.type] = curr.total;
                      return acc;
                    }, {}))
                  }>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                    <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickFormatter={(val) => `$${val}`} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#222', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="var(--success-color)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="var(--danger-color)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ color: "var(--text-secondary)" }}>No trend data available.</p>
            )}
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
            <motion.div className="glass-panel" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} style={{ padding: "1.5rem" }}>
              <h3 className="heading-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} /> Recent Activity
              </h3>
              {data.recentActivity.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>No recent activity.</p>
              ) : (
                <table className="data-table">
                  <tbody>
                    {data.recentActivity.map((act) => (
                      <tr key={act.id}>
                        <td>{act.category}</td>
                        <td style={{ textAlign: "right" }}>
                           <span className={`badge ${act.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                             {act.type === 'income' ? '+' : '-'}{formatter.format(act.amount)}
                           </span>
                        </td>
                        <td style={{ textAlign: "right", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                          {new Date(act.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>

            <motion.div className="glass-panel" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} style={{ padding: "1.5rem" }}>
              <h3 className="heading-2">Top Expense Categories</h3>
              {data.categories.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>No expenses recorded.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                   {data.categories.map((cat, i) => {
                     const max = data.categories[0].total;
                     const percent = (cat.total / max) * 100;
                     return (
                       <div key={cat.category}>
                         <div className="flex-between" style={{ marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                           <span>{cat.category}</span>
                           <span style={{ fontWeight: '500' }}>{formatter.format(cat.total)}</span>
                         </div>
                         <div style={{ height: "8px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "4px", overflow: "hidden" }}>
                           <motion.div 
                             initial={{ width: 0 }} 
                             animate={{ width: `${percent}%` }}
                             transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                             style={{ height: "100%", background: "var(--danger-color)", borderRadius: "4px" }}
                           />
                         </div>
                       </div>
                     )
                   })}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;
