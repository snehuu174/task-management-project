"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  brief: string;
  assignee: string;
  project: string;
  due_date: string | null;
  priority: string;
  priority_label: string;
  status: string;
  status_label: string;
  created_by_name: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<{ user_id: number; user_name: string } | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [message, setMessage] = useState("");
  const completedCount = tasks.filter((task) => task.status === "COMPLETED").length;

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/session", { credentials: "include" });
        if (!response.ok) {
          router.replace("/");
          return;
        }

        const sessionUser = await response.json();
        setUser(sessionUser);
      } catch {
        router.replace("/");
      } finally {
        setSessionLoading(false);
      }
    }

    loadSession();
  }, [router]);

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch("/api/tasks", { credentials: "include" });
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setTasks(data.tasks ?? []);
      } finally {
        setTasksLoading(false);
      }
    }

    loadTasks();
  }, []);

  async function toggleTask(task: Task) {
    const completed = task.status !== "COMPLETED";
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id ? { ...item, status: completed ? "COMPLETED" : "TODO" } : item,
      ),
    );
    setMessage("");

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: completed ? "COMPLETED" : "TODO" }),
      });
      if (!response.ok) {
        throw new Error("We could not update the task.");
      }
      const data = await response.json();
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id ? { ...item, status: data.task.status } : item,
        ),
      );
    } catch (error) {
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? task : item)),
      );
      setMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    }
  }

  if (sessionLoading || !user) {
    return <main className="dashboard-loading">Loading your workspace...</main>;
  }

  const initials = user.user_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" href="/" aria-label="Task Users home">
          <span className="brand-mark">TU</span>
          <span>Task Users</span>
        </Link>
        <nav className="dashboard-nav" aria-label="Main navigation">
          <a className="dashboard-nav-link active" href="#overview"><span>◈</span> Overview</a>
          <Link className="dashboard-nav-link" href="/task/assign"><span>＋</span> Assign task</Link>
          <Link className="dashboard-nav-link active" href="/tasks"><span>○</span> My tasks</Link>
          <a className="dashboard-nav-link" href="#projects"><span>□</span> Projects</a>
          <Link className="dashboard-nav-link" href="/calendar"><span>▦</span> Calendar</Link>
        </nav>
        <div className="sidebar-footer">
          <p className="eyebrow">Workspace</p>
          <p className="workspace-name">{user.user_name}&apos;s space</p>
          <p className="workspace-id">Member #{user.user_id}</p>
          <Link href="/" className="sign-out-link">Sign out <span aria-hidden="true">-&gt;</span></Link>
        </div>
      </aside>

      <section className="dashboard-content" id="overview">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Monday, September 14, 2026</p>
            <h1>Good morning, {user.user_name.split(" ")[0]}.</h1>
            <p className="dashboard-subtitle">Here&apos;s a clear view of what is moving today.</p>
          </div>
          <button className="avatar-button" type="button" aria-label={`Profile for ${user.user_name}`}>{initials}</button>
        </header>

        <div className="dashboard-grid">
          <section className="focus-card" aria-labelledby="focus-title">
            <div className="focus-copy">
              <p className="eyebrow">Daily focus</p>
              <h2 id="focus-title">Small steps,<br />strong momentum.</h2>
              <p>Keep your attention on the work that makes the rest easier.</p>
            </div>
            <div className="progress-ring" aria-label={`${completedCount} of ${tasks.length} tasks complete`}>
              <strong>{completedCount}/{tasks.length}</strong>
              <span>complete</span>
            </div>
          </section>

          <section className="stats-card" aria-label="Workspace summary">
            <div className="stat-row"><span>Completed this week</span><strong>18</strong></div>
            <div className="stat-row"><span>Active projects</span><strong>04</strong></div>
            <div className="stat-row"><span>Current streak</span><strong>06 <small>days</small></strong></div>
          </section>

          <section className="tasks-card" id="today" aria-labelledby="today-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">For today</p>
                <h2 id="today-title">Your tasks</h2>
              </div>
              <Link className="quiet-button" href="/task/assign">+ Add task</Link>
            </div>
            <div className="task-list">
              {tasksLoading ? (
                <p className="task-list-empty">Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <p className="task-list-empty">
                  No tasks yet. <Link className="quiet-button" href="/task/assign">Assign the first one</Link>
                </p>
              ) : (
                tasks.map((task) => {
                  const done = task.status === "COMPLETED";
                  const detail = task.project || task.assignee || task.status_label;
                  return (
                    <label className={`task-row ${done ? "completed" : ""}`} key={task.id}>
                      <input type="checkbox" checked={done} onChange={() => toggleTask(task)} />
                      <span className="custom-check" aria-hidden="true">{done ? "✓" : ""}</span>
                      <span className="task-details">
                        <strong>{task.title}</strong>
                        <small>{detail}</small>
                      </span>
                      <time>{task.priority_label}</time>
                    </label>
                  );
                })
              )}
            </div>
            {message && (
              <p className={`form-message error dashboard-message`} role="alert">{message}</p>
            )}
          </section>

          <section className="upcoming-card" id="projects" aria-labelledby="upcoming-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Coming up</p>
                <h2 id="upcoming-title">This week</h2>
              </div>
              <button className="icon-button" type="button" aria-label="View all upcoming tasks">-&gt;</button>
            </div>
            <div className="upcoming-item"><span className="date-block"><b>15</b><small>SEP</small></span><span><strong>Product review</strong><small>Tuesday · 10:00</small></span></div>
            <div className="upcoming-item"><span className="date-block"><b>17</b><small>SEP</small></span><span><strong>Team retro</strong><small>Thursday · 15:30</small></span></div>
            <div className="upcoming-item"><span className="date-block"><b>18</b><small>SEP</small></span><span><strong>Weekly planning</strong><small>Friday · 09:00</small></span></div>
          </section>
        </div>
      </section>
    </main>
  );
}