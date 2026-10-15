import { CalendarDays, MoreHorizontal, Pencil, Trash2, CheckCircle2, Circle, Clock3 } from "lucide-react";
import { useState } from "react";

function formatDate(date) {
  if (!date) return null;
  const parsed = new Date(`${String(date).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

export default function TaskItem({ task, onEdit, onDelete, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dueDate = formatDate(task.due_date);
  const overdue = dueDate && task.status !== "Completed" && new Date(`${String(task.due_date).slice(0, 10)}T23:59:59`) < new Date();

  return (
    <article className={`task-card ${task.status === "Completed" ? "task-card-complete" : ""}`}>
      <button
        className={`task-check ${task.status === "Completed" ? "checked" : ""}`}
        title={task.status === "Completed" ? "Mark as pending" : "Mark as completed"}
        aria-label={task.status === "Completed" ? "Mark task as pending" : "Mark task as completed"}
        onClick={() => onStatusChange(task.id, task.status === "Completed" ? "Pending" : "Completed")}
      >
        {task.status === "Completed" ? <CheckCircle2 size={22} /> : <Circle size={22} />}
      </button>

      <div className="task-main">
        <div className="task-heading">
          <h3>{task.title}</h3>
          <span className={`priority priority-${task.priority.toLowerCase()}`}>
            <span className="priority-dot" /> {task.priority}
          </span>
        </div>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <span className={`status status-${task.status.toLowerCase().replace(" ", "-")}`}>
            {task.status}
          </span>
          {dueDate && (
            <span className={`due-date ${overdue ? "due-overdue" : ""}`}>
              <CalendarDays size={14} /> {overdue ? "Overdue · " : ""}{dueDate}
            </span>
          )}
        </div>
      </div>

      <div className="task-menu-wrap">
        <button className="icon-button task-menu-button" aria-label="Task actions" onClick={() => setMenuOpen((v) => !v)}>
          <MoreHorizontal size={20} />
        </button>
        {menuOpen && (
          <>
            <button className="menu-dismiss" aria-label="Close task menu" onClick={() => setMenuOpen(false)} />
            <div className="task-menu">
              <button onClick={() => { setMenuOpen(false); onEdit(task); }}><Pencil size={15} /> Edit task</button>
              <button className="danger-text" onClick={() => { setMenuOpen(false); onDelete(task); }}><Trash2 size={15} /> Delete task</button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
