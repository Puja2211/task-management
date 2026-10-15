import { useEffect, useState } from "react";
import { CalendarDays, Flag, AlignLeft, Type } from "lucide-react";

const EMPTY_TASK = {
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
  due_date: ""
};

export default function TaskForm({ initialTask, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(EMPTY_TASK);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialTask) {
      setForm({
        title: initialTask.title || "",
        description: initialTask.description || "",
        status: initialTask.status || "Pending",
        priority: initialTask.priority || "Medium",
        due_date: initialTask.due_date ? String(initialTask.due_date).slice(0, 10) : ""
      });
    } else {
      setForm(EMPTY_TASK);
    }
    setError("");
  }, [initialTask]);

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setError("A task title is required.");
      return;
    }
    setError("");
    try {
      await onSubmit({ ...form, title, description: form.description.trim(), due_date: form.due_date || null });
    } catch (err) {
      setError(err.message || "Could not save this task.");
    }
  }

  return (
    <form className="task-form" onSubmit={submit}>
      <label className="field">
        <span><Type size={15} /> Task title <b>*</b></span>
        <input
          autoFocus
          name="title"
          value={form.title}
          onChange={change}
          maxLength={255}
          placeholder="e.g. Prepare project demo"
          required
        />
      </label>

      <label className="field">
        <span><AlignLeft size={15} /> Description</span>
        <textarea
          name="description"
          value={form.description}
          onChange={change}
          rows={3}
          placeholder="Add a few details about this task..."
        />
      </label>

      <div className="form-grid">
        <label className="field">
          <span><Flag size={15} /> Priority</span>
          <select name="priority" value={form.priority} onChange={change}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>
        <label className="field">
          <span><CalendarDays size={15} /> Due date</span>
          <input type="date" name="due_date" value={form.due_date || ""} onChange={change} />
        </label>
      </div>

      <label className="field">
        <span>Status</span>
        <select name="status" value={form.status} onChange={change}>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button>
        <button type="submit" className="button button-primary" disabled={saving}>
          {saving ? "Saving..." : initialTask ? "Save changes" : "Create task"}
        </button>
      </div>
    </form>
  );
}
