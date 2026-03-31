# Time Tracking Web Application

## Introduction

This is a modern, local-first time tracking web application designed for individuals who want to log and analyze how they spend their time on various tasks and projects throughout the day. The app runs entirely in your browser and stores your data locally, ensuring privacy and offline access.

## Features

- Add, edit, and delete projects and tasks
- Many-to-many relationship: link any task to any project
- Start, pause, resume, and end timers for tasks
- Only one timer can run at a time; no overlapping entries
- Day boundary is 4am local time (entries after midnight but before 4am count toward previous day)
- View totals for each task, each project, and each task per project for today
- Chronological log of all time entries for the day
- Generate a professional PDF timesheet for today’s work
- Modern, responsive, business-style UI (Bootstrap 5 + custom CSS)
- All data is stored in your browser (LocalStorage)

## User Instructions

1. **Open the App:**
	- Open `src/index.html` in your browser, or visit [http://localhost:3000/](http://localhost:3000/) if running the server.

2. **Manage Projects & Tasks:**
	- Add new projects and tasks using the forms provided.
	- Link/unlink tasks to projects using the checkboxes in the task list.

3. **Track Time:**
	- Select a project and a task, then use the Start, Pause, Resume, and End buttons to track your work.
	- Only one timer can be active at a time.

4. **View Totals:**
	- See summaries for today’s totals by project, by task, and by task per project in the right panel.

5. **Generate PDF Timesheet:**
	- Click the “Generate PDF Timesheet” button to download a summary of your work for the day.

## Admin Instructions (Deployment)

1. **Local Use (No Server):**
	- Open `src/index.html` directly in your browser.

2. **Run with Local Server:**
	- Install Node.js if not already installed.
	- In the project directory, run:
	  ```
	  node server.js
	  ```
	- Open [http://localhost:3000/](http://localhost:3000/) in your browser.

3. **Production Deployment:**
	- Deploy the contents of the `src` directory to any static web server (e.g., Netlify, Vercel, GitHub Pages, Apache, Nginx).
	- No backend or database is required; all data is stored in the user’s browser.

## Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, jsPDF
- **Persistence:** LocalStorage (browser-based)
- **Server (optional):** Node.js static file server (`server.js`)
- **Testing:** Jest, jsdom (see `tests/` directory)

## Developer Notes

- All main logic is in `src/app.js`.
- UI is in `src/index.html` and styled with Bootstrap 5 and `src/style.css`.
- To run tests:
  1. Install dependencies: `npm install`
  2. Run tests: `npx jest`
- To extend the app:
  - Add new features in `app.js` and update the UI in `index.html` as needed.
  - For new data models, update LocalStorage logic and UI rendering functions.
  - For new reports or exports, add buttons and logic in `app.js`.
- The app is designed to be modular and easy to maintain. Contributions and improvements are welcome!
# time-tracking
