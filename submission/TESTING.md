# Assessment validation

Validated on 11 October 2026 with Node.js 26.7.0, real MongoDB 7.0.24, and Google Chrome.

## Automated checks

| Check | Result |
| --- | --- |
| `npm.cmd test` | 10 tests passed, no skipped tests |
| `npm.cmd run build` | Frontend production build passed |
| `npm.cmd run lint` | No errors; existing timer/context warnings remain |
| `npm.cmd run screenshots` | Browser checks passed and screenshots captured |

Database tests use a real MongoDB process in an isolated temporary database. They verify empty lists, invalid/blank/oversized task titles, strict IDs, task creation and retrieval, missing-task errors, both completion states, persistence after a fresh API/database connection, deletion, and the existing notes endpoints.

The browser checks create tasks through the React form and real Express API, mark a task complete, refresh to verify saved state, delete a task, refresh again, and capture desktop/mobile screenshots. The capture script cleans up only the records it creates. The application does not contain hardcoded sample tasks.

## Included screenshots

- [Empty task list](screenshots/01-empty-state.png)
- [Tasks added to MongoDB](screenshots/02-tasks-added.png)
- [Saved completion after refreshing](screenshots/03-completion-after-refresh.png)
- [Task deleted and page refreshed](screenshots/04-task-deleted.png)
- [Mobile layout](screenshots/05-mobile.png)

## Manual assessment checklist

1. Start MongoDB with `npm.cmd run db`, then start the frontend/backend with `npm.cmd run dev` in another terminal.
2. Open `http://127.0.0.1:5173` and confirm the empty-list message when no tasks exist.
3. Submit a blank or spaces-only title and confirm validation prevents adding a task.
4. Enter a task title and click **Add Task**. Confirm the task appears.
5. Refresh the page. Confirm the task is retrieved from MongoDB.
6. Check its completion box, then refresh. Confirm completion remains saved.
7. Click **Delete**, refresh, and confirm the task stays deleted.
8. Confirm the empty-list message reappears after deleting the last task.

## Submission contents

Submit `frontend/`, `backend/`, `submission/`, `scripts/`, the root `package.json`, `package-lock.json`, `README.md`, and `.gitignore`. The source and credential-free configuration are included. Exclude `node_modules`, `.env`, `.env.production`, `.npm-cache`, `backend/.cache`, `backend/.data`, and generated `dist` files.
