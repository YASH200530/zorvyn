const { z } = require("zod");
const { getDB } = require("../config/db");

const exportRecords = async (req, res) => {
  try {
    const db = await getDB();
    const records = await db.all("SELECT * FROM records ORDER BY date DESC");

    let csv = "Date,Category,Type,Amount,Notes,Created_By\n";
    records.forEach(r => {
      const safeNotes = r.notes ? r.notes.replace(/,/g, " ") : "";
      csv += `${r.date},${r.category},${r.type},${r.amount},${safeNotes},${r.created_by}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="finance_records_' + new Date().toISOString().split('T')[0] + '.csv"');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate CSV export" });
  }
};

const getRecords = async (req, res) => {
  const schema = z.object({
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().optional(),
    limit: z.coerce.number().optional().default(50),
    offset: z.coerce.number().optional().default(0),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  });

  try {
    const queryParams = schema.parse(req.query);
    const db = await getDB();
    
    let query = "SELECT * FROM records WHERE 1=1";
    const params = [];

    if (queryParams.type) {
      query += " AND type = ?";
      params.push(queryParams.type);
    }
    if (queryParams.category) {
      query += " AND category LIKE ?";
      params.push(`%${queryParams.category}%`);
    }
    if (queryParams.startDate) {
      query += " AND date >= ?";
      params.push(queryParams.startDate);
    }
    if (queryParams.endDate) {
      query += " AND date <= ?";
      params.push(queryParams.endDate);
    }

    query += " ORDER BY date DESC LIMIT ? OFFSET ?";
    params.push(queryParams.limit, queryParams.offset);

    const records = await db.all(query, params);
    
    // Count total for pagination
    let countQuery = "SELECT COUNT(*) as count FROM records WHERE 1=1";
    const countParams = [];
    if (queryParams.type) { countQuery += " AND type = ?"; countParams.push(queryParams.type); }
    if (queryParams.category) { countQuery += " AND category LIKE ?"; countParams.push(`%${queryParams.category}%`); }
    if (queryParams.startDate) { countQuery += " AND date >= ?"; countParams.push(queryParams.startDate); }
    if (queryParams.endDate) { countQuery += " AND date <= ?"; countParams.push(queryParams.endDate); }
    
    const total = await db.get(countQuery, countParams);

    res.json({ data: records, total: total.count, limit: queryParams.limit, offset: queryParams.offset });
  } catch (err) {
    if (err && err.issues) return res.status(400).json({ error: err.issues.map(e => e.message).join(", ") });
    res.status(500).json({ error: "Internal server error" });
  }
};

const createRecord = async (req, res) => {
  const schema = z.object({
    amount: z.number().positive(),
    type: z.enum(['income', 'expense']),
    category: z.string().min(1),
    date: z.string(), // ISO date string
    notes: z.string().optional()
  });

  try {
    const body = schema.parse(req.body);
    const db = await getDB();

    const result = await db.run(
      "INSERT INTO records (amount, type, category, date, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [body.amount, body.type, body.category, body.date, body.notes || "", req.user.id]
    );

    const newRecord = await db.get("SELECT * FROM records WHERE id = ?", [result.lastID]);
    res.status(201).json(newRecord);
  } catch (err) {
    if (err && err.issues) return res.status(400).json({ error: err.issues.map(e => e.message).join(", ") });
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateRecord = async (req, res) => {
  const schema = z.object({
    amount: z.number().positive().optional(),
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().min(1).optional(),
    date: z.string().optional(),
    notes: z.string().optional()
  });

  try {
    const { id } = req.params;
    const body = schema.parse(req.body);
    const db = await getDB();

    const existing = await db.get("SELECT * FROM records WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Record not found" });

    const updated = { ...existing, ...body };

    await db.run(
      "UPDATE records SET amount = ?, type = ?, category = ?, date = ?, notes = ? WHERE id = ?",
      [updated.amount, updated.type, updated.category, updated.date, updated.notes, id]
    );

    const checkRefresh = await db.get("SELECT * FROM records WHERE id = ?", [id]);
    res.json(checkRefresh);
  } catch (err) {
    if (err && err.issues) return res.status(400).json({ error: err.issues.map(e => e.message).join(", ") });
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    const existing = await db.get("SELECT * FROM records WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Record not found" });

    await db.run("DELETE FROM records WHERE id = ?", [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { exportRecords, getRecords, createRecord, updateRecord, deleteRecord };
