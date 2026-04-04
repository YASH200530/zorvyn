const bcrypt = require("bcryptjs");
const { z } = require("zod");
const { getDB } = require("../config/db");

const getUsers = async (req, res) => {
  try {
    const db = await getDB();
    const users = await db.all("SELECT id, username, role, status, created_at FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const createUser = async (req, res) => {
  const schema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    role: z.enum(['viewer', 'analyst', 'admin']).default('viewer')
  });

  try {
    const body = schema.parse(req.body);
    const db = await getDB();

    const existing = await db.get("SELECT * FROM users WHERE username = ?", [body.username]);
    if (existing) return res.status(400).json({ error: "Username already exists" });

    const hash = await bcrypt.hash(body.password, 10);
    const result = await db.run(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
      [body.username, hash, body.role]
    );

    res.status(201).json({ id: result.lastID, username: body.username, role: body.role });
  } catch (err) {
    if (err && err.issues) return res.status(400).json({ error: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ") });
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  const schema = z.object({
    role: z.enum(['viewer', 'analyst', 'admin']).optional(),
    status: z.enum(['active', 'inactive']).optional()
  });

  try {
    const body = schema.parse(req.body);
    const db = await getDB();
    
    // Check if user exists
    const existing = await db.get("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (!existing) return res.status(404).json({ error: "User not found" });

    // Prevent changing the last admin to inactive
    if (existing.role === 'admin' && (body.role !== 'admin' || body.status === 'inactive')) {
      const adminCount = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active'");
      if (adminCount.count <= 1) return res.status(403).json({ error: "Cannot modify or deactivate the last active admin." });
    }

    const updatedRole = body.role || existing.role;
    const updatedStatus = body.status || existing.status;

    await db.run(
      "UPDATE users SET role = ?, status = ? WHERE id = ?",
      [updatedRole, updatedStatus, req.params.id]
    );

    res.json({ id: req.params.id, role: updatedRole, status: updatedStatus });
  } catch (err) {
    if (err && err.issues) return res.status(400).json({ error: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ") });
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getUsers, createUser, updateUser };
