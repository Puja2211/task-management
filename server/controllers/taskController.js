const pool = require("../config/db");
const { validateTask, STATUSES, PRIORITIES } = require("../utils/validation");

function isValidId(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0;
}

async function listTasks(req, res, next) {
  try {
    const { status, priority, search } = req.query;
    const conditions = [];
    const params = [];

    if (status && status !== "All") {
      if (!STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status filter." });
      conditions.push("status = ?");
      params.push(status);
    }
    if (priority && priority !== "All") {
      if (!PRIORITIES.includes(priority)) return res.status(400).json({ message: "Invalid priority filter." });
      conditions.push("priority = ?");
      params.push(priority);
    }
    if (typeof search === "string" && search.trim()) {
      conditions.push("(title LIKE ? OR description LIKE ?)");
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows] = await pool.execute(
      `SELECT id, title, description, status, priority, due_date, created_at, updated_at
       FROM tasks ${where}
       ORDER BY
         CASE status WHEN 'In Progress' THEN 1 WHEN 'Pending' THEN 2 ELSE 3 END,
         CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END,
         created_at DESC`,
      params
    );
    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
}

async function getTask(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
    const [rows] = await pool.execute("SELECT * FROM tasks WHERE id = ?", [Number(req.params.id)]);
    if (!rows.length) return res.status(404).json({ message: "Task not found." });
    res.json({ data: rows[0] });
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const { errors, data } = validateTask(req.body || {});
    if (Object.keys(errors).length) return res.status(400).json({ message: "Please correct the highlighted fields.", errors });

    const [result] = await pool.execute(
      "INSERT INTO tasks (title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)",
      [data.title, data.description, data.status, data.priority, data.due_date]
    );
    const [rows] = await pool.execute("SELECT * FROM tasks WHERE id = ?", [result.insertId]);
    res.status(201).json({ message: "Task created successfully.", data: rows[0] });
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
    const { errors, data } = validateTask(req.body || {});
    if (Object.keys(errors).length) return res.status(400).json({ message: "Please correct the highlighted fields.", errors });

    const [result] = await pool.execute(
      "UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ?",
      [data.title, data.description, data.status, data.priority, data.due_date, Number(req.params.id)]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Task not found." });
    const [rows] = await pool.execute("SELECT * FROM tasks WHERE id = ?", [Number(req.params.id)]);
    res.json({ message: "Task updated successfully.", data: rows[0] });
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
    const { status } = req.body || {};
    if (!STATUSES.includes(status)) return res.status(400).json({ message: "Choose a valid status." });

    const [result] = await pool.execute("UPDATE tasks SET status = ? WHERE id = ?", [status, Number(req.params.id)]);
    if (!result.affectedRows) return res.status(404).json({ message: "Task not found." });
    const [rows] = await pool.execute("SELECT * FROM tasks WHERE id = ?", [Number(req.params.id)]);
    res.json({ message: "Task status updated.", data: rows[0] });
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
    const [result] = await pool.execute("DELETE FROM tasks WHERE id = ?", [Number(req.params.id)]);
    if (!result.affectedRows) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    next(error);
  }
}

module.exports = { listTasks, getTask, createTask, updateTask, updateStatus, deleteTask };
