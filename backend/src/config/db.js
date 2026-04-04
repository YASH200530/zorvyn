const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const bcrypt = require("bcryptjs");

let dbInstance = null;

async function getDB() {
  if (dbInstance) return dbInstance;
  
  dbInstance = await open({
    filename: "./finance.db",
    driver: sqlite3.Database,
  });
  
  return dbInstance;
}

async function initDB() {
  const db = await getDB();
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('viewer', 'analyst', 'admin')) NOT NULL DEFAULT 'viewer',
      status TEXT CHECK(status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      category TEXT NOT NULL,
      date DATETIME NOT NULL,
      notes TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id)
    );
  `);

  // Seed Admin user if not exists
  const admin = await db.get("SELECT * FROM users WHERE username = ?", ["admin"]);
  if (!admin) {
    const hash = await bcrypt.hash("admin", 10);
    await db.run(
      "INSERT INTO users (username, password_hash, role, status) VALUES (?, ?, ?, ?)",
      ["admin", hash, "admin", "active"]
    );
    console.log("Admin user seeded (admin/admin)");
  }

  // Seed initial records if empty
  const count = await db.get("SELECT COUNT(*) as count FROM records");
  if (count.count === 0) {
    const user = await db.get("SELECT id FROM users WHERE username = 'admin'");
    const seedRecords = [
      { amount: 5000, type: 'income', category: 'Salary', date: new Date().toISOString(), notes: 'Monthly salary', created_by: user.id },
      { amount: 1500, type: 'expense', category: 'Rent', date: new Date().toISOString(), notes: 'Apartment rent', created_by: user.id },
      { amount: 300, type: 'expense', category: 'Food', date: new Date().toISOString(), notes: 'Groceries', created_by: user.id },
      { amount: 200, type: 'income', category: 'Freelance', date: new Date().toISOString(), notes: 'Design work', created_by: user.id },
    ];
    for (const r of seedRecords) {
      await db.run(
        "INSERT INTO records (amount, type, category, date, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)",
        [r.amount, r.type, r.category, r.date, r.notes, r.created_by]
      );
    }
    console.log("Initial records seeded.");
  }

  return db;
}

module.exports = { getDB, initDB };
