# Task Manager — Full-Stack Assessment Project

A responsive task-management application built with React, Vite, Node.js, Express, and MySQL. It supports creating, viewing, editing, deleting, filtering, and searching tasks.

## Features

- Create tasks with title, description, priority, status, and optional due date
- View task counts and a responsive task list
- Search tasks by title or description
- Filter by status and priority
- Edit tasks and update status
- Delete tasks with a confirmation prompt
- MySQL persistence (tasks remain after refreshing)
- Server-side validation and parameterized SQL queries
- Loading, empty, success, and error states
- Responsive dashboard layout

## Tech stack

- Frontend: React 18, Vite, plain CSS
- Backend: Node.js, Express
- Database: MySQL 8+
- ORM: Sequelize (using the MySQL dialect and `mysql2`)

## Requirements

- Node.js 18 or newer
- npm
- MySQL 8+ (or a compatible MySQL server)

## Quick start

### 1. Create the database

Open a MySQL client and run the contents of `database/schema.sql`:

```bash
mysql -u root -p < database/schema.sql
```

The schema creates a database named `task_manager` and a `tasks` table. If your MySQL user does not have permission to create databases, create `task_manager` manually and run the table definition.

### 2. Configure the backend

Copy `server/.env.example` to `server/.env` and set your MySQL credentials:

```env
PORT=5000
<<<<<<< HEAD
CLIENT_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
=======
CLIENT_ORIGIN=http://localhost:3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
>>>>>>> master
DB_NAME=task_manager
```

Do not commit `server/.env` or share your database password.

### 3. Install dependencies

From the project root:

```bash
npm install
npm run install:all
```

If your npm version does not support the root scripts, install manually:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 4. Run the application

From the project root:

```bash
npm run dev
```

<<<<<<< HEAD
- Frontend: http://localhost:5173
=======
- Frontend: http://localhost:3000
>>>>>>> master
- Backend health check: http://localhost:5000/api/health
- API tasks endpoint: http://localhost:5000/api/tasks

Run the backend alone with `npm start --prefix server`. Run a production frontend build with `npm run build`.

## API reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | List tasks; optional `status`, `priority`, and `search` query parameters |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| PATCH | `/api/tasks/:id/status` | Update task status |
| DELETE | `/api/tasks/:id` | Delete a task |

### Example task payload

```json
{
  "title": "Prepare assessment demo",
  "description": "Test create, edit, filter, and delete flows.",
  "status": "Pending",
  "priority": "Medium",
  "due_date": "2026-10-20"
}
```

Valid statuses: `Pending`, `In Progress`, `Completed`  
Valid priorities: `Low`, `Medium`, `High`

## Testing checklist

1. Start MySQL and run `database/schema.sql`.
2. Start the app with `npm run dev`.
3. Create a task with a title and verify it appears in the list.
4. Refresh the browser and verify the task remains.
5. Try submitting an empty title; it should be rejected.
6. Edit the task title or description and save.
7. Change its status and confirm the status badge/counts update.
8. Filter by status and priority; search by a word in the title.
9. Delete a task and confirm the deletion prompt appears.
10. Stop the backend temporarily and verify that an error message appears rather than a blank screen.
11. Test the layout at desktop and mobile widths.
12. Check `GET http://localhost:5000/api/health` to verify database connectivity.

## Assessment notes

### Three key implementation decisions

1. **Separate UI, API, and persistence:** React handles the interactive interface, Express owns validation and business rules, and MySQL provides persistent storage.
2. **Prioritize the core task lifecycle:** CRUD, status changes, search, and filters are implemented before optional collaboration features.
3. **Validate and provide feedback:** Both client and server validate required data; the UI communicates loading, empty, and error states.

### Features deliberately not implemented

1. **Authentication and user accounts:** Excluded to keep the assessment focused on the task workflow. This means the current app is not suitable for public multi-user use.
2. **Email or push notifications:** Excluded because reminders require a scheduler and delivery infrastructure.
3. **Team workspaces and task assignment:** Excluded to avoid adding collaboration and authorization complexity.

### Current limitation and next-day improvement

The app does not have user authentication or task ownership, so it should only be used in a trusted local/demo environment. With another day, I would add secure authentication, associate tasks with their owner, enforce authorization on every API route, and add automated integration tests.

## Before submission

- Verify the app starts from a clean install.
- Include `database/schema.sql` and setup steps.
- Do not include `.env`, passwords, or `node_modules`.
- Record the requested explanation video and use your own words.
- Only claim features that you have tested yourself.
