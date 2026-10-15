const { Op, col, fn } = require("sequelize");
const Task = require("../models/task");
const { validateTask, STATUSES, PRIORITIES } = require("../utils/validation");

function isValidId(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0;
}

async function listTasks(req, res, next) {
  try {
    const { status, priority, search } = req.query;
    const where = {};

    if (status && status !== "All") {
      if (!STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status filter." });
      where.status = status;
    }
    if (priority && priority !== "All") {
      if (!PRIORITIES.includes(priority)) return res.status(400).json({ message: "Invalid priority filter." });
      where.priority = priority;
    }
    if (typeof search === "string" && search.trim()) {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: term } },
        { description: { [Op.like]: term } }
      ];
    }

    const rows = await Task.findAll({
      attributes: ["id", "title", "description", "status", "priority", "due_date", "created_at", "updated_at"],
      where,
      order: [
        [fn("FIELD", col("status"), "In Progress", "Pending", "Completed"), "ASC"],
        [fn("FIELD", col("priority"), "High", "Medium", "Low"), "ASC"],
        ["created_at", "DESC"]
      ]
    });
    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
}

async function getTask(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
    const task = await Task.findByPk(Number(req.params.id));
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json({ data: task });
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const { errors, data } = validateTask(req.body || {});
    if (Object.keys(errors).length) return res.status(400).json({ message: "Please correct the highlighted fields.", errors });

    const task = await Task.create(data);
    res.status(201).json({ message: "Task created successfully.", data: task });
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
    const { errors, data } = validateTask(req.body || {});
    if (Object.keys(errors).length) return res.status(400).json({ message: "Please correct the highlighted fields.", errors });

    const task = await Task.findByPk(Number(req.params.id));
    if (!task) return res.status(404).json({ message: "Task not found." });
    await task.update(data);
    res.json({ message: "Task updated successfully.", data: task });
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
    const { status } = req.body || {};
    if (!STATUSES.includes(status)) return res.status(400).json({ message: "Choose a valid status." });

    const task = await Task.findByPk(Number(req.params.id));
    if (!task) return res.status(404).json({ message: "Task not found." });
    await task.update({ status });
    res.json({ message: "Task status updated.", data: task });
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
    const deleted = await Task.destroy({ where: { id: Number(req.params.id) } });
    if (!deleted) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    next(error);
  }
}

module.exports = { listTasks, getTask, createTask, updateTask, updateStatus, deleteTask };
