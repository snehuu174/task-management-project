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
  status: string;
};

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
};

export default function CalendarPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<{ user_id: number; user_name: string } | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  // Load user session (same as other dashboard pages)
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

  // Load all tasks (same as dashboard)
  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch("/api/tasks", { credentials: "include" });
        if (!response.ok) return;
        const data = await response.json();
        setTasks(data.tasks ?? []);
      } finally {
        // Generate calendar days after loading tasks
        generateCalendarDays();
      }
    }
    loadTasks();
  }, [currentMonth]);

  // Generate calendar grid for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // Get the day of the week the first day falls on (0 = Sunday)
    const startDayOfWeek = firstDay.getDay();
    
    const days: CalendarDay[] = [];
    const today = new Date();

    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        tasks: getTasksForDate(date)
      });
    }

    // Add days from current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        tasks: getTasksForDate(date)
      });
    }

    // Add days from next month to fill the remaining weeks
    const remainingDays = 42 - days.length; // 6 weeks × 7 days = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        tasks: getTasksForDate(date)
      });
    }

    setCalendarDays(days);
  };

  // Helper: Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Helper: Get all tasks that are due on a specific date
  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return isSameDay(taskDate, date);
    });
  };

  // Navigation helpers for months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Get month name for header
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  if (sessionLoading || !user) {
    return <main className="dashboard-loading">Loading your calendar...</main>;
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
        <Link className="dashboard-brand" href="/dashboard" aria-label="Task Users dashboard">
          <span className="brand-mark">TU</span>
          <span>Task Users</span>
        </Link>
        <nav className="dashboard-nav" aria-label="Main navigation">
          <Link className="dashboard-nav-link" href="/dashboard"><span>◈</span> Overview</Link>
          <Link className="dashboard-nav-link" href="/task/assign"><span>＋</span> Assign task</Link>
          <Link className="dashboard-nav-link" href="/tasks"><span>○</span> My tasks</Link>
          <a className="dashboard-nav-link" href="/dashboard#projects"><span>□</span> Projects</a>
          <Link className="dashboard-nav-link active" href="/calendar"><span>▦</span> Calendar</Link>
        </nav>
        <div className="sidebar-footer">
          <p className="eyebrow">Workspace</p>
          <p className="workspace-name">{user.user_name}&apos;s space</p>
          <Link href="/" className="sign-out-link">Sign out <span aria-hidden="true">-&gt;</span></Link>
        </div>
      </aside>

      <section className="dashboard-content calendar-content">
        <header className="dashboard-header">
          <div>
            <Link className="back-link" href="/dashboard">&lt;- Back to overview</Link>
            <p className="eyebrow">Your schedule</p>
            <h1>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h1>
            <p className="dashboard-subtitle">View all your task deadlines in one place.</p>
          </div>
          <button className="avatar-button" type="button" aria-label={`Profile for ${user.user_name}`}>{initials}</button>
        </header>

        {/* Calendar navigation */}
        <div className="calendar-controls">
          <button onClick={goToToday} className="calendar-btn">Today</button>
          <button onClick={goToPreviousMonth} className="calendar-btn">&larr;</button>
          <button onClick={goToNextMonth} className="calendar-btn">&rarr;</button>
        </div>

        {/* Calendar grid */}
        <div className="calendar-grid">
          {/* Weekday headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
            >
              <div className="calendar-date">{day.date.getDate()}</div>
              <div className="calendar-tasks">
                {day.tasks.slice(0, 3).map(task => (
                  <div key={task.id} className={`calendar-task priority-${task.priority.toLowerCase()}`}>
                    {task.title}
                  </div>
                ))}
                {day.tasks.length > 3 && (
                  <div className="more-tasks">+{day.tasks.length - 3} more</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}