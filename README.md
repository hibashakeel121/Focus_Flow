# Focus Flow - MERN

A beginner-friendly student task manager built with React, Node.js, Express, and MongoDB. The existing Notes, Timer, Stopwatch, Habits, Word Counter, and Calculator pages are retained.

## Features

- Enter a task title and click **Add Task**.
- Fetch and display tasks saved in MongoDB.
- Delete a task from the database and update the list.
- Show an empty-list message when no tasks exist.
- Reject empty or invalid titles on both frontend and backend.
- Mark tasks completed with a checkbox; completion is saved in MongoDB.
- Filter all, active, and completed tasks.
- Show loading, success, and error messages, with retry when loading fails.

There are no preloaded or hardcoded tasks in the application. Screenshot/test tasks are inserted through real APIs and removed afterward.

## Project structure

```text
frontend/
  src/
    pages/TodoPage.jsx          React task page
    components/todo/            Task input and list items
    services/tasksApi.js        Fetch calls to Express
  public/
  index.html
  vite.config.js
  package.json
backend/
  models/Task.js               MongoDB task schema
  models/Note.js               Existing notes schema
  app.js                      Express routes and validation
  index.js                    Database connection and server startup
  app.test.js                 Tests using real MongoDB
  scripts/local-mongo.js       Optional local MongoDB launcher
  .env.example                Configuration without credentials
  package.json
submission/
  screenshots/                Screenshots of the working app
  TESTING.md                  Validation results and manual checks
scripts/
  capture-screenshots.mjs      Browser checks and screenshot capture
package.json                  Commands for both npm workspaces
package-lock.json             Dependency lockfile
```

## Run the project

Requirements: Node.js 22.12 or newer, npm, and a MongoDB connection. Run these commands from the project root. On Windows use `npm.cmd` if PowerShell blocks `npm.ps1`.

Local MongoDB on Windows also needs the [Microsoft Visual C++ x64 runtime](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist). If the database exits with code `3221225781`, install that runtime and restart the database command.

```powershell
npm.cmd install
Copy-Item backend/.env.example backend/.env
```

If `backend/.env` already exists, keep it or edit its values. The default configuration is:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/student_task_manager
PORT=5000
```

Start MongoDB in one terminal:

```powershell
npm.cmd run db
```

This optional development command runs an actual MongoDB server bound to `127.0.0.1:27017`. Its first run downloads MongoDB (about 600 MB on Windows); later runs reuse the cached binary. Database files are stored in `backend/.data`, so tasks survive stopping and restarting the server. It does not seed tasks. If you already have MongoDB running locally, use that server and skip this command.

In a second terminal, start the backend and frontend:

```powershell
npm.cmd run dev
```

Open **http://127.0.0.1:5173**. The Express backend uses port 5000. Keep both terminals running.

### MongoDB Atlas alternative

Set `MONGODB_URI` in `backend/.env` to your Atlas connection string. Configure an Atlas database user and allow your machine's IP in Network Access. Then run `npm.cmd run dev`; you do not need `npm.cmd run db`. Never put database credentials in the React frontend or commit `.env`.

### Run the folders separately

After installing from the root, you can run `npm.cmd run dev` inside `backend/` and `frontend/` in separate terminals. The root uses npm workspaces so one install handles both folders. The frontend proxies `/api` requests to `http://127.0.0.1:5000`; if you change the backend port, change the target in `frontend/vite.config.js`.

## Task APIs

| Method | Endpoint | Response |
| --- | --- | --- |
| GET | `/api/tasks` | 200, array of saved tasks |
| POST | `/api/tasks` | 201, created task |
| DELETE | `/api/tasks/:id` | 204, task deleted |
| PATCH | `/api/tasks/:id` | 200, updated completion status |
| GET | `/api/health` | 200 when MongoDB is connected; otherwise 503 |

POST body:

```json
{"title":"Finish the science assignment"}
```

PATCH body:

```json
{"completed":true}
```

Task fields are `id`, `title`, `completed`, `createdAt`, and `updatedAt`. Titles must be strings with 1 to 200 characters after trimming. Empty titles and invalid IDs return 400 with a JSON error; nonexistent tasks return 404. Database errors return an error response without exposing credentials.

## Tests and screenshots

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

The integration tests launch real, isolated MongoDB automatically and test validation, status codes, task CRUD, completion, and persistence after restarting the API/database connection. They use a separate temporary database and never delete application tasks. Alternatively set `TEST_MONGODB_URI` to an existing test MongoDB server.

The included screenshots are in `submission/screenshots`. To capture them again while the app and MongoDB are running, install Google Chrome and run:

```powershell
npm.cmd run screenshots
```

The screenshot script tests adding tasks, saved completion after refreshing, and deletion. It removes only tasks it created. The empty-state screenshot is captured when the database initially contains no tasks. See `submission/TESTING.md` for the validation record and manual test steps.

## Production

Run `npm.cmd run build`, then set `NODE_ENV=production` and `MONGODB_URI` in `backend/.env.production` or the server environment. Run `npm.cmd start`. Express serves `frontend/dist` and the API from the same origin. The optional local database launcher is development tooling; configure your normal MongoDB server for production.

This is a shared classroom app without user accounts. Every visitor using the same backend sees the same tasks. Habits remain in memory; task and note storage use MongoDB.

Implementation references: [Express API](https://expressjs.com/en/5x/api.html), [Mongoose connections](https://mongoosejs.com/docs/connections.html), [local MongoDB tooling](https://github.com/typegoose/mongodb-memory-server).
