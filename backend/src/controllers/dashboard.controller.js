const { getDB } = require("../config/db");

const getSummary = async (req, res) => {
  // All roles can view summary
  try {
    const db = await getDB();
    
    // Totals
    const totals = await db.all("SELECT type, SUM(amount) as total FROM records GROUP BY type");
    let income = 0, expense = 0;
    totals.forEach(t => {
      if (t.type === 'income') income = t.total;
      if (t.type === 'expense') expense = t.total;
    });

    // Category totals for expenses
    const categoryTotals = await db.all(
      "SELECT category, SUM(amount) as total FROM records WHERE type = 'expense' GROUP BY category ORDER BY total DESC LIMIT 5"
    );

    // Recent activity
    const recentActivity = await db.all(
      "SELECT id, amount, type, category, date FROM records ORDER BY date DESC LIMIT 5"
    );

    // Monthly Trends (simple group by strftime)
    const trends = await db.all(
      "SELECT strftime('%Y-%m', date) as month, type, SUM(amount) as total FROM records GROUP BY month, type ORDER BY month ASC LIMIT 12"
    );

    res.json({
      totalIncome: income,
      totalExpenses: expense,
      netBalance: income - expense,
      categories: categoryTotals,
      recentActivity,
      trends
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getSummary };
