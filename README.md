# Task Users Project Details

## Overview

Task Users is a task-management application with a Next.js frontend and a Django backend. The application currently includes authentication screens and a personalized dashboard.

## Project Structure

```text
frontend-task/       Next.js frontend
  app/
    page.tsx         Login page
    signup/page.tsx  Signup page
    dashboard/page.tsx Dashboard page
    tasks/page.tsx   All tasks list page
    task/assign/page.tsx Assign task page
    globals.css      Shared application styles
  next.config.ts     API rewrites to Django

task-management/    Django backend
  apps/task_user/    User model, authentication views, and API routes
  apps/tasks/        Task model, CRUD views, and API routes
  backend_task/      Django project configuration
```

## Frontend Pages

| Page | URL | Purpose |
| --- | --- | --- |
| Login | `http://localhost:3000/` | Accepts email and password and logs a user in |
| Signup | `http://localhost:3000/signup` | Creates a new Task User |
| Dashboard | `http://localhost:3000/dashboard` | Displays the logged-in user's workspace and their real tasks |
| Tasks | `http://localhost:3000/tasks` | Lists, completes, and deletes the user's tasks |
| Assign task | `http://localhost:3000/task/assign` | Creates a real task through the Django API |

The dashboard retrieves the user's `user_id` and `user_name` from the Django session and uses them in the greeting, workspace label, member identifier, and avatar.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/signup/` | Creates a user with `name`, `email`, and `password` |
| `POST` | `/api/login/` | Authenticates a user with `email` and `password` |
| `GET` | `/api/session/` | Returns the current session user's ID and name |
| `GET` | `/api/tasks/` | Lists all tasks |
| `POST` | `/api/tasks/` | Creates a task with `title`, `brief`, `assignee`, `project`, `due_date`, and `priority` |
| `GET` | `/api/tasks/<id>/` | Returns a single task |
| `PATCH` | `/api/tasks/<id>/` | Partially updates a task (e.g. `status`, `priority`, `assignee`, `due_date`) |
| `DELETE` | `/api/tasks/<id>/` | Deletes a task |

Task statuses are `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`, and `CANCELLED`. Priorities are `LOW`, `MEDIUM`, `HIGH`, and `URGENT`.

The frontend calls these paths through Next.js. Next.js rewrites them to Django at `http://127.0.0.1:8000`:

```text
Frontend: /api/login/
Backend:  http://127.0.0.1:8000/api/login/
```

Both slash and no-slash versions are configured for the authentication and session routes.

## Login Session Flow

1. The user submits the login form.
2. Next.js forwards the request to Django.
3. Django validates the email and password.
4. On success, Django stores `user_id` and `user_name` in the session.
5. The frontend routes the user to `/dashboard`.
6. The dashboard calls `/api/session/` and renders the session user data.

## Local Setup

### Start Django

From the `task-management` directory:

```powershell
python manage.py migrate
python manage.py runserver
```

Django runs at:

```text
http://127.0.0.1:8000
```

### Start Next.js

From the `frontend-task` directory:

```powershell
npm install
npm run dev
```

Next.js runs at:

```text
http://localhost:3000
```

## Validation Commands

```powershell
npm run lint
npm run build
python manage.py check
```

## Current Notes

- The authentication API uses JSON request bodies.
- The login and signup API views are CSRF-exempt because they are JSON API endpoints.
- Django CORS and trusted-origin settings include both `localhost:3000` and `127.0.0.1:3000` for local development.
- The dashboard currently contains sample task data and interactive task checkboxes.
