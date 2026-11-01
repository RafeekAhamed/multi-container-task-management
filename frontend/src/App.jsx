import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Clock3,
  ClipboardList,
  Cloud,
  Filter,
  LoaderCircle,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Server,
  Trash2,
  X,
} from 'lucide-react';
import './App.css';

const API_URL = '/api/tasks';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
  });

  const fetchTasks = useCallback(async () => {
    try {
      setError('');

      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to retrieve tasks');
      }

      setTasks(result.data || []);
    } catch (err) {
      setError(err.message || 'Unable to connect to the API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((task) => task.status === 'pending').length,
    progress: tasks.filter((task) => task.status === 'in_progress').length,
    completed: tasks.filter((task) => task.status === 'completed').length,
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const query = search.toLowerCase();

      const matchesSearch =
        task.title.toLowerCase().includes(query) ||
        (task.description || '').toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, search]);

  const openCreateForm = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', status: 'pending' });
    setShowForm(true);
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setForm({ title: '', description: '', status: 'pending' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) return;

    try {
      setSaving(true);
      setError('');

      const url = editingTask
        ? `${API_URL}/${editingTask.id}`
        : API_URL;

      const response = await fetch(url, {
        method: editingTask ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          ...(editingTask ? { status: form.status } : {}),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to save task');
      }

      closeForm();
      await fetchTasks();
    } catch (err) {
      setError(err.message || 'Unable to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      setError('');

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to delete task');
      }

      await fetchTasks();
    } catch (err) {
      setError(err.message || 'Unable to delete task');
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      setError('');

      const response = await fetch(`${API_URL}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description || '',
          status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to update task status');
      }

      await fetchTasks();
    } catch (err) {
      setError(err.message || 'Unable to update task');
    }
  };

  const statusLabel = (status) =>
    STATUS_OPTIONS.find((item) => item.value === status)?.label || status;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><ClipboardList size={23} /></div>
          <div>
            <h2>TaskFlow</h2>
            <span>Management Platform</span>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          <a className="nav-link active" href="#dashboard">
            <Activity size={18} /> Dashboard
          </a>
          <a className="nav-link" href="#tasks">
            <ClipboardList size={18} /> All Tasks
            <span className="nav-count">{stats.total}</span>
          </a>
        </nav>

        <div className="sidebar-label">TASK STATUS</div>
        <div className="status-navigation">
          <button onClick={() => setFilter('pending')}>
            <Circle size={15} /> Pending
            <span>{stats.pending}</span>
          </button>
          <button onClick={() => setFilter('in_progress')}>
            <Clock3 size={15} /> In Progress
            <span>{stats.progress}</span>
          </button>
          <button onClick={() => setFilter('completed')}>
            <CheckCircle2 size={15} /> Completed
            <span>{stats.completed}</span>
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="online-dot" />
            <div>
              <strong>Application</strong>
              <small>TaskFlow Workspace</small>
            </div>
          </div>
          <div className="sidebar-footer">
            Built with React & Docker
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div className="breadcrumb">
            <Menu size={18} />
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Dashboard</strong>
          </div>
          <div className="topbar-right">
            <span className="environment-badge">
              <span className="online-dot" /> Development
            </span>
            <div className="avatar">TF</div>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">OVERVIEW</span>
              <h1>Task Dashboard</h1>
              <p>Manage your work, track progress, and stay organized.</p>
            </div>
            <button className="primary-button" onClick={openCreateForm}>
              <Plus size={18} /> Create Task
            </button>
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button onClick={() => setError('')} aria-label="Dismiss error">
                <X size={17} />
              </button>
            </div>
          )}

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span>Total Tasks</span>
                <div className="stat-icon blue"><ClipboardList size={19} /></div>
              </div>
              <strong>{stats.total}</strong>
              <small>All workspace tasks</small>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Pending</span>
                <div className="stat-icon amber"><Circle size={19} /></div>
              </div>
              <strong>{stats.pending}</strong>
              <small>Awaiting action</small>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>In Progress</span>
                <div className="stat-icon purple"><Clock3 size={19} /></div>
              </div>
              <strong>{stats.progress}</strong>
              <small>Currently active</small>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Completed</span>
                <div className="stat-icon green"><CheckCircle2 size={19} /></div>
              </div>
              <strong>{stats.completed}</strong>
              <small>Successfully finished</small>
            </div>
          </section>

          <section className="tasks-section" id="tasks">
            <div className="section-heading">
              <div>
                <h2>All Tasks</h2>
                <p>View and manage your workspace activities.</p>
              </div>
              <button className="icon-button" onClick={fetchTasks} title="Refresh tasks">
                <RefreshCw size={17} />
              </button>
            </div>

            <div className="toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="filter-box">
                <Filter size={17} />
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  aria-label="Filter tasks by status"
                >
                  <option value="all">All Statuses</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <LoaderCircle className="spinner" size={30} />
                <p>Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={38} />
                <h3>{search || filter !== 'all' ? 'No matching tasks' : 'No tasks yet'}</h3>
                <p>
                  {search || filter !== 'all'
                    ? 'Try changing your search or filter.'
                    : 'Create your first task to get started.'}
                </p>
                {!search && filter === 'all' && (
                  <button className="primary-button" onClick={openCreateForm}>
                    <Plus size={17} /> Create Task
                  </button>
                )}
              </div>
            ) : (
              <div className="task-list">
                {filteredTasks.map((task) => (
                  <article className="task-card" key={task.id}>
                    <div className="task-main">
                      <div className="task-indicator">
                        {task.status === 'completed'
                          ? <CheckCircle2 size={21} />
                          : task.status === 'in_progress'
                            ? <Clock3 size={21} />
                            : <Circle size={21} />}
                      </div>
                      <div className="task-details">
                        <h3>{task.title}</h3>
                        <p>{task.description || 'No description provided.'}</p>
                        <span className="task-date">
                          Created {task.created_at
                            ? new Date(task.created_at).toLocaleDateString()
                            : 'Recently'}
                        </span>
                      </div>
                    </div>

                    <div className="task-actions">
                      <span className={`status-badge ${task.status}`}>
                        {statusLabel(task.status)}
                      </span>
                      <select
                        className="status-select"
                        value={task.status}
                        onChange={(event) => handleStatusChange(task, event.target.value)}
                        aria-label={`Change status for ${task.title}`}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        className="icon-button"
                        onClick={() => openEditForm(task)}
                        title="Edit task"
                      >
                        <ArrowUpRight size={17} />
                      </button>
                      <button
                        className="icon-button danger"
                        onClick={() => handleDelete(task.id)}
                        title="Delete task"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <footer className="dashboard-footer">
            <span><Cloud size={15} /> TaskFlow Management Platform</span>
            <span><Server size={15} /> Powered by Docker & PostgreSQL</span>
          </footer>
        </section>
      </main>

      {showForm && (
        <div className="modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeForm();
        }}>
          <form className="task-modal" onSubmit={handleSubmit}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">WORKSPACE</span>
                <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              </div>
              <button type="button" className="icon-button" onClick={closeForm}>
                <X size={19} />
              </button>
            </div>

            <label htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              maxLength={200}
              placeholder="Enter task title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
              autoFocus
            />

            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              rows={4}
              placeholder="Describe your task..."
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />

            {editingTask && (
              <>
                <label htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={saving}>
                {saving && <LoaderCircle className="spinner" size={17} />}
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;





