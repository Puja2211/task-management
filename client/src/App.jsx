import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, CalendarDays, Check, CheckCheck, ChevronDown, CircleHelp,
  ClipboardList, Clock3, ListFilter, Plus, Search, Sparkles, Target,
  X, LayoutDashboard, Menu, RefreshCw
} from "lucide-react";
import TaskForm from "./components/TaskForm.jsx";
import TaskItem from "./components/TaskItem.jsx";
import { taskApi } from "./services/taskApi.js";

const STATUS_FILTERS = ["All tasks", "Pending", "In Progress", "Completed"];

function todayLabel() {
  return new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
}

function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    function keyHandler(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All tasks");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      const result = await taskApi.list();
      setTasks(result.data || []);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const counts = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter((task) => task.status === "Pending").length,
    progress: tasks.filter((task) => task.status === "In Progress").length,
    completed: tasks.filter((task) => task.status === "Completed").length
  }), [tasks]);

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const statusMatches = statusFilter === "All tasks" || task.status === statusFilter;
      const priorityMatches = priorityFilter === "All" || task.priority === priorityFilter;
      const searchMatches = !query ||
        task.title.toLowerCase().includes(query) ||
        (task.description || "").toLowerCase().includes(query);
      return statusMatches && priorityMatches && searchMatches;
    });
  }, [tasks, statusFilter, priorityFilter, search]);

  const closeModal = useCallback(() => setModal(null), []);

  async function saveTask(data) {
    setSaving(true);
    try {
      if (modal?.task) {
        await taskApi.update(modal.task.id, data);
        setNotice("Task updated successfully.");
      } else {
        await taskApi.create(data);
        setNotice("Task created successfully.");
      }
      setModal(null);
      await loadTasks();
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id, status) {
    try {
      await taskApi.updateStatus(id, status);
      setTasks((current) => current.map((task) => task.id === id ? { ...task, status } : task));
      setNotice(status === "Completed" ? "Task completed. Nice work!" : "Task moved to Pending.");
    } catch (error) {
      setPageError(error.message);
    }
  }

  async function deleteTask(task) {
    const confirmed = window.confirm(`Delete "${task.title}"? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      await taskApi.remove(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setNotice("Task deleted.");
    } catch (error) {
      setPageError(error.message);
    }
  }

  function selectStatus(status) {
    setStatusFilter(status);
    setMobileNav(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><CheckCheck size={21} strokeWidth={2.5} /></div>
          <span>taskflow<span className="brand-period">.</span></span>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Task filters">
          <button className={`nav-item ${statusFilter === "All tasks" ? "active" : ""}`} onClick={() => selectStatus("All tasks")}>
            <LayoutDashboard size={18} /><span>Overview</span><span className="nav-count">{counts.all}</span>
          </button>
          <button className={`nav-item ${statusFilter === "Pending" ? "active" : ""}`} onClick={() => selectStatus("Pending")}>
            <Clock3 size={18} /><span>Pending</span><span className="nav-count">{counts.pending}</span>
          </button>
          <button className={`nav-item ${statusFilter === "In Progress" ? "active" : ""}`} onClick={() => selectStatus("In Progress")}>
            <Activity size={18} /><span>In progress</span><span className="nav-count">{counts.progress}</span>
          </button>
          <button className={`nav-item ${statusFilter === "Completed" ? "active" : ""}`} onClick={() => selectStatus("Completed")}>
            <CheckCircleIcon /><span>Completed</span><span className="nav-count">{counts.completed}</span>
          </button>
        </nav>

      </aside>

      {mobileNav && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={21} /></button>
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>Tasks</strong></div>
          <div className="topbar-right">
            <span className="today-label"><CalendarDays size={15} /> {todayLabel()}</span>
            <div className="top-avatar">P</div>
          </div>
        </header>

        <div className="page-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL WORKSPACE</div>
              <h1>Good things take <span>focus.</span></h1>
              <p className="welcome-subtitle">Plan your day, make progress, and celebrate the little wins.</p>
            </div>
            <button className="button button-primary add-task-button" onClick={() => setModal({ task: null })}>
              <Plus size={18} /> New task
            </button>
          </section>

          {pageError && (
            <div className="alert alert-error" role="alert">
              <span>{pageError}</span>
              <button className="alert-action" onClick={loadTasks}><RefreshCw size={14} /> Retry</button>
              <button className="alert-close" aria-label="Dismiss error" onClick={() => setPageError("")}><X size={16} /></button>
            </div>
          )}

          <section className="stats-grid" aria-label="Task summary">
            <StatCard icon={<ClipboardList size={19} />} label="Total tasks" value={counts.all} detail="Across your workspace" tone="violet" />
            <StatCard icon={<Clock3 size={19} />} label="Pending" value={counts.pending} detail="Ready when you are" tone="amber" />
            <StatCard icon={<Activity size={19} />} label="In progress" value={counts.progress} detail="Currently underway" tone="blue" />
            <StatCard icon={<Check size={19} />} label="Completed" value={counts.completed} detail={counts.all ? `${Math.round(counts.completed / counts.all * 100)}% completion rate` : "Your wins start here"} tone="green" />
          </section>

          <section className="tasks-section">
            <div className="section-heading">
              <div>
                <div className="section-title-row"><h2>Your tasks</h2><span className="task-total">{visibleTasks.length}</span></div>
                <p>Everything you want to get done, in one place.</p>
              </div>
              <button className="button button-outline" onClick={() => setModal({ task: null })}><Plus size={16} /> Add task</button>
            </div>

            <div className="task-toolbar">
              <div className="search-box">
                <Search size={17} />
                <input aria-label="Search tasks" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks..." />
                {search && <button aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}
              </div>
              <label className="filter-select">
                <ListFilter size={16} />
                <select aria-label="Filter by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
                  <option value="All">All priorities</option>
                  <option value="High">High priority</option>
                  <option value="Medium">Medium priority</option>
                  <option value="Low">Low priority</option>
                </select>
                <ChevronDown size={14} className="filter-chevron" />
              </label>
            </div>

            <div className="filter-tabs" role="tablist" aria-label="Filter tasks by status">
              {STATUS_FILTERS.map((filter) => {
                const count = filter === "All tasks" ? counts.all :
                  filter === "Pending" ? counts.pending :
                  filter === "In Progress" ? counts.progress : counts.completed;
                return (
                  <button key={filter} role="tab" aria-selected={statusFilter === filter}
                    className={`filter-tab ${statusFilter === filter ? "selected" : ""}`}
                    onClick={() => setStatusFilter(filter)}>
                    {filter}<span>{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="task-list">
              {loading ? (
                <div className="state-panel"><div className="spinner" /><strong>Loading your tasks...</strong><span>Getting your workspace ready.</span></div>
              ) : visibleTasks.length ? (
                visibleTasks.map((task) => (
                  <TaskItem key={task.id} task={task}
                    onEdit={(item) => setModal({ task: item })}
                    onDelete={deleteTask}
                    onStatusChange={changeStatus} />
                ))
              ) : (
                <div className="state-panel empty-state">
                  <div className="empty-icon"><Target size={25} /></div>
                  <strong>{search || priorityFilter !== "All" || statusFilter !== "All tasks" ? "No matching tasks" : "A fresh start."}</strong>
                  <span>{search || priorityFilter !== "All" || statusFilter !== "All tasks"
                    ? "Try changing your search or filters."
                    : "Add your first task and turn your plans into progress."}</span>
                  {search || priorityFilter !== "All" || statusFilter !== "All tasks" ? (
                    <button className="button button-outline" onClick={() => { setSearch(""); setPriorityFilter("All"); setStatusFilter("All tasks"); }}>Clear filters</button>
                  ) : (
                    <button className="button button-primary" onClick={() => setModal({ task: null })}><Plus size={16} /> Create first task</button>
                  )}
                </div>
              )}
            </div>
            <div className="list-footer"><span>{visibleTasks.length} of {counts.all} tasks shown</span></div>
          </section>

          <footer className="page-footer"></footer>
        </div>
      </main>

      {modal && (
        <Modal title={modal.task ? "Edit task" : "Create a task"}
          subtitle={modal.task ? "Make changes to your task details." : "Add a new item to your task list."}
          onClose={closeModal}>
          <TaskForm initialTask={modal.task} onSubmit={saveTask} onCancel={closeModal} saving={saving} />
        </Modal>
      )}
      {notice && <div className="toast" role="status"><CheckCircleIcon /> {notice}</div>}
    </div>
  );
}

function CheckCircleIcon() {
  return <CheckCheck size={18} />;
}

function StatCard({ icon, label, value, detail, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon stat-${tone}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </article>
  );
}
