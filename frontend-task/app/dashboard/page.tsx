"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const initialTasks = [
  { id: 1, title: "Review product feedback", project: "Website refresh", time: "09:30", done: true },
  { id: 2, title: "Outline the sprint priorities", project: "Planning", time: "11:00", done: false },
  { id: 3, title: "Send notes to the design team", project: "Website refresh", time: "14:30", done: false },
  { id: 4, title: "Prepare tomorrow's standup", project: "Team ritual", time: "16:00", done: false },
];

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [user, setUser] = useState<{ user_id: number; user_name: string } | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const completedCount = tasks.filter((task) => task.done).length;

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/session/");
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

  function toggleTask(id: number) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
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
          <a className="dashboard-nav-link" href="#today"><span>○</span> My tasks</a>
          <a className="dashboard-nav-link" href="#projects"><span>□</span> Projects</a>
          <a className="dashboard-nav-link" href="#calendar"><span>▦</span> Calendar</a>
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
              <button className="quiet-button" type="button">+ Add task</button>
            </div>
            <div className="task-list">
              {tasks.map((task) => (
                <label className={`task-row ${task.done ? "completed" : ""}`} key={task.id}>
                  <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                  <span className="custom-check" aria-hidden="true">{task.done ? "✓" : ""}</span>
                  <span className="task-details">
                    <strong>{task.title}</strong>
                    <small>{task.project}</small>
                  </span>
                  <time>{task.time}</time>
                </label>
              ))}
            </div>
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