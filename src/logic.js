// Pure logic for time-tracking app (testable, no DOM)

// Utility: UUID
function uuid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ Math.random() * 16 >> c / 4).toString(16)
  );
}

// Utility: Get local date string (YYYY-MM-DD) with 4am boundary
function getTodayString(now = new Date()) {
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

// Storage helpers (mockable for tests)
function load(key, fallback) {
  if (typeof localStorage !== 'undefined') {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}
function save(key, value) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

// Timer logic
function diffMinutes(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.floor((e - s) / 60000);
}

module.exports = {
  uuid,
  getTodayString,
  formatMinutes,
  load,
  save,
  diffMinutes
};
