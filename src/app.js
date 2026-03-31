
// Only attach DOM event handlers if running in a browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const pdfBtn = document.getElementById('generate-pdf-btn');
  if (pdfBtn) {
    pdfBtn.onclick = function() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const today = getTodayString();
      let y = 10;
      doc.setFontSize(18);
      doc.text('Timesheet for ' + today, 14, y);
      y += 10;
      doc.setFontSize(12);

      // 1. Total time per task per project
      doc.text('Total Time per Task per Project', 14, y);
      y += 6;
      let taskPerProjectRows = [];
      const entries = timeEntries.filter(e => e.date === today && e.end);
      const taskPerProjectTotals = {};
      entries.forEach(e => {
        const key = `${e.projectId}__${e.taskId}`;
        taskPerProjectTotals[key] = (taskPerProjectTotals[key] || 0) + diffMinutes(e.start, e.end);
      });
      Object.entries(taskPerProjectTotals).forEach(([key, mins]) => {
        const [pid, tid] = key.split('__');
        const project = projects.find(p => p.id === pid);
        const task = tasks.find(t => t.id === tid);
        if (project && task) taskPerProjectRows.push([project.name, task.name, formatMinutes(mins)]);
      });
      if (taskPerProjectRows.length) {
        doc.autoTable({
          head: [['Project', 'Task', 'Time']],
          body: taskPerProjectRows,
          startY: y,
          theme: 'grid',
          styles: { fontSize: 10 }
        });
        y = doc.lastAutoTable.finalY + 6;
      } else {
        doc.text('No data.', 14, y);
        y += 8;
      }

      // 2. Total time per project
      doc.text('Total Time per Project', 14, y);
      y += 6;
      let projectRows = [];
      const projectTotals = {};
      entries.forEach(e => {
        projectTotals[e.projectId] = (projectTotals[e.projectId] || 0) + diffMinutes(e.start, e.end);
      });
      Object.entries(projectTotals).forEach(([pid, mins]) => {
        const project = projects.find(p => p.id === pid);
        if (project) projectRows.push([project.name, formatMinutes(mins)]);
      });
      if (projectRows.length) {
        doc.autoTable({
          head: [['Project', 'Time']],
          body: projectRows,
          startY: y,
          theme: 'grid',
          styles: { fontSize: 10 }
        });
        y = doc.lastAutoTable.finalY + 6;
      } else {
        doc.text('No data.', 14, y);
        y += 8;
      }

      // 3. Total time per task
      doc.text('Total Time per Task', 14, y);
      y += 6;
      let taskRows = [];
      const taskTotals = {};
      entries.forEach(e => {
        taskTotals[e.taskId] = (taskTotals[e.taskId] || 0) + diffMinutes(e.start, e.end);
      });
      Object.entries(taskTotals).forEach(([tid, mins]) => {
        const task = tasks.find(t => t.id === tid);
        if (task) taskRows.push([task.name, formatMinutes(mins)]);
      });
      if (taskRows.length) {
        doc.autoTable({
          head: [['Task', 'Time']],
          body: taskRows,
          startY: y,
          theme: 'grid',
          styles: { fontSize: 10 }
        });
        y = doc.lastAutoTable.finalY + 6;
      } else {
        doc.text('No data.', 14, y);
        y += 8;
      }

      // 4. Chronological list of tasks performed today
      doc.text('Chronological List of Tasks', 14, y);
      y += 6;
      let chronoRows = [];
      entries
        .slice()
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .forEach(e => {
          const project = projects.find(p => p.id === e.projectId);
          const task = tasks.find(t => t.id === e.taskId);
          if (project && task) {
            chronoRows.push([
              project.name,
              task.name,
              e.start.slice(11, 16),
              e.end.slice(11, 16),
              formatMinutes(diffMinutes(e.start, e.end))
            ]);
          }
        });
      if (chronoRows.length) {
        doc.autoTable({
          head: [['Project', 'Task', 'Start', 'End', 'Duration']],
          body: chronoRows,
          startY: y,
          theme: 'grid',
          styles: { fontSize: 10 }
        });
        y = doc.lastAutoTable.finalY + 6;
      } else {
        doc.text('No data.', 14, y);
        y += 8;
      }

      doc.save('timesheet_' + today + '.pdf');
    };
  }
}


// Export pure logic for testing (must be at the very end of the file)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    diffMinutes,
    formatMinutes,
    getTodayString,
    load,
    save,
    startTimer,
    endTimer,
    getRunningEntry,
    renderProjects,
    renderTasks,
    projects,
    tasks,
    timeEntries,
    projectTasks
  };
}
// Time Tracking App - MVP
// Data keys
const PROJECTS_KEY = 'projects';
const TASKS_KEY = 'tasks';
const PROJECT_TASKS_KEY = 'projectTasks';
const ENTRIES_KEY = 'timeEntries';
const NO_PROJECT_ID = 'no-project';
const NO_PROJECT_NAME = 'No Project';

// Utility: UUID
function uuid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// Utility: Get local date string (YYYY-MM-DD) with 4am boundary
function getTodayString() {
  const now = new Date();
  let day = new Date(now);
  if (now.getHours() < 4) {
    day.setDate(day.getDate() - 1);
  }
  return day.toISOString().slice(0,10);
}

// Utility: Format minutes as HH:MM
function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
}

// Storage helpers
function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Data
let projects = load(PROJECTS_KEY, []);
let tasks = load(TASKS_KEY, []);
let projectTasks = load(PROJECT_TASKS_KEY, []); // {projectId, taskId}
let timeEntries = load(ENTRIES_KEY, []);

// Ensure No Project exists
if (!projects.some(p => p.id === NO_PROJECT_ID)) {
  projects.unshift({ id: NO_PROJECT_ID, name: NO_PROJECT_NAME });
  save(PROJECTS_KEY, projects);
}
// Ensure all tasks are linked to No Project if not linked elsewhere
tasks.forEach(task => {
  if (!projectTasks.some(pt => pt.taskId === task.id)) {
    projectTasks.push({ projectId: NO_PROJECT_ID, taskId: task.id });
  }
});
save(PROJECT_TASKS_KEY, projectTasks);

// State
let selectedProjectId = NO_PROJECT_ID;
let selectedTaskId = null;
let timer = null; // { entryId, start, pausedAt, isPaused }

// DOM
const projectList = document.getElementById('project-list');
const addProjectForm = document.getElementById('add-project-form');
const newProjectName = document.getElementById('new-project-name');
const taskList = document.getElementById('task-list');
const addTaskForm = document.getElementById('add-task-form');
const newTaskName = document.getElementById('new-task-name');
const currentTaskInfo = document.getElementById('current-task-info');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const endBtn = document.getElementById('end-btn');
const totalsContent = document.getElementById('totals-content');

// Render
function renderProjects() {
  projectList.innerHTML = '';
  projects.forEach(project => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center' + (project.id === selectedProjectId ? ' active' : '');
    li.style.cursor = 'pointer';
    li.onclick = () => {
      selectedProjectId = project.id;
      renderProjects();
      renderTasks();
    };
    const span = document.createElement('span');
    span.textContent = project.name;
    li.appendChild(span);
    if (project.id !== NO_PROJECT_ID) {
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-sm btn-outline-danger ms-auto';
      delBtn.textContent = '🗑';
      delBtn.title = 'Delete project';
      delBtn.onclick = e => {
        e.stopPropagation();
        if (confirm('Delete this project?')) {
          projectTasks = projectTasks.filter(pt => pt.projectId !== project.id);
          projects = projects.filter(p => p.id !== project.id);
          save(PROJECTS_KEY, projects);
          save(PROJECT_TASKS_KEY, projectTasks);
          if (selectedProjectId === project.id) selectedProjectId = NO_PROJECT_ID;
          renderProjects();
          renderTasks();
        }
      };
      li.appendChild(delBtn);
    }
    projectList.appendChild(li);
  });
}

function renderTasks() {
  taskList.innerHTML = '';
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center' + (task.id === selectedTaskId ? ' active' : '');
    li.style.cursor = 'pointer';
    // Checkbox for linking/unlinking this task to the selected project (except No Project)
    if (selectedProjectId !== NO_PROJECT_ID) {
      const linked = projectTasks.some(pt => pt.projectId === selectedProjectId && pt.taskId === task.id);
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = linked;
      cb.className = 'form-check-input me-2';
      cb.title = linked ? 'Unlink from project' : 'Link to project';
      cb.onclick = e => {
        e.stopPropagation();
        if (cb.checked) {
          projectTasks.push({ projectId: selectedProjectId, taskId: task.id });
        } else {
          projectTasks = projectTasks.filter(pt => !(pt.projectId === selectedProjectId && pt.taskId === task.id));
        }
        save(PROJECT_TASKS_KEY, projectTasks);
        renderTasks();
      };
      li.appendChild(cb);
    }
    const span = document.createElement('span');
    span.textContent = task.name;
    li.appendChild(span);
    li.onclick = () => {
      selectedTaskId = task.id;
      renderTasks();
      renderCurrentTaskInfo();
    };
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-sm btn-outline-danger ms-auto';
    delBtn.textContent = '🗑';
    delBtn.title = 'Delete task';
    delBtn.onclick = e => {
      e.stopPropagation();
      if (confirm('Delete this task?')) {
        tasks = tasks.filter(t => t.id !== task.id);
        projectTasks = projectTasks.filter(pt => pt.taskId !== task.id);
        timeEntries = timeEntries.filter(e => e.taskId !== task.id);
        save(TASKS_KEY, tasks);
        save(PROJECT_TASKS_KEY, projectTasks);
        save(ENTRIES_KEY, timeEntries);
        if (selectedTaskId === task.id) selectedTaskId = null;
        renderTasks();
        renderCurrentTaskInfo();
        renderTotals();
      }
    };
    li.appendChild(delBtn);
    taskList.appendChild(li);
  });
}

function renderCurrentTaskInfo() {
  if (!selectedTaskId) {
    currentTaskInfo.textContent = 'No task selected.';
    startBtn.disabled = true;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    endBtn.disabled = true;
    return;
  }
  const task = tasks.find(t => t.id === selectedTaskId);
  const project = projects.find(p => p.id === selectedProjectId);
  if (task && project) {
    currentTaskInfo.innerHTML = `<span class=\"fw-bold\">${task.name}</span> <span class=\"text-secondary\">(${project.name})</span>`;
  } else {
    currentTaskInfo.textContent = 'No task selected.';
  }
  // Timer controls
  const runningEntry = getRunningEntry();
  if (!selectedTaskId) {
    startBtn.disabled = true;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    endBtn.disabled = true;
    return;
  }
  if (runningEntry && runningEntry.taskId === selectedTaskId) {
    startBtn.disabled = true;
    pauseBtn.disabled = !!runningEntry.isPaused;
    resumeBtn.disabled = !runningEntry.isPaused;
    endBtn.disabled = false;
  } else if (runningEntry) {
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    endBtn.disabled = true;
  } else {
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    endBtn.disabled = true;
  }
}

function renderTotals() {
  const today = getTodayString();
  // Only entries for today
  const entries = timeEntries.filter(e => e.date === today && e.end);
  // Per task
  const taskTotals = {};
  entries.forEach(e => {
    taskTotals[e.taskId] = (taskTotals[e.taskId] || 0) + diffMinutes(e.start, e.end);
  });
  // Per project
  const projectTotals = {};
  entries.forEach(e => {
    projectTotals[e.projectId] = (projectTotals[e.projectId] || 0) + diffMinutes(e.start, e.end);
  });
  // Task per project
  const taskPerProjectTotals = {};
  entries.forEach(e => {
    const key = `${e.projectId}__${e.taskId}`;
    taskPerProjectTotals[key] = (taskPerProjectTotals[key] || 0) + diffMinutes(e.start, e.end);
  });
  // Render
  let html = '<div class="mb-2 fw-semibold">Per Task</div><ul class="list-group mb-3">';
  Object.entries(taskTotals).forEach(([tid, mins]) => {
    const task = tasks.find(t => t.id === tid);
    if (task) html += `<li class="list-group-item d-flex justify-content-between align-items-center">${task.name}<span class="badge bg-primary rounded-pill">${formatMinutes(mins)}</span></li>`;
  });
  html += '</ul><div class="mb-2 fw-semibold">Per Project</div><ul class="list-group mb-3">';
  Object.entries(projectTotals).forEach(([pid, mins]) => {
    const project = projects.find(p => p.id === pid);
    if (project) html += `<li class="list-group-item d-flex justify-content-between align-items-center">${project.name}<span class="badge bg-success rounded-pill">${formatMinutes(mins)}</span></li>`;
  });
  html += '</ul><div class="mb-2 fw-semibold">Task per Project</div><ul class="list-group">';
  Object.entries(taskPerProjectTotals).forEach(([key, mins]) => {
    const [pid, tid] = key.split('__');
    const project = projects.find(p => p.id === pid);
    const task = tasks.find(t => t.id === tid);
    if (project && task) html += `<li class="list-group-item d-flex justify-content-between align-items-center">${project.name} / ${task.name}<span class="badge bg-secondary rounded-pill">${formatMinutes(mins)}</span></li>`;
  });
  html += '</ul>';
  totalsContent.innerHTML = html;
}

// Timer logic
function getRunningEntry() {
  return timeEntries.find(e => e.end === null);
}
function diffMinutes(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.floor((e - s) / 60000);
}
function startTimer() {
  // End any running entry
  const running = getRunningEntry();
  if (running) {
    endTimer(true);
  }
  if (!selectedTaskId) return;
  const task = tasks.find(t => t.id === selectedTaskId);
  const project = projects.find(p => p.id === selectedProjectId);
  const entry = {
    id: uuid(),
    taskId: task.id,
    projectId: project.id,
    start: new Date().toISOString().slice(0,16),
    end: null,
    date: getTodayString(),
    isPaused: false,
    pausedAt: null
  };
  timeEntries.push(entry);
  save(ENTRIES_KEY, timeEntries);
  renderCurrentTaskInfo();
  renderTotals();
}
function pauseTimer() {
  const running = getRunningEntry();
  if (running && !running.isPaused) {
    running.isPaused = true;
    running.pausedAt = new Date().toISOString().slice(0,16);
    save(ENTRIES_KEY, timeEntries);
    renderCurrentTaskInfo();
  }
}
function resumeTimer() {
  const running = getRunningEntry();
  if (running && running.isPaused) {
    // Add paused duration to start time
    const pausedAt = new Date(running.pausedAt);
    const now = new Date();
    const pausedMins = Math.floor((now - pausedAt) / 60000);
    running.start = new Date(new Date(running.start).getTime() + pausedMins * 60000).toISOString().slice(0,16);
    running.isPaused = false;
    running.pausedAt = null;
    save(ENTRIES_KEY, timeEntries);
    renderCurrentTaskInfo();
  }
}
function endTimer(switching = false) {
  const running = getRunningEntry();
  if (running) {
    running.end = new Date().toISOString().slice(0,16);
    // If entry is <1 minute, delete it
    if (diffMinutes(running.start, running.end) < 1) {
      timeEntries = timeEntries.filter(e => e.id !== running.id);
    }
    save(ENTRIES_KEY, timeEntries);
    renderCurrentTaskInfo();
    renderTotals();
  }
  if (!switching) {
    selectedTaskId = null;
    renderTasks();
  }
}

// Event listeners
addProjectForm.onsubmit = e => {
  e.preventDefault();
  const name = newProjectName.value.trim().slice(0,50);
  if (!name || projects.some(p => p.name === name)) return;
  const id = uuid();
  projects.push({ id, name });
  save(PROJECTS_KEY, projects);
  newProjectName.value = '';
  renderProjects();
};
addTaskForm.onsubmit = e => {
  e.preventDefault();
  const name = newTaskName.value.trim().slice(0,50);
  if (!name) return;
  const id = uuid();
  tasks.push({ id, name });
  // Link to selected project (or No Project)
  const projectId = selectedProjectId || NO_PROJECT_ID;
  projectTasks.push({ projectId, taskId: id });
  save(TASKS_KEY, tasks);
  save(PROJECT_TASKS_KEY, projectTasks);
  newTaskName.value = '';
  renderTasks();
};
startBtn.onclick = startTimer;
pauseBtn.onclick = pauseTimer;
resumeBtn.onclick = resumeTimer;
endBtn.onclick = () => endTimer(false);

// Initial render
renderProjects();
renderTasks();
renderCurrentTaskInfo();
renderTotals();

// Periodic update for timer display
setInterval(() => {
  renderCurrentTaskInfo();
  renderTotals();
}, 60000);
