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

export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ user_id: number; user_name: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"success" | "error">("success");

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
      }
    }

    loadSession();
  }, [router]);

  async function loadTasks() {
    try {
      const response = await fetch("/api/tasks", { credentials: "include" });
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setTasks(data.tasks ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function toggleTask(task: Task) {
    const completed = task.status !== "COMPLETED";
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id ? { ...item, status: completed ? "COMPLETED" : "TODO" } : item,
      ),
    );

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
      setMessageKind("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    }
  }

  async function deleteTask(task: Task) {
    const confirmed = window.confirm(`Delete "${task.title}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("We could not delete the task.");
      }

      setTasks((current) => current.filter((item) => item.id !== task.id));
      setMessageKind("success");
      setMessage(`Task "${task.title}" deleted.`);
    } catch (error) {
      setMessageKind("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    }
  }

  if (!user) {
    return <main className="dashboard-loading">Loading your workspace...</main>;
  }

  const initials = user.user_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const openCount = tasks.filter((task) => task.status !== "COMPLETED" && task.status !== "CANCELLED").length;

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" href="/dashboard" aria-label="Task Users dashboard">
          <span className="brand-mark">TU</span>
          <span>Task Users</span>
        </Link>
        <nav className="dashboard-nav" aria-label="Main navigation">
          <Link className="dashboard-nav-link" href="/dashboard"><span>◈</span> Overview</Link>
          <Link className="dashboard-nav-link" href="/task/assign"><span>＋</span> Assign task</Link>
          <Link className="dashboard-nav-link active" href="/tasks"><span>○</span> My tasks</Link>
          <a className="dashboard-nav-link" href="/dashboard#projects"><span>□</span> Projects</a>
          <Link className="dashboard-nav-link" href="/calendar"><span>▦</span> Calendar</Link>
        </nav>
        <div className="sidebar-footer">
          <p className="eyebrow">Workspace</p>
          <p className="workspace-name">{user.user_name}&apos;s space</p>
          <Link href="/" className="sign-out-link">Sign out <span aria-hidden="true">-&gt;</span></Link>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <Link className="back-link" href="/dashboard">&lt;- Back to overview</Link>
            <p className="eyebrow">Work in flight</p>
            <h1>All tasks.</h1>
            <p className="dashboard-subtitle">
              {openCount} open, {tasks.length} total. Check off what gets done, delete what does not.
            </p>
          </div>
          <button className="avatar-button" type="button" aria-label={`Profile for ${user.user_name}`}>{initials}</button>
        </header>

        <section className="tasks-card tasks-page-card" aria-labelledby="all-tasks-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Task list</p>
              <h2 id="all-tasks-title">Your tasks</h2>
            </div>
            <Link className="quiet-button" href="/task/assign">+ Add task</Link>
          </div>

          {message && (
            <p className={`form-message ${messageKind} tasks-message`} role={messageKind === "error" ? "alert" : "status"}>{message}</p>
          )}

          <div className="task-list">
            {loading ? (
              <p className="task-list-empty">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="task-list-empty">
                Nothing here yet. <Link className="quiet-button" href="/task/assign">Assign the first task</Link>
              </p>
            ) : (
              tasks.map((task) => {
                const done = task.status === "COMPLETED";
                const cancelled = task.status === "CANCELLED";
                const detail = [
                  task.project,
                  task.assignee,
                  task.created_by_name ? `by ${task.created_by_name}` : "",
                  task.due_date ? `due ${task.due_date}` : "",
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <label className={`task-row ${done || cancelled ? "completed" : ""}`} key={task.id}>
                    <input type="checkbox" checked={done} disabled={cancelled} onChange={() => toggleTask(task)} />
                    <span className="custom-check" aria-hidden="true">{done ? "✓" : ""}</span>
                    <span className="task-details">
                      <strong>{task.title}</strong>
                      <small>{detail || task.status_label}</small>
                    </span>
                    <span className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority_label}</span>
                    <button className="task-delete" type="button" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task)}>×</button>
                  </label>
                );
              })
            )}
          </div>
        </section>
      </section>
    </main>
  );
}