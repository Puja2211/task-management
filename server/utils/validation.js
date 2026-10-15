const STATUSES = ["Pending", "In Progress", "Completed"];
const PRIORITIES = ["Low", "Medium", "High"];

function validateTask(input, partial = false) {
  const errors = {};
  const data = {};

  if (!partial || Object.prototype.hasOwnProperty.call(input, "title")) {
    const title = typeof input.title === "string" ? input.title.trim() : "";
    if (!title) errors.title = "Title is required.";
    else if (title.length > 255) errors.title = "Title must be 255 characters or fewer.";
    else data.title = title;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, "description")) {
    if (input.description != null && typeof input.description !== "string") {
      errors.description = "Description must be text.";
    } else {
      data.description = input.description ? input.description.trim() : null;
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, "status")) {
    const status = input.status || "Pending";
    if (!STATUSES.includes(status)) errors.status = "Choose a valid status.";
    else data.status = status;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, "priority")) {
    const priority = input.priority || "Medium";
    if (!PRIORITIES.includes(priority)) errors.priority = "Choose a valid priority.";
    else data.priority = priority;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, "due_date")) {
    const dueDate = input.due_date || null;
    if (dueDate !== null && (typeof dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate))) {
      errors.due_date = "Due date must use YYYY-MM-DD format.";
    } else {
      data.due_date = dueDate;
    }
  }

  return { errors, data };
}

module.exports = { validateTask, STATUSES, PRIORITIES };
