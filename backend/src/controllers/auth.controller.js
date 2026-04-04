const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { getDB } = require("../config/db");
const { JWT_SECRET } = require("../middlewares/authMiddleware");

const login = async (req, res) => {
  const schema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  });

  try {
    const { username, password } = schema.parse(req.body);
    const db = await getDB();
    
    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (!user || user.status === "inactive") {
      return res.status(401).json({ error: "Invalid credentials or inactive user" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    if (err && err.issues) return res.status(400).json({ error: err.issues.map(e => e.message).join(", ") });
    res.status(500).json({ error: "Internal server error" });
  }
};

const me = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, me };
