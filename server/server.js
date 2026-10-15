require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ok", database: "connected" });
  } catch (_error) {
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.use("/api/tasks", taskRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body must be valid JSON." });
  }
  res.status(500).json({ message: "An unexpected server error occurred." });
});

app.listen(PORT, () => {
  console.log(`Task Manager API listening on http://localhost:${PORT}`);
});
