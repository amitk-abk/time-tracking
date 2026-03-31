# Copilot Instructions for Time Tracking Web App

## Architecture Overview
- **Frontend only:** All business logic and UI are in `src/` (no backend except optional static server).
- **Major files:**
  - `src/index.html`: Main UI, Bootstrap 5 layout, includes all scripts/styles.
  - `src/app.js`: Core logic, state, rendering, timer, and PDF export.
  - `src/style.css`: Custom styles for modern, gradient UI.
- **Persistence:** Uses browser `localStorage` for all data (projects, tasks, time entries, project-task links).
- **PDF Export:** Uses jsPDF and jsPDF-AutoTable via CDN for timesheet generation.

## Data Model
- **Projects:** `{ id, name }` in `localStorage.projects`.
- **Tasks:** `{ id, name }` in `localStorage.tasks`.
- **Project-Task Links:** `{ projectId, taskId }[]` in `localStorage.projectTasks` (many-to-many).
- **Time Entries:** `{ id, taskId, projectId, start, end, date, ... }` in `localStorage.timeEntries`.

## Developer Workflows
- **Run locally:**
  - Open `src/index.html` in browser (no build needed).
  - Or run `node server.js` and visit `http://localhost:3000/`.
- **Testing:**
  - Run `npm install` then `npx jest` (tests in `tests/`).
  - Tests cover unit, integration, component, db, and e2e flows.
- **Debugging:**
  - Use browser devtools for JS/DOM debugging.
  - Data can be inspected/cleared via browser localStorage.

## Project Conventions
- **No frameworks:** Only Bootstrap 5, jsPDF, and vanilla JS.
- **All state is global:** No modules or imports; functions and state are global in `app.js`.
- **UI rendering:** Functions like `renderProjects`, `renderTasks`, `renderCurrentTaskInfo`, `renderTotals` update DOM directly.
- **Timer logic:** Only one timer can run at a time; entries <1 min are discarded.
- **Day boundary:** 4am local time (see `getTodayString()` in `app.js`).
- **PDF export:** Button in totals panel triggers PDF generation for today’s data only.

## Integration Points
- **jsPDF:** Used for PDF export (see `generate-pdf-btn` handler in `app.js`).
- **Bootstrap 5:** Layout and components via CDN; custom styles in `style.css`.
- **Jest/jsdom:** For tests in `tests/` (see `jest.config.js`).

## Key Patterns & Examples
- **Adding a task:**
  ```js
  addTaskForm.onsubmit = e => { ... tasks.push({ id, name }); ... }
  ```
- **Linking tasks to projects:**
  ```js
  projectTasks.push({ projectId, taskId });
  ```
- **Timer entry:**
  ```js
  timeEntries.push({ id, taskId, projectId, start, ... });
  ```
- **Rendering lists:**
  ```js
  tasks.forEach(task => { ... taskList.appendChild(li); ... });
  ```
- **PDF export:**
  ```js
  document.getElementById('generate-pdf-btn').onclick = function() { ... doc.save('timesheet_' + today + '.pdf'); }
  ```

## Directory Structure
- `src/`: Main app code (HTML, JS, CSS)
- `tests/`: Jest test suite (unit, integration, e2e)
- `.github/`: Copilot and workflow instructions
- `server.js`: Optional static server for local dev
