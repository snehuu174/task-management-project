"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type FormValues = {
  title: string;
  assignee: string;
  project: string;
  dueDate: string;
  priority: string;
  details: string;
};

const initialValues: FormValues = {
  title: "",
  assignee: "",
  project: "",
  dueDate: "",
  priority: "MEDIUM",
  details: "",
};

export default function AssignTaskPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState(initialValues);
  const [userName, setUserName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/session", { credentials: "include" });
        if (!response.ok) {
          router.replace("/");
          return;
        }

        const sessionUser = await response.json();
        setUserName(sessionUser.user_name);
        setStatus("idle");
      } catch {
        router.replace("/");
      }
    }

    loadSession();
  }, [router]);

  function updateField(field: keyof FormValues, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }));
    setMessage("");
    setStatus("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formValues.title,
          assignee: formValues.assignee,
          project: formValues.project,
          due_date: formValues.dueDate,
          priority: formValues.priority,
          brief: formValues.details,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "We could not create the task.");
      }

      setStatus("success");
      setMessage(`Task assigned to ${formValues.assignee}.`);
      router.push("/dashboard");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  if (!userName) {
    return <main className="dashboard-loading">Loading your workspace...</main>;
  }

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" href="/dashboard" aria-label="Task Users dashboard">
          <span className="brand-mark">TU</span>
          <span>Task Users</span>
        </Link>
        <nav className="dashboard-nav" aria-label="Main navigation">
          <Link className="dashboard-nav-link" href="/dashboard"><span>◈</span> Overview</Link>
          <Link className="dashboard-nav-link active" href="/task/assign"><span>＋</span> Assign task</Link>
          <Link className="dashboard-nav-link" href="/tasks"><span>○</span> My tasks</Link>
          <a className="dashboard-nav-link" href="/dashboard#projects"><span>□</span> Projects</a>
          <Link className="dashboard-nav-link" href="/calendar"><span>▦</span> Calendar</Link>
        </nav>
        <div className="sidebar-footer">
          <p className="eyebrow">Workspace</p>
          <p className="workspace-name">{userName}&apos;s space</p>
          <Link href="/" className="sign-out-link">Sign out <span aria-hidden="true">-&gt;</span></Link>
        </div>
      </aside>

      <section className="dashboard-content assign-content">
        <header className="dashboard-header">
          <div>
            <Link className="back-link" href="/dashboard">&lt;- Back to overview</Link>
            <p className="eyebrow">New assignment</p>
            <h1>Put the next move in motion.</h1>
            <p className="dashboard-subtitle">Give the work a clear owner, a useful deadline, and room to move.</p>
          </div>
        </header>

        <section className="assign-panel" aria-labelledby="assign-title">
          <div className="assign-panel-heading">
            <p className="eyebrow">Task details</p>
            <h2 id="assign-title">Assign a task</h2>
            <p>Keep the brief focused so everyone knows what done looks like.</p>
          </div>

          <form className="assign-form" action="/task/assign" method="post" onSubmit={handleSubmit}>
            <div className="field-wide">
              <label htmlFor="task-title">Task title</label>
              <input id="task-title" name="title" value={formValues.title} onChange={(event) => updateField("title", event.target.value)} placeholder="e.g. Prepare the product review" required />
            </div>

            <div className="form-field">
              <label htmlFor="assignee">Assign to</label>
              <input id="assignee" name="assignee" value={formValues.assignee} onChange={(event) => updateField("assignee", event.target.value)} placeholder="Person or team" required />
            </div>
            <div className="form-field">
              <label htmlFor="project">Project</label>
              <input id="project" name="project" value={formValues.project} onChange={(event) => updateField("project", event.target.value)} placeholder="e.g. Website refresh" required />
            </div>
            <div className="form-field">
              <label htmlFor="due-date">Due date</label>
              <input id="due-date" name="dueDate" type="date" value={formValues.dueDate} onChange={(event) => updateField("dueDate", event.target.value)} required />
            </div>
            <div className="form-field">
              <label htmlFor="priority">Priority</label>
              <select id="priority" name="priority" value={formValues.priority} onChange={(event) => updateField("priority", event.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="field-wide">
              <label htmlFor="details">Brief</label>
              <textarea id="details" name="details" value={formValues.details} onChange={(event) => updateField("details", event.target.value)} placeholder="Add context, links, or the expected outcome." rows={5} />
            </div>

            <div className="assign-actions">
              <Link className="cancel-link" href="/dashboard">Cancel</Link>
              <button className="submit-button assign-submit" type="submit">Assign task <span aria-hidden="true">-&gt;</span></button>
            </div>
            <p className={`form-message ${status}`} role={status === "error" ? "alert" : "status"}>{message}</p>
          </form>
        </section>
      </section>
    </main>
  );
}