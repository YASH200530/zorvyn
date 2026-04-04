const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initDB } = require("./config/db");
const apiRoutes = require("./routes"); // Automatically defaults to ./routes/index.js

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main API Routes entry point
app.use("/api", apiRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

async function startServer() {
  try {
    await initDB();
    console.log("Database initialized successfully.");
    
    if (require.main === module) {
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
